import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest, completeUploadSchema, STUDIO_ASSET_BUCKET } from "@/lib/studio-assets";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const parsed = completeUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload reference" }, { status: 400 });

  const { data: pending } = await auth.admin.from("assets").select("id,storage_path").eq("id", parsed.data.assetId).eq("tenant_id", auth.tenantId).eq("owner_id", auth.user.id).eq("status", "uploading").maybeSingle();
  if (!pending) return NextResponse.json({ error: "Upload could not be confirmed" }, { status: 409 });
  const pathParts = pending.storage_path.split("/");
  const objectName = pathParts.pop();
  const objectDirectory = pathParts.join("/");
  const { data: storedObjects, error: storageError } = await auth.admin.storage.from(STUDIO_ASSET_BUCKET).list(objectDirectory, { limit: 2, search: objectName });
  if (storageError || !storedObjects?.some((object) => object.name === objectName)) return NextResponse.json({ error: "The uploaded file was not found in private storage" }, { status: 409 });

  const { data: asset, error } = await auth.admin.from("assets").update({ status: "ready", uploaded_at: new Date().toISOString() }).eq("id", pending.id).eq("tenant_id", auth.tenantId).eq("status", "uploading").select("id").maybeSingle();
  if (error || !asset) return NextResponse.json({ error: "Upload could not be confirmed" }, { status: 409 });

  await auth.admin.from("audit_logs").insert({ tenant_id: auth.tenantId, actor_id: auth.user.id, actor_type: "user", action: "studio.asset_uploaded", entity_type: "studio_asset", entity_id: asset.id, metadata: { source: "studio_asset_library" } });
  return NextResponse.json({ ok: true, assetId: asset.id }, { headers: { "Cache-Control": "no-store" } });
}
