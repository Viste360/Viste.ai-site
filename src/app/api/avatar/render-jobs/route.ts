import { NextRequest, NextResponse } from "next/server";
import { avatarProviderStatuses, avatarRenderRequestSchema, submitOpenSourceRender } from "@/lib/avatar/render-provider";
import { authoriseStudioRequest, STUDIO_ASSET_BUCKET } from "@/lib/studio-assets";

export const runtime = "nodejs";

const databaseNotReady = "Avatar storage is not ready. Apply the Avatar Studio migration first.";

export async function GET(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised owner access required" }, { status: 401 });

  const [talentsResult, jobsResult, assetsResult] = await Promise.all([
    auth.admin.from("avatar_talents").select("id,display_name,status,default_language,reference_video_asset_id,created_at,avatar_consents(status,expires_at)").eq("tenant_id", auth.tenantId).order("created_at", { ascending: false }),
    auth.admin.from("avatar_render_jobs").select("id,talent_id,provider,status,cue_id,script,language,aspect_ratio,output_asset_id,error_code,created_at,updated_at").eq("tenant_id", auth.tenantId).order("created_at", { ascending: false }).limit(100),
    auth.admin.from("assets").select("id,file_name,content_type,asset_type,created_at").eq("tenant_id", auth.tenantId).eq("status", "ready").order("created_at", { ascending: false }).limit(200),
  ]);
  if (talentsResult.error || jobsResult.error || assetsResult.error) return NextResponse.json({ error: databaseNotReady }, { status: 503 });

  return NextResponse.json({
    talents: talentsResult.data,
    jobs: jobsResult.data,
    assets: assetsResult.data,
    providers: avatarProviderStatuses(),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised owner access required" }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });

  const parsed = avatarRenderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review the avatar, script and output settings" }, { status: 400 });
  const input = parsed.data;
  const provider = avatarProviderStatuses().find(({ id }) => id === input.provider);
  if (!provider?.configured) return NextResponse.json({ error: "The selected rendering provider is not configured" }, { status: 503 });

  const { data: talent, error: talentError } = await auth.admin.from("avatar_talents")
    .select("id,status,reference_video_asset_id,reference_audio_asset_id")
    .eq("id", input.talentId).eq("tenant_id", auth.tenantId).maybeSingle();
  if (talentError) return NextResponse.json({ error: databaseNotReady }, { status: 503 });
  if (!talent || talent.status !== "ready" || !talent.reference_video_asset_id) return NextResponse.json({ error: "Choose a ready avatar talent" }, { status: 409 });

  const now = new Date().toISOString();
  const { data: consent, error: consentError } = await auth.admin.from("avatar_consents").select("id")
    .eq("talent_id", talent.id).eq("tenant_id", auth.tenantId).eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`).limit(1).maybeSingle();
  if (consentError) return NextResponse.json({ error: databaseNotReady }, { status: 503 });
  if (!consent) return NextResponse.json({ error: "Active documented consent is required before rendering" }, { status: 409 });

  const initialStatus = input.provider === "manual" ? "awaiting_upload" : "queued";
  const { data: job, error: jobError } = await auth.admin.from("avatar_render_jobs").insert({
    tenant_id: auth.tenantId,
    talent_id: talent.id,
    created_by: auth.user.id,
    provider: input.provider,
    status: initialStatus,
    cue_id: input.cueId || null,
    script: input.script,
    language: input.language,
    aspect_ratio: input.aspectRatio,
    background: input.background,
  }).select("id,talent_id,provider,status,cue_id,script,language,aspect_ratio,created_at").single();
  if (jobError || !job) return NextResponse.json({ error: databaseNotReady }, { status: 503 });

  if (input.provider === "open_source") {
    const assetIds = [talent.reference_video_asset_id, talent.reference_audio_asset_id].filter((id): id is string => Boolean(id));
    const { data: sourceAssets } = await auth.admin.from("assets").select("id,storage_path").eq("tenant_id", auth.tenantId).in("id", assetIds);
    const byId = new Map((sourceAssets || []).map((asset) => [asset.id, asset.storage_path]));
    const videoPath = byId.get(talent.reference_video_asset_id);
    if (!videoPath) {
      await auth.admin.from("avatar_render_jobs").update({ status: "failed", error_code: "SOURCE_VIDEO_MISSING" }).eq("id", job.id);
      return NextResponse.json({ error: "Avatar reference video is unavailable" }, { status: 409 });
    }
    const { data: signedVideo } = await auth.admin.storage.from(STUDIO_ASSET_BUCKET).createSignedUrl(videoPath, 3_600);
    const audioPath = talent.reference_audio_asset_id ? byId.get(talent.reference_audio_asset_id) : undefined;
    const signedAudio = audioPath ? (await auth.admin.storage.from(STUDIO_ASSET_BUCKET).createSignedUrl(audioPath, 3_600)).data : null;
    if (!signedVideo?.signedUrl) {
      await auth.admin.from("avatar_render_jobs").update({ status: "failed", error_code: "SOURCE_SIGNING_FAILED" }).eq("id", job.id);
      return NextResponse.json({ error: "Could not prepare private source media" }, { status: 503 });
    }
    try {
      const submission = await submitOpenSourceRender({ ...input, jobId: job.id, sourceVideoUrl: signedVideo.signedUrl, sourceAudioUrl: signedAudio?.signedUrl });
      await auth.admin.from("avatar_render_jobs").update({ provider_job_id: submission.id, status: submission.status }).eq("id", job.id).eq("tenant_id", auth.tenantId);
      job.status = submission.status;
    } catch (error) {
      const code = error instanceof Error ? error.message.slice(0, 120) : "PROVIDER_FAILED";
      await auth.admin.from("avatar_render_jobs").update({ status: "failed", error_code: code }).eq("id", job.id).eq("tenant_id", auth.tenantId);
      return NextResponse.json({ error: "The render worker could not accept this job", jobId: job.id }, { status: 502 });
    }
  }

  await auth.admin.from("audit_logs").insert({
    tenant_id: auth.tenantId,
    actor_id: auth.user.id,
    actor_type: "user",
    action: "avatar.render_requested",
    entity_type: "avatar_render_job",
    entity_id: job.id,
    metadata: { provider: input.provider, talent_id: talent.id },
  });
  return NextResponse.json({ job }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
