import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest } from "@/lib/studio-assets";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });

  const [assetsResult, brandsResult] = await Promise.all([
    auth.admin.from("assets").select("id,brand_id,file_name,content_type,bytes,asset_type,source,licence,permitted_use,ai_generated,status,created_at").eq("tenant_id", auth.tenantId).eq("status", "ready").order("created_at", { ascending: false }).limit(100),
    auth.admin.from("brands").select("id,name").eq("tenant_id", auth.tenantId).order("name"),
  ]);
  if (assetsResult.error || brandsResult.error) return NextResponse.json({ error: "Studio storage is not ready. Apply the Studio migration first." }, { status: 503 });
  return NextResponse.json({ assets: assetsResult.data, brands: brandsResult.data }, { headers: { "Cache-Control": "no-store" } });
}
