import { NextRequest, NextResponse } from "next/server";
import { getVoiceConfig } from "@/lib/voice/config";
import { voiceAdmin } from "@/lib/voice/database";
import { hashTelephone, verifyVoiceToolBearer, verifyVoiceToolSignature } from "@/lib/voice/security";
import { recordOptOutToolSchema } from "@/lib/voice/tools/contracts";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signingSecret = process.env.VOICE_TOOL_SIGNING_SECRET?.trim();
  const bearerSecret = process.env.VOICE_TOOL_BEARER_TOKEN?.trim();
  const config = getVoiceConfig();
  const rawBody = await request.text();
  const bearerAuthorized = Boolean(bearerSecret) && verifyVoiceToolBearer({
    authorizationHeader: request.headers.get("authorization"),
    secret: bearerSecret || "",
  });
  const signatureAuthorized = Boolean(signingSecret) && verifyVoiceToolSignature({
    rawBody,
    timestampHeader: request.headers.get("x-viste-timestamp"),
    signatureHeader: request.headers.get("x-viste-signature"),
    secret: signingSecret || "",
  });
  if (!config.phoneHashSalt || (!bearerAuthorized && !signatureAuthorized)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = recordOptOutToolSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const agentExternalId = request.headers.get("x-viste-agent-id");
  if (!agentExternalId) return NextResponse.json({ error: "Missing agent" }, { status: 400 });
  const admin = voiceAdmin();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const { data: agent } = await admin.from("voice_agents").select("id,tenant_id").eq("provider_agent_id", agentExternalId).maybeSingle();
  if (!agent) return NextResponse.json({ error: "Unknown agent" }, { status: 403 });
  const phoneHash = hashTelephone(parsed.data.phoneE164, config.phoneHashSalt);
  const { data: previous } = await admin.from("voice_tool_runs").select("response_redacted").eq("tenant_id", agent.tenant_id).eq("idempotency_key", parsed.data.idempotencyKey).maybeSingle();
  if (previous) return NextResponse.json(previous.response_redacted);
  const now = new Date().toISOString();
  const { error } = await admin.from("suppression_entries").upsert({
    tenant_id: agent.tenant_id,
    contact_id: null,
    phone_hash: phoneHash,
    channel: "phone",
    scope: parsed.data.scope,
    reason: "caller_opt_out",
    created_at: now,
  }, { onConflict: "tenant_id,phone_hash,channel,scope" });
  if (error) return NextResponse.json({ error: "Opt-out could not be recorded" }, { status: 503 });
  const response = { success: true, effectiveAt: now };
  await Promise.all([
    admin.from("voice_tool_runs").insert({
      tenant_id: agent.tenant_id,
      agent_id: agent.id,
      tool_name: "record_opt_out",
      idempotency_key: parsed.data.idempotencyKey,
      request_redacted: { phoneHash, scope: parsed.data.scope },
      response_redacted: response,
      status: "succeeded",
    }),
    admin.from("audit_logs").insert({
      tenant_id: agent.tenant_id,
      actor_type: "provider",
      action: "voice.opt_out_recorded",
      entity_type: "suppression_entry",
      metadata: { phoneHash, scope: parsed.data.scope },
    }),
  ]);
  return NextResponse.json(response);
}
