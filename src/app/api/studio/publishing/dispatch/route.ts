import { NextRequest, NextResponse } from "next/server";
import { studioAdmin } from "@/lib/studio-assets";
import { dispatchPublication, type DuePublication } from "@/lib/studio-publishing";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = studioAdmin();
  if (!admin) return NextResponse.json({ error: "Studio database is not configured" }, { status: 503 });
  const { data, error } = await admin.from("publications").select("id,tenant_id,platform,platform_account_id,title,description,metadata").eq("status", "scheduled").lte("scheduled_for", new Date().toISOString()).order("scheduled_for").limit(20);
  if (error) return NextResponse.json({ error: "Could not read the publishing queue" }, { status: 503 });
  const results = [];
  for (const publication of (data || []) as DuePublication[]) results.push({ id: publication.id, ...(await dispatchPublication(admin, publication)) });
  return NextResponse.json({ processed: results.length, results }, { headers: { "Cache-Control": "no-store" } });
}
