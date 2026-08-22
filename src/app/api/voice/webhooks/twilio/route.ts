import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { voiceAdmin } from "@/lib/voice/database";
import { getVoiceConfig } from "@/lib/voice/config";
import { verifyTwilioSignature } from "@/lib/voice/security";

export const runtime = "nodejs";

function externalUrl(request: NextRequest) {
  const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  return `${protocol}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export async function POST(request: NextRequest) {
  const config = getVoiceConfig();
  if (!config.twilioWebhookAuthToken) return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const rawBody = await request.text();
  if (rawBody.length > 100_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const parameters = new URLSearchParams(rawBody);
  if (!verifyTwilioSignature({ url: externalUrl(request), parameters, signatureHeader: request.headers.get("x-twilio-signature"), authToken: config.twilioWebhookAuthToken })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const callSid = parameters.get("CallSid");
  if (!callSid) return NextResponse.json({ error: "Missing call id" }, { status: 400 });
  const admin = voiceAdmin();
  if (!admin) return NextResponse.json({ error: "Webhook storage unavailable" }, { status: 503 });
  const { data: call } = await admin.from("voice_calls").select("id,tenant_id").eq("telephony_call_id", callSid).maybeSingle();
  if (!call) return NextResponse.json({ received: true, ignored: "unmapped_call" });
  const status = parameters.get("CallStatus") || "unknown";
  const timestamp = parameters.get("Timestamp") || new Date().toISOString();
  const eventId = createHash("sha256").update(`${callSid}:${status}:${timestamp}`).digest("hex");
  const duration = Number(parameters.get("CallDuration"));
  await Promise.all([
    admin.from("voice_call_events").upsert({
      tenant_id: call.tenant_id,
      call_id: call.id,
      provider: "twilio",
      provider_event_id: eventId,
      event_type: status,
      occurred_at: new Date(timestamp).toString() === "Invalid Date" ? new Date().toISOString() : new Date(timestamp).toISOString(),
      payload_redacted: { callSid, status, direction: parameters.get("Direction") || undefined },
      idempotency_key: `twilio:${eventId}`,
    }, { onConflict: "provider,provider_event_id", ignoreDuplicates: true }),
    admin.from("voice_calls").update({
      status,
      duration_seconds: Number.isFinite(duration) && duration >= 0 ? duration : undefined,
      ended_at: ["completed", "busy", "failed", "no-answer", "canceled"].includes(status) ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }).eq("id", call.id),
  ]);
  return NextResponse.json({ received: true });
}
