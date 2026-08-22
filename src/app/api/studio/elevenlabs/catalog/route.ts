import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authoriseStudioRequest } from "@/lib/studio-assets";

export const runtime = "nodejs";

const sampleSchema = z.object({ voiceId: z.string().trim().min(3).max(160) });

type ProviderVoice = {
  voice_id?: unknown;
  name?: unknown;
  category?: unknown;
  description?: unknown;
  preview_url?: unknown;
  labels?: unknown;
  verified_languages?: unknown;
  high_quality_base_model_ids?: unknown;
};

type ProviderModel = {
  model_id?: unknown;
  name?: unknown;
  description?: unknown;
  can_do_text_to_speech?: unknown;
  requires_alpha_access?: unknown;
  languages?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function providerLanguages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as { language?: unknown; language_id?: unknown };
    const code = text(entry.language) || text(entry.language_id);
    return code ? [code] : [];
  });
}

export async function GET(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.includes("example")) return NextResponse.json({ error: "ElevenLabs is not configured for this environment" }, { status: 503 });

  const headers = { "xi-api-key": apiKey, Accept: "application/json" };
  const [voiceResponse, modelResponse] = await Promise.all([
    fetch("https://api.elevenlabs.io/v2/voices?page_size=100&include_total_count=false", { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null),
    fetch("https://api.elevenlabs.io/v1/models", { headers, cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null),
  ]);
  if (voiceResponse?.status === 401 || modelResponse?.status === 401) return NextResponse.json({ error: "ElevenLabs rejected the configured API key. Replace it in Vercel, then try again." }, { status: 502 });
  if (!voiceResponse?.ok || !modelResponse?.ok) return NextResponse.json({ error: "ElevenLabs could not return the available voices and models" }, { status: 502 });

  const voicePayload = await voiceResponse.json().catch(() => null) as { voices?: ProviderVoice[] } | null;
  const modelPayload = await modelResponse.json().catch(() => null) as ProviderModel[] | null;
  const voices = Array.isArray(voicePayload?.voices) ? voicePayload.voices.flatMap((voice) => {
    const voiceId = text(voice.voice_id);
    const name = text(voice.name);
    if (!voiceId || !name) return [];
    const labels = voice.labels && typeof voice.labels === "object" && !Array.isArray(voice.labels)
      ? Object.fromEntries(Object.entries(voice.labels).flatMap(([key, value]) => typeof value === "string" ? [[key, value]] : []))
      : {};
    return [{
      voiceId,
      name,
      category: text(voice.category) || "generated",
      description: text(voice.description),
      previewUrl: text(voice.preview_url),
      labels,
      languages: providerLanguages(voice.verified_languages),
      highQualityModelIds: Array.isArray(voice.high_quality_base_model_ids) ? voice.high_quality_base_model_ids.filter((id): id is string => typeof id === "string") : [],
    }];
  }) : [];
  const models = Array.isArray(modelPayload) ? modelPayload.flatMap((model) => {
    const modelId = text(model.model_id);
    const name = text(model.name);
    if (!modelId || !name || model.can_do_text_to_speech !== true || model.requires_alpha_access === true) return [];
    return [{ modelId, name, description: text(model.description), languages: providerLanguages(model.languages) }];
  }) : [];

  return NextResponse.json({ voices, models }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const parsed = sampleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select an ElevenLabs voice" }, { status: 400 });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.includes("example")) return NextResponse.json({ error: "ElevenLabs is not configured for this environment" }, { status: 503 });
  const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(parsed.data.voiceId)}`, { headers: { "xi-api-key": apiKey, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (voiceResponse?.status === 401) return NextResponse.json({ error: "ElevenLabs rejected the configured API key" }, { status: 502 });
  if (!voiceResponse?.ok) return NextResponse.json({ error: "That ElevenLabs voice is unavailable" }, { status: 404 });
  const voice = await voiceResponse.json().catch(() => null) as { preview_url?: unknown } | null;
  if (typeof voice?.preview_url !== "string") return NextResponse.json({ error: "This voice does not include a sample" }, { status: 404 });
  let previewUrl: URL;
  try { previewUrl = new URL(voice.preview_url); } catch { return NextResponse.json({ error: "ElevenLabs returned an invalid sample URL" }, { status: 502 }); }
  const approvedHost = previewUrl.hostname === "storage.googleapis.com" || previewUrl.hostname.endsWith(".elevenlabs.io");
  if (previewUrl.protocol !== "https:" || !approvedHost) return NextResponse.json({ error: "ElevenLabs returned an unsupported sample URL" }, { status: 502 });
  const sample = await fetch(previewUrl, { cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!sample?.ok) return NextResponse.json({ error: "The ElevenLabs sample is unavailable" }, { status: 502 });
  return new NextResponse(await sample.arrayBuffer(), { headers: { "Content-Type": sample.headers.get("content-type") || "audio/mpeg", "Cache-Control": "private, no-store", "Content-Disposition": "inline; filename=elevenlabs-sample.mp3" } });
}
