import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { buildOpportunityBrief, opportunitySubmissionSchema, type OpportunitySubmission } from "@/lib/opportunity-engine";
import { publicConfig } from "@/lib/public-config";
import { verifyTurnstileToken } from "@/lib/turnstile";

const attempts = new Map<string, { count: number; reset: number }>();
const runtimeSalt = process.env.CONTACT_IP_SALT || randomUUID();
const tenantId = "10000000-0000-4000-8000-000000000010";
const deliveryTimeoutMs = 8_000;

type AdminClient = NonNullable<ReturnType<typeof supabaseAdmin>>;
type Brief = ReturnType<typeof buildOpportunityBrief>;
type DeliveryResult = {
  channel: "supabase" | "resend";
  outcome: "delivered" | "failed" | "unconfigured";
  diagnostic?: string;
};

function response(body: object, status: number, requestId: string) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
}

function safeText(value: string) {
  return value.replace(/[<>]/g, "").slice(0, 4_000);
}

function safeHeader(value: string) {
  return safeText(value).replace(/[\r\n]+/g, " ").trim();
}

function isLimited(key: string) {
  const now = Date.now();
  if (attempts.size > 1_000) for (const [storedKey, value] of attempts) if (value.reset < now) attempts.delete(storedKey);
  const current = attempts.get(key);
  if (!current || current.reset < now) {
    attempts.set(key, { count: 1, reset: now + 15 * 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

async function recordSecurityEvent(admin: ReturnType<typeof supabaseAdmin>, reason: "honeypot" | "too_fast" | "memory_rate_limit" | "database_rate_limit" | "turnstile_failed") {
  if (!admin) return;
  try { await admin.from("security_events").insert({ tenant_id: tenantId, route: "/api/opportunities", reason }); } catch { /* Optional reporting table. */ }
}

async function isDatabaseLimited(admin: AdminClient, ipHash: string) {
  try {
    const { data, error } = await admin.rpc("check_contact_rate_limit", { p_key_hash: `opportunity:${ipHash}`, p_window_seconds: 900, p_max_attempts: 5 });
    return !error && data === false;
  } catch { return false; }
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  return url && secret ? createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

async function storeLead(admin: AdminClient, input: OpportunitySubmission, brief: Brief, id: string, receivedAt: string, ipHash: string): Promise<DeliveryResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), deliveryTimeoutMs);
  try {
    const { error } = await admin.from("leads").insert({
      id,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company,
      role: input.locale === "es" ? "Consulta desde el asesor" : "Advisor enquiry",
      country: input.region,
      company_website: null,
      preferred_language: input.locale,
      workflow: input.initialNeed,
      systems: input.systems,
      desired_outcome: input.desiredOutcome,
      challenge: [
        input.initialNeed,
        `Current situation: ${input.currentProcess}`,
        `Business impact: ${input.businessImpact}`,
        `Suggested service: ${brief.service.label}`,
        `Next action: ${brief.nextAction}`,
        input.advisorTranscript ? `Advisor conversation:\n${input.advisorTranscript}` : "",
      ].join("\n\n"),
      budget: "exploring",
      timeline: input.timeline,
      locale: input.locale,
      consent_at: receivedAt,
      source: "advisor",
      source_url: input.sourceUrl,
      referrer: input.referrer || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
      utm_term: input.utmTerm || null,
      utm_content: input.utmContent || null,
      ip_hash: ipHash,
      qualified_for_booking: brief.score.total >= 65 && input.risk !== "HIGH",
      notification_delivered: false,
      status: "new",
    }).abortSignal(controller.signal);
    return error
      ? { channel: "supabase", outcome: "failed", diagnostic: error.code || "database_error" }
      : { channel: "supabase", outcome: "delivered" };
  } catch {
    return { channel: "supabase", outcome: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyTeam(input: OpportunitySubmission, brief: Brief, id: string, receivedAt: string): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { channel: "resend", outcome: "unconfigured" };
  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL || "hello@viste.ai";
  const contactName = safeHeader(input.name);
  const company = safeHeader(input.company);
  const calendarUrl = publicConfig.bookingUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), deliveryTimeoutMs);
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `advisor-lead-${id}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Viste.ai Website <website@viste.ai>",
        to: [notificationEmail],
        reply_to: input.email,
        subject: `Advisor lead: ${contactName} — ${safeHeader(brief.service.label)}`,
        text: [
          "New Viste advisor lead",
          "",
          `${contactName} (${safeHeader(input.email)}) from ${company} is interested in ${safeHeader(brief.service.label)}.`,
          `Calendar offered after submission: ${calendarUrl ? `yes — ${calendarUrl}` : "no — booking link is not configured"}`,
          "",
          `Reference: ${id}`,
          `Received: ${receivedAt}`,
          `Priority: ${brief.score.priority} (${brief.score.total}/100)`,
          `Intent: ${brief.classification.intent}`,
          `Name: ${safeText(input.name)}`,
          `Work email: ${safeText(input.email)}`,
          `Phone / WhatsApp: ${safeText(input.phone || "Not provided")}`,
          `Company: ${safeText(input.company)}`,
          `Country / region: ${safeText(input.region)}`,
          `Language: ${input.locale}`,
          "",
          "Business and priority:",
          safeText(input.initialNeed),
          "",
          "Current situation:",
          safeText(input.currentProcess),
          "",
          "Desired outcome:",
          safeText(input.desiredOutcome),
          "",
          `Suggested service: ${safeText(brief.service.label)}`,
          `Next action: ${safeText(brief.nextAction)}`,
          "",
          "Advisor conversation:",
          safeText(input.advisorTranscript || "No transcript captured; use the structured context above."),
          "",
          "Suggested human follow-up:",
          `Hi ${contactName}, thanks for sharing what is happening at ${company}. We’ve reviewed your interest in ${safeHeader(brief.service.label)} and would like to understand the workflow in a little more detail before recommending scope.`,
          `Source: ${safeText(input.sourceUrl)}`,
        ].join("\n"),
      }),
    });
    return result.ok
      ? { channel: "resend", outcome: "delivered" }
      : { channel: "resend", outcome: "failed", diagnostic: `http_${result.status}` };
  } catch {
    return { channel: "resend", outcome: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const requestStartedAt = Date.now();
  if (!validOrigin(request)) return response({ error: "Invalid origin" }, 403, requestId);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Unsupported content type" }, 415, requestId);
  if (Number(request.headers.get("content-length") || 0) > 30_000) return response({ error: "Request too large" }, 413, requestId);

  let json: unknown;
  try { json = await request.json(); } catch { return response({ error: "Invalid request" }, 400, requestId); }
  const parsed = opportunitySubmissionSchema.safeParse(json);
  if (!parsed.success) return response({ error: "Please review the required fields" }, 400, requestId);
  const input = parsed.data;
  const admin = supabaseAdmin();
  if (input.faxNumber) {
    await recordSecurityEvent(admin, "honeypot");
    return response({ error: "Invalid request" }, 400, requestId);
  }
  if (Date.now() - input.startedAt < 2_500) {
    await recordSecurityEvent(admin, "too_fast");
    return response({ error: "Please wait before submitting" }, 429, requestId);
  }

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ipHash = createHash("sha256").update(`${runtimeSalt}:${ip}`).digest("hex");
  if (isLimited(ipHash)) {
    await recordSecurityEvent(admin, "memory_rate_limit");
    return response({ error: "Too many attempts" }, 429, requestId);
  }

  if (admin && await isDatabaseLimited(admin, ipHash)) {
    await recordSecurityEvent(admin, "database_rate_limit");
    return response({ error: "Too many attempts" }, 429, requestId);
  }
  const turnstile = await verifyTurnstileToken({ token: input.turnstileToken, idempotencyKey: requestId, expectedAction: "viste_opportunity" });
  if (!turnstile.success) {
    await recordSecurityEvent(admin, "turnstile_failed");
    console.warn(JSON.stringify({ event: "opportunity_bot_verification_failed", requestId, reason: turnstile.reason }));
    return response({ error: "Bot verification required" }, 400, requestId);
  }

  const brief = buildOpportunityBrief(input);
  const reference = randomUUID();
  const receivedAt = new Date().toISOString();
  const deliveries = await Promise.all([
    admin
      ? storeLead(admin, input, brief, reference, receivedAt, ipHash)
      : Promise.resolve<DeliveryResult>({ channel: "supabase", outcome: "unconfigured" }),
    notifyTeam(input, brief, reference, receivedAt),
  ]);
  const stored = deliveries.find(({ channel }) => channel === "supabase")?.outcome === "delivered";
  const notified = deliveries.find(({ channel }) => channel === "resend")?.outcome === "delivered";
  if (admin && stored && notified) {
    try { await admin.from("leads").update({ notification_delivered: true }).eq("id", reference); } catch { /* Lead remains available in the inbox. */ }
  }

  console.info(JSON.stringify({
    event: "opportunity_delivery",
    requestId,
    reference,
    intent: brief.classification.intent,
    priority: brief.score.priority,
    stage: brief.stage,
    durationMs: Date.now() - requestStartedAt,
    channels: Object.fromEntries(deliveries.map(({ channel, outcome }) => [channel, outcome])),
    diagnostics: Object.fromEntries(deliveries.filter(({ diagnostic }) => diagnostic).map(({ channel, diagnostic }) => [channel, diagnostic])),
  }));
  if (!notified) return response({ error: "We could not notify the Viste team", fallback: "mailto:hello@viste.ai" }, 503, requestId);

  return response({
    ok: true,
    reference,
    intent: brief.classification.intent,
    score: brief.score.total,
    priority: brief.score.priority,
    confidence: brief.score.confidence,
    risk: input.risk,
    stage: brief.stage,
    service: brief.service,
    nextAction: brief.nextAction,
    missingInformation: brief.missingInformation,
    notification: "sent",
    storage: stored ? "stored" : "monitoring-required",
    bookingUrl: publicConfig.bookingUrl,
  }, 201, requestId);
}
