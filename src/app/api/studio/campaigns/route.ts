import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest } from "@/lib/studio-assets";
import { studioPreferenceSchema } from "@/lib/studio-campaigns";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });

  let brands = await auth.admin.from("brands").select("id,name,description,default_language,default_voice_id,default_tts_model_id").eq("tenant_id", auth.tenantId).order("name");
  if (!brands.error && !brands.data?.length) {
    await auth.admin.from("brands").upsert({
      tenant_id: auth.tenantId,
      name: "Viste.ai",
      website: "https://viste.ai",
      default_language: "en",
      supported_languages: ["en", "es"],
      created_by: auth.user.id,
    }, { onConflict: "tenant_id,name", ignoreDuplicates: true });
    brands = await auth.admin.from("brands").select("id,name,description,default_language,default_voice_id,default_tts_model_id").eq("tenant_id", auth.tenantId).order("name");
  }
  const [campaigns, voices] = await Promise.all([
    auth.admin.from("campaigns").select("id,brand_id,name,language,status,created_at").eq("tenant_id", auth.tenantId).order("created_at", { ascending: false }).limit(50),
    auth.admin.from("brand_voices").select("id,brand_id,name,provider,provider_voice_id,voice_type,language_codes,status,model_id").eq("tenant_id", auth.tenantId).eq("status", "approved").order("name"),
  ]);
  if (brands.error || campaigns.error || voices.error) return NextResponse.json({ error: "Studio campaigns are not ready. Apply the latest Studio migration first." }, { status: 503 });
  return NextResponse.json({ brands: brands.data, campaigns: campaigns.data, voices: voices.data, canManageVoices: auth.role === "owner" || auth.role === "admin" }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const parsed = studioPreferenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select a saved voice and model" }, { status: 400 });
  const { data: voice } = await auth.admin.from("brand_voices").select("id").eq("tenant_id", auth.tenantId).eq("brand_id", parsed.data.brandId).eq("id", parsed.data.voiceId).eq("status", "approved").maybeSingle();
  if (!voice) return NextResponse.json({ error: "That voice is not saved for this brand" }, { status: 404 });
  const { error } = await auth.admin.from("brands").update({ default_voice_id: voice.id, default_tts_model_id: parsed.data.modelId }).eq("tenant_id", auth.tenantId).eq("id", parsed.data.brandId);
  if (error) return NextResponse.json({ error: "Could not save the preferred voice and model" }, { status: 503 });
  return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
}
