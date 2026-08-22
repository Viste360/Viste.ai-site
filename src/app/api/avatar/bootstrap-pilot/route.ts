import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest, STUDIO_ASSET_BUCKET, type StudioAuthorisation } from "@/lib/studio-assets";

export const runtime = "nodejs";

const source = "owner_supplied_avatar_pilot";
const permittedUse = "Private Avatar Studio testing only; replace before launch.";
const pilotClips = [
  { fileName: "yon-test-idle.mp4", publicPath: "/coach-assets/test-v1/en/phone-pilot-v1/idle-loop.v1.mp4" },
  { fileName: "yon-test-depth.mp4", publicPath: "/coach-assets/test-v1/en/phone-pilot-v1/squat-depth-shallow-01.v1.mp4" },
  { fileName: "yon-test-recovery.mp4", publicPath: "/coach-assets/test-v1/en/phone-pilot-v1/encourage-comeback-01.v1.mp4" },
] as const;

async function ensureAsset(auth: StudioAuthorisation, fileName: string, contentType: string, bytes: Buffer) {
  const { data: existing, error: existingError } = await auth.admin
    .from("assets")
    .select("id")
    .eq("tenant_id", auth.tenantId)
    .eq("file_name", fileName)
    .eq("source", source)
    .eq("status", "ready")
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing.id;

  const assetId = randomUUID();
  const storagePath = `${auth.tenantId}/${assetId}/${fileName}`;
  const assetType = contentType.startsWith("video/") ? "video" : "document";
  const { error: insertError } = await auth.admin.from("assets").insert({
    id: assetId,
    tenant_id: auth.tenantId,
    owner_id: auth.user.id,
    file_name: fileName,
    storage_path: storagePath,
    content_type: contentType,
    bytes: bytes.length,
    asset_type: assetType,
    source,
    licence: "Owner supplied",
    permitted_use: permittedUse,
    ai_generated: false,
    status: "uploading",
  });
  if (insertError) throw insertError;

  const { error: uploadError } = await auth.admin.storage.from(STUDIO_ASSET_BUCKET).upload(storagePath, bytes, {
    contentType,
    upsert: false,
  });
  if (uploadError) {
    await auth.admin.from("assets").update({ status: "failed" }).eq("id", assetId).eq("tenant_id", auth.tenantId);
    throw uploadError;
  }

  const { error: readyError } = await auth.admin.from("assets")
    .update({ status: "ready", uploaded_at: new Date().toISOString() })
    .eq("id", assetId)
    .eq("tenant_id", auth.tenantId);
  if (readyError) throw readyError;
  return assetId;
}

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised owner access required" }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });

  try {
    const clipIds: string[] = [];
    for (const clip of pilotClips) {
      const response = await fetch(new URL(clip.publicPath, request.nextUrl.origin), { cache: "no-store" });
      if (!response.ok) throw new Error(`Pilot clip unavailable: ${clip.fileName}`);
      clipIds.push(await ensureAsset(auth, clip.fileName, "video/mp4", Buffer.from(await response.arrayBuffer())));
    }

    const consentText = Buffer.from([
      "Avatar Studio test-media authorisation",
      `Owner: ${auth.user.email || "authorised owner"}`,
      "Scope: private internal prototyping using the owner-supplied test videos.",
      "Restriction: replace the test avatar before public launch or commercial use.",
      "Recorded: 2026-08-22",
    ].join("\n"), "utf8");
    const consentAssetId = await ensureAsset(auth, "avatar-test-authorisation-2026-08-22.txt", "text/plain", consentText);

    const talentLookup = await auth.admin.from("avatar_talents")
      .select("id")
      .eq("tenant_id", auth.tenantId)
      .eq("slug", "yon-test-avatar")
      .maybeSingle();
    if (talentLookup.error) throw talentLookup.error;
    let talent = talentLookup.data;
    if (!talent) {
      const result = await auth.admin.from("avatar_talents").insert({
        tenant_id: auth.tenantId,
        owner_id: auth.user.id,
        display_name: "Yon — test avatar",
        slug: "yon-test-avatar",
        status: "ready",
        default_language: "en",
        reference_video_asset_id: clipIds[0],
      }).select("id").single();
      if (result.error) throw result.error;
      talent = result.data;
    }

    const { data: activeConsent, error: consentLookupError } = await auth.admin.from("avatar_consents")
      .select("id")
      .eq("tenant_id", auth.tenantId)
      .eq("talent_id", talent.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (consentLookupError) throw consentLookupError;
    if (!activeConsent) {
      const { error } = await auth.admin.from("avatar_consents").insert({
        tenant_id: auth.tenantId,
        talent_id: talent.id,
        status: "active",
        scope: permittedUse,
        evidence_asset_id: consentAssetId,
        confirmed_by: auth.user.id,
        confirmed_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    const cueId = "squat-depth-shallow-01";
    const { data: existingJob, error: jobLookupError } = await auth.admin.from("avatar_render_jobs")
      .select("id")
      .eq("tenant_id", auth.tenantId)
      .eq("talent_id", talent.id)
      .eq("cue_id", cueId)
      .eq("provider", "manual")
      .limit(1)
      .maybeSingle();
    if (jobLookupError) throw jobLookupError;
    if (!existingJob) {
      const { error } = await auth.admin.from("avatar_render_jobs").insert({
        tenant_id: auth.tenantId,
        talent_id: talent.id,
        created_by: auth.user.id,
        provider: "manual",
        status: "awaiting_upload",
        cue_id: cueId,
        script: "Good control. Give me a little more depth on the next one.",
        language: "en",
        aspect_ratio: "9:16",
        background: "studio_dark",
      });
      if (error) throw error;
    }

    await auth.admin.from("audit_logs").insert({
      tenant_id: auth.tenantId,
      actor_id: auth.user.id,
      actor_type: "user",
      action: "avatar.pilot_initialised",
      entity_type: "avatar_talent",
      entity_id: talent.id,
      metadata: { test_only: true, clip_count: clipIds.length },
    });

    return NextResponse.json({ talentId: talent.id, assetsReady: clipIds.length + 1, jobReady: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Avatar pilot bootstrap failed", error);
    return NextResponse.json({ error: "The test avatar could not be initialized" }, { status: 503 });
  }
}
