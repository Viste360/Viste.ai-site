import { NextRequest, NextResponse } from "next/server";
import { VOICE_DISCLOSURE_VERSION } from "@/lib/voice/compliance/disclosures";
import { getVoiceConfig, VISTE_TENANT_ID } from "@/lib/voice/config";
import { voiceAdmin } from "@/lib/voice/database";
import { ElevenLabsVoiceProvider } from "@/lib/voice/providers/elevenlabs";

export const runtime = "nodejs";

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown) { return typeof value === "string" ? value : undefined; }
function numeric(value: unknown) { return typeof value === "number" && Number.isFinite(value) ? value : undefined; }

export async function POST(request: NextRequest) {
  const config = getVoiceConfig();
  if (!config.elevenLabsApiKey || !config.elevenLabsWebhookSecret) return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const rawBody = await request.text();
  if (rawBody.length > 2_000_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const provider = new ElevenLabsVoiceProvider({ apiKey: config.elevenLabsApiKey, webhookSecret: config.elevenLabsWebhookSecret });
  let event;
  try {
    event = await provider.verifyWebhook({ rawBody, signatureHeader: request.headers.get("elevenlabs-signature") });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const admin = voiceAdmin();
  if (!admin) return NextResponse.json({ error: "Webhook storage unavailable" }, { status: 503 });

  const knownVera = event.agentExternalId && event.agentExternalId === config.veraAgentId;
  const { data: mappedAgent } = event.agentExternalId
    ? await admin.from("voice_agents").select("id,tenant_id").eq("provider", "elevenlabs").eq("provider_agent_id", event.agentExternalId).maybeSingle()
    : { data: null };
  const agent = mappedAgent || (knownVera ? { id: "20000000-0000-4000-8000-000000000010", tenant_id: VISTE_TENANT_ID } : null);
  if (!agent) return NextResponse.json({ received: true, ignored: "unmapped_agent" });

  let callId: string | null = null;
  if (event.callExternalId) {
    const { data: existing } = await admin.from("voice_calls").select("id").eq("provider", "elevenlabs").eq("provider_call_id", event.callExternalId).maybeSingle();
    callId = existing?.id || null;
    if (!callId) {
      const payload = object(JSON.parse(rawBody));
      const data = object(payload.data);
      const metadata = object(data.metadata);
      const phoneCall = object(metadata.phone_call);
      const directionValue = text(phoneCall.direction) || text(metadata.direction) || "inbound";
      const { data: created } = await admin.from("voice_calls").upsert({
        tenant_id: agent.tenant_id,
        agent_id: agent.id,
        provider: "elevenlabs",
        provider_call_id: event.callExternalId,
        direction: directionValue.includes("outbound") ? "outbound" : "inbound",
        purpose: directionValue.includes("outbound") ? "requested_callback" : "inbound_service",
        disclosure_version: VOICE_DISCLOSURE_VERSION,
        status: event.eventType,
        duration_seconds: numeric(metadata.call_duration_secs),
        started_at: numeric(metadata.start_time_unix_secs) ? new Date(Number(metadata.start_time_unix_secs) * 1_000).toISOString() : null,
      }, { onConflict: "provider,provider_call_id", ignoreDuplicates: true }).select("id").maybeSingle();
      callId = created?.id || null;
    }
  }

  const { error } = await admin.from("voice_call_events").upsert({
    tenant_id: agent.tenant_id,
    call_id: callId,
    provider: "elevenlabs",
    provider_event_id: event.eventId,
    event_type: event.eventType,
    occurred_at: event.occurredAt,
    payload_redacted: event.redactedPayload,
    idempotency_key: `elevenlabs:${event.eventId}`,
  }, { onConflict: "provider,provider_event_id", ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: "Webhook persistence failed" }, { status: 503 });
  return NextResponse.json({ received: true });
}
