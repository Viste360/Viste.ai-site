import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authoriseStudioRequest } from "@/lib/studio-assets";
import { voicePreviewSchema } from "@/lib/studio-campaigns";

export const runtime = "nodejs";
export const maxDuration = 60;

const voiceSettingsSchema = z.object({
  stability: z.number().min(0).max(1).optional(),
  similarity_boost: z.number().min(0).max(1).optional(),
  style: z.number().min(0).max(1).optional(),
  use_speaker_boost: z.boolean().optional(),
}).strip();

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const parsed = voicePreviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select an approved voice and valid preview text" }, { status: 400 });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.includes("example")) return NextResponse.json({ error: "ElevenLabs is not configured for this environment" }, { status: 503 });

  const { data: voice, error } = await auth.admin.from("brand_voices")
    .select("provider_voice_id,provider,voice_type,language_codes,licence_reference,consent_reference,settings,model_id")
    .eq("tenant_id", auth.tenantId).eq("id", parsed.data.voiceId).eq("status", "approved").maybeSingle();
  if (error || !voice || voice.provider !== "elevenlabs") return NextResponse.json({ error: "This voice is not approved for ElevenLabs previews" }, { status: 403 });
  const hasRights = ["premade", "generated"].includes(voice.voice_type) ? Boolean(voice.licence_reference) : Boolean(voice.consent_reference);
  if (!hasRights || !voice.language_codes.includes(parsed.data.language)) return NextResponse.json({ error: "Voice rights or language approval is missing" }, { status: 403 });
  const settings = voiceSettingsSchema.safeParse(voice.settings);

  const speech = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.provider_voice_id)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: parsed.data.text, model_id: voice.model_id || process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2", ...(settings.success && Object.keys(settings.data).length ? { voice_settings: settings.data } : {}) }),
    signal: AbortSignal.timeout(55_000),
  }).catch(() => null);
  if (!speech) return NextResponse.json({ error: "Voice preview timed out" }, { status: 504 });
  if (!speech.ok) return NextResponse.json({ error: "ElevenLabs could not create this preview" }, { status: 502 });
  return new NextResponse(await speech.arrayBuffer(), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store", "Content-Disposition": "inline; filename=voice-preview.mp3" } });
}
