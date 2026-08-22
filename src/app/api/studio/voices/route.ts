import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest } from "@/lib/studio-assets";
import { voiceRegistrationSchema } from "@/lib/studio-campaigns";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const { data, error } = await auth.admin.from("brand_voices").select("id,brand_id,name,provider,provider_voice_id,voice_type,language_codes,model_id").eq("tenant_id", auth.tenantId).eq("status", "approved").order("name");
  if (error) return NextResponse.json({ error: "Approved voices are unavailable" }, { status: 503 });
  return NextResponse.json({ voices: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  if (auth.role !== "owner" && auth.role !== "admin") return NextResponse.json({ error: "Owner or admin access is required to approve a voice" }, { status: 403 });
  const parsed = voiceRegistrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Complete the voice ID, language and rights record" }, { status: 400 });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.includes("example")) return NextResponse.json({ error: "ElevenLabs is not configured for this environment" }, { status: 503 });
  const { data: brand } = await auth.admin.from("brands").select("id").eq("tenant_id", auth.tenantId).eq("id", parsed.data.brandId).maybeSingle();
  if (!brand) return NextResponse.json({ error: "Select a brand in this workspace" }, { status: 404 });

  const providerHeaders = { "xi-api-key": apiKey, Accept: "application/json" };
  const [providerVoice, providerModels] = await Promise.all([
    fetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(parsed.data.providerVoiceId)}`, { headers: providerHeaders, cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null),
    fetch("https://api.elevenlabs.io/v1/models", { headers: providerHeaders, cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null),
  ]);
  if (!providerVoice?.ok) return NextResponse.json({ error: "That voice ID is not available in the configured ElevenLabs account" }, { status: 409 });
  if (!providerModels?.ok) return NextResponse.json({ error: "ElevenLabs models are unavailable" }, { status: 502 });
  const providerData = await providerVoice.json().catch(() => null) as { name?: unknown; category?: unknown; settings?: unknown } | null;
  const modelsData = await providerModels.json().catch(() => null) as Array<{ model_id?: unknown; can_do_text_to_speech?: unknown }> | null;
  const name = typeof providerData?.name === "string" ? providerData.name.trim().slice(0, 120) : "";
  const voiceType = typeof providerData?.category === "string" && ["premade", "professional", "cloned", "generated"].includes(providerData.category) ? providerData.category as "premade" | "professional" | "cloned" | "generated" : null;
  const modelAvailable = Array.isArray(modelsData) && modelsData.some((model) => model.model_id === parsed.data.modelId && model.can_do_text_to_speech === true);
  if (!name || !voiceType) return NextResponse.json({ error: "ElevenLabs returned an unsupported voice type" }, { status: 409 });
  if (!modelAvailable) return NextResponse.json({ error: "Select a text-to-speech model available to this ElevenLabs account" }, { status: 409 });
  const consentBased = voiceType === "professional" || voiceType === "cloned";
  if (consentBased && parsed.data.rightsReference.trim().length < 3) return NextResponse.json({ error: "Add the consent reference for this cloned or professional voice" }, { status: 400 });
  const providerSettings = providerData?.settings && typeof providerData.settings === "object" && !Array.isArray(providerData.settings) ? providerData.settings : {};
  const { data: voice, error } = await auth.admin.from("brand_voices").upsert({
    tenant_id: auth.tenantId,
    brand_id: brand.id,
    provider: "elevenlabs",
    provider_voice_id: parsed.data.providerVoiceId,
    name,
    voice_type: voiceType,
    language_codes: parsed.data.languageCodes,
    licence_reference: consentBased ? null : (parsed.data.rightsReference || `ElevenLabs account catalogue: ${parsed.data.providerVoiceId}`),
    consent_reference: consentBased ? parsed.data.rightsReference : null,
    status: "approved",
    model_id: parsed.data.modelId,
    settings: providerSettings,
    created_by: auth.user.id,
  }, { onConflict: "tenant_id,provider,provider_voice_id" }).select("id,brand_id,name,provider,provider_voice_id,voice_type,language_codes,model_id").single();
  if (error || !voice) return NextResponse.json({ error: "Could not save the approved voice" }, { status: 503 });
  return NextResponse.json({ voice }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
