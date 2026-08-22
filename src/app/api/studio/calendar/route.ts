import { NextRequest, NextResponse } from "next/server";
import { authoriseStudioRequest } from "@/lib/studio-assets";
import { canApprovePublication, isFutureSchedule, schedulePublicationSchema } from "@/lib/studio-campaigns";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  const [publications, campaigns, accounts] = await Promise.all([
    auth.admin.from("publications").select("id,campaign_id,platform_account_id,platform,title,description,scheduled_for,timezone,status,published_at").eq("tenant_id", auth.tenantId).order("scheduled_for", { ascending: true }).limit(100),
    auth.admin.from("campaigns").select("id,brand_id,name,status").eq("tenant_id", auth.tenantId).in("status", ["CONCEPT_REVIEW", "SCRIPT_REVIEW", "APPROVED", "SCHEDULED"]).order("updated_at", { ascending: false }).limit(100),
    auth.admin.from("platform_accounts").select("id,brand_id,platform,account_label,status").eq("tenant_id", auth.tenantId).order("platform"),
  ]);
  if (publications.error || campaigns.error || accounts.error) return NextResponse.json({ error: "Studio calendar is not ready. Apply the latest Studio migration first." }, { status: 503 });
  return NextResponse.json({ publications: publications.data, campaigns: campaigns.data, accounts: accounts.data, canApprove: canApprovePublication(auth.role) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await authoriseStudioRequest(request);
  if (!auth) return NextResponse.json({ error: "Authorised Studio membership required" }, { status: 401 });
  if (!canApprovePublication(auth.role)) return NextResponse.json({ error: "Owner, admin or reviewer approval is required to schedule publishing" }, { status: 403 });
  const parsed = schedulePublicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isFutureSchedule(parsed.success ? parsed.data.scheduledFor : "")) return NextResponse.json({ error: "Choose a valid time at least one minute in the future and confirm approval" }, { status: 400 });

  const [campaignResult, accountResult] = await Promise.all([
    auth.admin.from("campaigns").select("id,brand_id,status").eq("tenant_id", auth.tenantId).eq("id", parsed.data.campaignId).maybeSingle(),
    auth.admin.from("platform_accounts").select("id,brand_id,platform,status").eq("tenant_id", auth.tenantId).eq("id", parsed.data.platformAccountId).maybeSingle(),
  ]);
  const campaign = campaignResult.data;
  const account = accountResult.data;
  if (campaignResult.error || !campaign) return NextResponse.json({ error: "Campaign not found in this workspace" }, { status: 404 });
  if (accountResult.error || !account || account.status !== "authorised") return NextResponse.json({ error: "Connect and authorise this publishing account before scheduling" }, { status: 409 });
  if (account.brand_id !== campaign.brand_id) return NextResponse.json({ error: "Campaign and publishing account must belong to the same brand" }, { status: 409 });

  const now = new Date().toISOString();
  const { data: publication, error: publicationError } = await auth.admin.from("publications").insert({
    tenant_id: auth.tenantId,
    brand_id: campaign.brand_id,
    campaign_id: campaign.id,
    platform_account_id: account.id,
    platform: account.platform,
    title: parsed.data.title,
    description: parsed.data.description,
    scheduled_for: parsed.data.scheduledFor,
    timezone: parsed.data.timezone,
    status: "awaiting_approval",
    created_by: auth.user.id,
  }).select("id,campaign_id,platform,title,scheduled_for,timezone,status").single();
  if (publicationError || !publication) return NextResponse.json({ error: "Could not create the calendar item" }, { status: 503 });

  const { error: approvalError } = await auth.admin.from("approvals").insert({
    tenant_id: auth.tenantId,
    campaign_id: campaign.id,
    publication_id: publication.id,
    action_type: "campaign_publish",
    payload: { platform: account.platform, scheduledFor: parsed.data.scheduledFor, timezone: parsed.data.timezone, title: parsed.data.title },
    status: "approved",
    requested_by: auth.user.id,
    decided_by: auth.user.id,
    decided_at: now,
  });
  if (approvalError) return NextResponse.json({ error: "The item remains in review because its approval audit could not be saved" }, { status: 503 });

  const { data: scheduled, error: scheduleError } = await auth.admin.from("publications").update({ status: "scheduled", approved_by: auth.user.id, approved_at: now, updated_at: now }).eq("tenant_id", auth.tenantId).eq("id", publication.id).eq("status", "awaiting_approval").select("id,campaign_id,platform,title,scheduled_for,timezone,status").single();
  if (scheduleError || !scheduled) return NextResponse.json({ error: "Approval was recorded but the item could not be scheduled" }, { status: 503 });
  await auth.admin.from("campaigns").update({ status: "SCHEDULED", updated_at: now }).eq("tenant_id", auth.tenantId).eq("id", campaign.id);
  return NextResponse.json({ publication: scheduled }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
