import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { assetUploadSchema, authoriseStudioRequest, isAllowedStudioMime, safeStudioFileName, STUDIO_ASSET_BUCKET } from "@/lib/studio-assets";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });

  const parsed = assetUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review the file and rights information" }, { status: 400 });
  if (!isAllowedStudioMime(parsed.data.contentType)) return NextResponse.json({ error: "This file type is not supported" }, { status: 415 });

  if (parsed.data.brandId) {
    const { data: brand } = await auth.admin.from("brands").select("id").eq("id", parsed.data.brandId).eq("tenant_id", auth.tenantId).maybeSingle();
    if (!brand) return NextResponse.json({ error: "Brand does not belong to this workspace" }, { status: 403 });
  }

  const assetId = randomUUID();
  const safeName = safeStudioFileName(parsed.data.fileName);
  const storagePath = `${auth.tenantId}/${assetId}/${safeName}`;
  const { error: insertError } = await auth.admin.from("assets").insert({
    id: assetId,
    tenant_id: auth.tenantId,
    brand_id: parsed.data.brandId || null,
    owner_id: auth.user.id,
    file_name: parsed.data.fileName,
    storage_path: storagePath,
    content_type: parsed.data.contentType,
    bytes: parsed.data.size,
    asset_type: parsed.data.assetType,
    source: parsed.data.source,
    licence: parsed.data.licence,
    permitted_use: parsed.data.permittedUse,
    ai_generated: parsed.data.aiGenerated,
    status: "uploading",
  });
  if (insertError) return NextResponse.json({ error: "Studio storage is not ready. Apply the Studio migration first." }, { status: 503 });

  const { data: upload, error: uploadError } = await auth.admin.storage.from(STUDIO_ASSET_BUCKET).createSignedUploadUrl(storagePath, { upsert: false });
  if (uploadError || !upload?.token) {
    await auth.admin.from("assets").update({ status: "failed" }).eq("id", assetId).eq("tenant_id", auth.tenantId);
    return NextResponse.json({ error: "Could not prepare the private upload" }, { status: 503 });
  }

  return NextResponse.json({ assetId, path: storagePath, token: upload.token, bucket: STUDIO_ASSET_BUCKET }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
