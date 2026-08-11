import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !secret || !publishable || !token) return NextResponse.json({ error: "Unavailable" }, { status: 401 });

  const auth = createClient(url, publishable, { auth: { persistSession: false } });
  const { data: { user } } = await auth.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(url, secret, { auth: { persistSession: false } });
  const { data: legacyAdmin } = await admin.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  const { data: membership } = await admin.from("memberships").select("tenant_id,role").eq("user_id", user.id).maybeSingle();
  if (!legacyAdmin && !membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tenantId = membership?.tenant_id || "10000000-0000-4000-8000-000000000010";
  const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();
  const [opportunitiesResult, approvalsResult, bookingsResult, funnelResult, securityResult, attributionResult] = await Promise.all([
    admin.from("opportunities").select("id,title,intent,stage,priority,risk,score,qualification_confidence,recommended_service,recommended_next_action,brief,source_url,first_response_at,created_at,owner_id,contacts(name,email,company,region),opportunity_scores(components,algorithm_version)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(200),
    admin.from("approvals").select("id,opportunity_id,action_type,status,requested_by,created_at,payload").eq("tenant_id", tenantId).eq("status", "pending").order("created_at", { ascending: true }).limit(100),
    admin.from("bookings").select("id,opportunity_id,status,starts_at,timezone").eq("tenant_id", tenantId).limit(200),
    admin.from("opportunity_funnel_events").select("session_hash,event,locale,intent,created_at").eq("tenant_id", tenantId).gte("created_at", periodStart).limit(10_000),
    admin.from("security_events").select("reason,created_at").eq("tenant_id", tenantId).gte("created_at", periodStart).limit(10_000),
    admin.from("attribution_events").select("opportunity_id,utm_source,utm_medium,utm_campaign,created_at").eq("tenant_id", tenantId).gte("created_at", periodStart).limit(10_000),
  ]);

  if (opportunitiesResult.error) return NextResponse.json({ error: "Opportunity Engine migration required" }, { status: 503 });
  const opportunities = opportunitiesResult.data || [];
  const recentOpportunities = opportunities.filter(({ created_at }) => created_at >= periodStart);
  const qualified = opportunities.filter(({ score }) => score >= 65).length;
  const responseMinutes = opportunities
    .filter(({ first_response_at }) => first_response_at)
    .map(({ created_at, first_response_at }) => (new Date(first_response_at as string).getTime() - new Date(created_at).getTime()) / 60_000)
    .sort((a, b) => a - b);
  const median = responseMinutes.length ? responseMinutes[Math.floor(responseMinutes.length / 2)] : null;
  const bookedOpportunityIds = new Set((bookingsResult.data || []).filter(({ status }) => status === "confirmed").map(({ opportunity_id }) => opportunity_id));
  const sprintWon = opportunities.filter(({ stage }) => ["SPRINT_WON", "PILOT_PROPOSED", "IMPLEMENTATION"].includes(stage)).length;
  const funnelEvents = funnelResult.data || [];
  const uniqueSessions = (event: string) => new Set(funnelEvents.filter((item) => item.event === event).map((item) => item.session_hash)).size;
  const funnel = {
    viewed: uniqueSessions("advisor_viewed"),
    started: uniqueSessions("advisor_started"),
    briefViewed: uniqueSessions("advisor_brief_viewed"),
    handoffStarted: uniqueSessions("advisor_handoff_started"),
    submitted: recentOpportunities.length,
  };
  const countBy = (items: Array<Record<string, unknown>>, key: string, fallback: string) => Object.entries(items.reduce<Record<string, number>>((totals, item) => {
    const label = String(item[key] || fallback); totals[label] = (totals[label] || 0) + 1; return totals;
  }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const sourceRows = (attributionResult.data || []).map((item) => ({ source: item.utm_source || "direct / untagged", medium: item.utm_medium || "none", campaign: item.utm_campaign || "none" }));
  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(); date.setUTCDate(date.getUTCDate() - (13 - index));
    const day = date.toISOString().slice(0, 10);
    return { day, opportunities: recentOpportunities.filter(({ created_at }) => created_at.startsWith(day)).length, advisorStarts: funnelEvents.filter(({ event, created_at }) => event === "advisor_started" && created_at.startsWith(day)).length };
  });

  return NextResponse.json({
    tenant: { id: tenantId, name: "Viste.ai" },
    kpis: {
      newOpportunities: recentOpportunities.length,
      medianSpeedToLeadMinutes: median,
      diagnosticCompletionPercent: opportunities.length ? 100 : 0,
      qualifiedOpportunities: qualified,
      discoverySessionsBooked: bookedOpportunityIds.size,
      opportunitySprintConversionPercent: qualified ? Math.round((sprintWon / qualified) * 100) : 0,
    },
    opportunities,
    approvals: approvalsResult.data || [],
    bookings: bookingsResult.data || [],
    reporting: {
      periodDays: 30,
      funnel,
      funnelRates: {
        viewToStart: funnel.viewed ? Math.round((funnel.started / funnel.viewed) * 100) : 0,
        startToBrief: funnel.started ? Math.round((funnel.briefViewed / funnel.started) * 100) : 0,
        briefToHandoff: funnel.briefViewed ? Math.round((funnel.handoffStarted / funnel.briefViewed) * 100) : 0,
        handoffToSubmission: null,
      },
      byIntent: countBy(recentOpportunities as unknown as Array<Record<string, unknown>>, "intent", "unclassified"),
      bySource: countBy(sourceRows as Array<Record<string, unknown>>, "source", "direct / untagged"),
      byLocale: countBy(funnelEvents as unknown as Array<Record<string, unknown>>, "locale", "unknown"),
      security: countBy((securityResult.data || []) as Array<Record<string, unknown>>, "reason", "unknown"),
      blockedTotal: (securityResult.data || []).length,
      daily,
      consentNote: "Pre-submission funnel events include only visitors who accepted optional analytics. Submitted opportunity counts are operational records with explicit enquiry consent.",
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
