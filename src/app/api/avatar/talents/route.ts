import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest } from "@/lib/studio-assets";
import { avatarTalentSchema, avatarTalentSlug } from "@/lib/avatar/talent";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised owner access required" }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });

  const parsed = avatarTalentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Reference media and documented consent are required" }, { status: 400 });

  const requestedAssetIds = [
    parsed.data.referenceVideoAssetId,
    parsed.data.consentEvidenceAssetId,
    ...(parsed.data.referenceAudioAssetId ? [parsed.data.referenceAudioAssetId] : []),
  ];
  const { data: assets, error: assetError } = await auth.admin
    .from("assets")
    .select("id,content_type,status")
    .eq("tenant_id", auth.tenantId)
    .eq("status", "ready")
    .in("id", requestedAssetIds);
  if (assetError) return NextResponse.json({ error: "Avatar storage is not ready. Apply the Avatar Studio migration first." }, { status: 503 });
  if (!assets || assets.length !== requestedAssetIds.length) return NextResponse.json({ error: "One or more files are unavailable in this workspace" }, { status: 400 });

  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  if (!byId.get(parsed.data.referenceVideoAssetId)?.content_type.startsWith("video/")) return NextResponse.json({ error: "The avatar reference must be a video" }, { status: 400 });
  if (parsed.data.referenceAudioAssetId && !byId.get(parsed.data.referenceAudioAssetId)?.content_type.startsWith("audio/")) return NextResponse.json({ error: "The voice reference must be audio" }, { status: 400 });

  const talentId = randomUUID();
  const { data: talent, error: talentError } = await auth.admin.from("avatar_talents").insert({
    id: talentId,
    tenant_id: auth.tenantId,
    owner_id: auth.user.id,
    display_name: parsed.data.displayName,
    slug: avatarTalentSlug(parsed.data.displayName, talentId),
    status: "ready",
    default_language: parsed.data.defaultLanguage,
    reference_video_asset_id: parsed.data.referenceVideoAssetId,
    reference_audio_asset_id: parsed.data.referenceAudioAssetId || null,
  }).select("id,display_name,status,default_language").single();
  if (talentError || !talent) return NextResponse.json({ error: "Avatar storage is not ready. Apply the Avatar Studio migration first." }, { status: 503 });

  const { error: consentError } = await auth.admin.from("avatar_consents").insert({
    tenant_id: auth.tenantId,
    talent_id: talent.id,
    status: "active",
    scope: parsed.data.consentScope,
    evidence_asset_id: parsed.data.consentEvidenceAssetId,
    confirmed_by: auth.user.id,
    confirmed_at: new Date().toISOString(),
  });
  if (consentError) {
    await auth.admin.from("avatar_talents").delete().eq("id", talent.id).eq("tenant_id", auth.tenantId);
    return NextResponse.json({ error: "Consent could not be recorded" }, { status: 503 });
  }

  await auth.admin.from("audit_logs").insert({
    tenant_id: auth.tenantId,
    actor_id: auth.user.id,
    actor_type: "user",
    action: "avatar.talent_created",
    entity_type: "avatar_talent",
    entity_id: talent.id,
    metadata: { consent_evidence_asset_id: parsed.data.consentEvidenceAssetId },
  });
  return NextResponse.json({ talent }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
