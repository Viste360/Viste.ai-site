import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { evaluateCallPolicy, countryFromE164, VOICE_POLICY_VERSION } from "@/lib/voice/compliance/policy-engine";
import { VOICE_DISCLOSURE_VERSION } from "@/lib/voice/compliance/disclosures";
import { getVoiceConfig, VISTE_TENANT_ID } from "@/lib/voice/config";
import { voiceAdmin } from "@/lib/voice/database";
import { demoConsentWording, voiceDemoRequestSchema } from "@/lib/voice/demo";
import { ElevenLabsVoiceProvider } from "@/lib/voice/providers/elevenlabs";
import { hashTelephone } from "@/lib/voice/security";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
}

export async function POST(request: NextRequest) {
  const config = getVoiceConfig();
  if (!config.enabled || config.globalKillSwitch) return json({ error: "The VISTE Voice demo is not accepting calls right now" }, 503);
  if (!validOrigin(request)) return json({ error: "Invalid origin" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Unsupported content type" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 12_000) return json({ error: "Request too large" }, 413);

  const parsed = voiceDemoRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Please review the requested demo details" }, 400);
  const input = parsed.data;
  if (input.faxNumber) return json({ accepted: true, reference: randomUUID(), status: "queued" }, 202);
  if (Date.now() - input.startedAt < 2_000) return json({ error: "Please take a moment to review the request" }, 429);
  if (!config.phoneHashSalt) return json({ error: "The secure callback service is not fully configured" }, 503);

  const turnstile = await verifyTurnstileToken({ token: input.turnstileToken, idempotencyKey: randomUUID(), expectedAction: "viste_voice_callback" });
  if (!turnstile.success) return json({ error: "Please complete the anti-spam check" }, 403);

  const admin = voiceAdmin();
  if (!admin) return json({ error: "The secure callback service is unavailable" }, 503);

  const id = randomUUID();
  const phoneHash = hashTelephone(input.phoneE164, config.phoneHashSalt);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(`${config.phoneHashSalt}:${ip}`).digest("hex");
  const expiresAt = new Date(Date.now() + config.demoDataTtlDays * 86_400_000).toISOString();
  const consentWording = demoConsentWording(input.locale);
  const { data: creation, error: creationError } = await admin.rpc("create_viste_voice_demo_request", {
    p_payload: {
      id,
      firstName: input.firstName,
      businessName: input.businessName,
      websiteUrl: input.websiteUrl,
      phoneE164: input.phoneE164,
      phoneHash,
      preferredLanguage: input.preferredLanguage,
      consentWording,
      consentProof: {
        version: input.consentVersion,
        shownLocale: input.locale,
        capturedAt: new Date().toISOString(),
        ipHash,
        turnstileConfigured: turnstile.configured,
        turnstileHostname: "hostname" in turnstile ? turnstile.hostname : undefined,
      },
      policyVersion: VOICE_POLICY_VERSION,
      expiresAt,
    },
  });
  const result = creation as { accepted?: boolean; reason?: string } | null;
  if (creationError) return json({ error: "The callback request could not be saved" }, 503);
  if (!result?.accepted) {
    const rateLimited = result?.reason === "daily_limit" || result?.reason === "monthly_limit";
    return json({ error: rateLimited ? "This number has reached the demo-call limit" : "A call cannot be placed to this number" }, rateLimited ? 429 : 409);
  }

  const policyDecision = evaluateCallPolicy({
    enabled: config.enabled,
    globalKillSwitch: config.globalKillSwitch,
    policyReviewed: config.outboundPolicyReviewed,
    direction: "outbound",
    purpose: "requested_callback",
    countryCode: countryFromE164(input.phoneE164),
    numberType: process.env.VOICE_OUTBOUND_NUMBER_TYPE,
    consentStatus: "granted",
    consentExpiresAt: new Date(expiresAt),
    suppressed: false,
  });

  await admin.from("voice_outbound_call_checks").insert({
    tenant_id: VISTE_TENANT_ID,
    phone_hash: phoneHash,
    purpose: "requested_callback",
    policy_version: policyDecision.policyVersion,
    decision: policyDecision.allowed ? "allow" : "deny",
    reasons: policyDecision.reasons,
    checked_at: policyDecision.checkedAt,
  });

  if (!policyDecision.allowed || !config.elevenLabsApiKey || !config.elevenLabsWebhookSecret || !config.veraAgentId || !config.veraPhoneNumberId) {
    await admin.from("voice_demo_requests").update({ status: policyDecision.allowed ? "queued" : "policy_denied", updated_at: new Date().toISOString() }).eq("id", id);
    return json({ accepted: true, reference: id, status: "queued" }, 202);
  }

  try {
    const provider = new ElevenLabsVoiceProvider({ apiKey: config.elevenLabsApiKey, webhookSecret: config.elevenLabsWebhookSecret });
    const call = await provider.startOutboundCall({
      externalAgentId: config.veraAgentId,
      externalPhoneNumberId: config.veraPhoneNumberId,
      toNumber: input.phoneE164,
      policyDecision,
      recordingEnabled: false,
      dynamicVariables: {
        first_name: input.firstName,
        business_name: input.businessName,
        website_url: input.websiteUrl,
        preferred_language: input.preferredLanguage,
        consent_source: "voice.viste.ai requested demo",
        disclosure_version: VOICE_DISCLOSURE_VERSION,
      },
    });
    await Promise.all([
      admin.from("voice_demo_requests").update({ provider_call_id: call.externalId, status: "calling", updated_at: new Date().toISOString() }).eq("id", id),
      admin.from("voice_calls").insert({
        tenant_id: VISTE_TENANT_ID,
        agent_id: "20000000-0000-4000-8000-000000000010",
        provider: "elevenlabs",
        provider_call_id: call.externalId,
        telephony_call_id: call.telephonyCallId,
        direction: "outbound",
        purpose: "requested_callback",
        to_number_hash: phoneHash,
        disclosure_version: VOICE_DISCLOSURE_VERSION,
        status: call.status,
        started_at: new Date().toISOString(),
      }),
    ]);
    return json({ accepted: true, reference: id, status: "calling" }, 201);
  } catch {
    await admin.from("voice_demo_requests").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", id);
    return json({ accepted: true, reference: id, status: "queued" }, 202);
  }
}
