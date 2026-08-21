import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { contactSchema, qualifiesForBooking, type ContactInput } from "@/lib/contact";
import { publicConfig } from "@/lib/public-config";

const attempts = new Map<string, { count: number; reset: number }>();
const runtimeSalt = process.env.CONTACT_IP_SALT || randomUUID();
const requestIdPattern = /^[a-zA-Z0-9_-]{8,80}$/;
const deliveryTimeoutMs = 8_000;

type DeliveryResult = { channel: "supabase" | "resend"; outcome: "delivered" | "failed" | "unconfigured" };

function isMemoryLimited(key: string) {
  const now = Date.now();
  if (attempts.size > 1_000) {
    for (const [storedKey, value] of attempts) if (value.reset < now) attempts.delete(storedKey);
  }
  const value = attempts.get(key);
  if (!value || value.reset < now) {
    attempts.set(key, { count: 1, reset: now + 15 * 60_000 });
    return false;
  }
  value.count += 1;
  return value.count > 5;
}

function safeText(value: string) {
  return value.replace(/[<>]/g, "").slice(0, 4_000);
}

function getRequestId(request: NextRequest) {
  const candidate = request.headers.get("x-contact-request-id") || "";
  return requestIdPattern.test(candidate) ? candidate : randomUUID();
}

function response(body: object, status: number, requestId: string) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
  });
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  return url && secret
    ? createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
}

async function isDatabaseLimited(ipHash: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.rpc("check_contact_rate_limit", {
      p_key_hash: ipHash,
      p_window_seconds: 900,
      p_max_attempts: 5,
    });
    return !error && data === false;
  } catch {
    return false;
  }
}

async function storeLead(input: ContactInput, id: string, receivedAt: string, ipHash: string, qualified: boolean): Promise<DeliveryResult> {
  const supabase = supabaseAdmin();
  if (!supabase) return { channel: "supabase", outcome: "unconfigured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), deliveryTimeoutMs);
  try {
    const { error } = await supabase.from("leads").insert({
      id,
      name: input.name,
      email: input.email,
      company: input.company,
      role: input.role,
      country: input.country,
      phone: input.telephone || null,
      company_website: input.companyWebsite,
      online_presence: input.onlinePresence || null,
      enquiry_type: input.enquiryType,
      preferred_package: input.preferredPackage || null,
      add_ons: input.addOns,
      marketing_source: input.marketingSource || null,
      pipeline_stage: "prospect",
      preferred_language: input.preferredLanguage,
      workflow: input.workflow,
      systems: input.systems,
      desired_outcome: input.desiredOutcome,
      challenge: [input.workflow, `Systems: ${input.systems}`, `Desired outcome: ${input.desiredOutcome}`].join("\n\n"),
      budget: input.budget,
      timeline: input.timeline,
      locale: input.locale,
      consent_at: receivedAt,
      source: input.enquiryType === "website" ? "viste-local" : "website",
      source_url: input.sourceUrl,
      referrer: input.referrer || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
      utm_term: input.utmTerm || null,
      utm_content: input.utmContent || null,
      ip_hash: ipHash,
      qualified_for_booking: qualified,
      status: "new",
    }).abortSignal(controller.signal);
    return { channel: "supabase", outcome: error ? "failed" : "delivered" };
  } catch {
    return { channel: "supabase", outcome: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyTeam(input: ContactInput, id: string, receivedAt: string, qualified: boolean): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!apiKey || !notificationEmail) return { channel: "resend", outcome: "unconfigured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), deliveryTimeoutMs);
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Viste.ai Website <website@viste.ai>",
        to: [notificationEmail],
        reply_to: input.email,
        subject: `${input.enquiryType === "website" ? "Viste Local" : qualified ? "Qualified" : "New"} Viste.ai enquiry — ${safeText(input.company)}`,
        text: [
          `Reference: ${id}`,
          `Received: ${receivedAt}`,
          `Qualified for booking: ${qualified ? "yes" : "no"}`,
          `Name: ${safeText(input.name)}`,
          `Work email: ${safeText(input.email)}`,
          `Company: ${safeText(input.company)}`,
          `Role: ${safeText(input.role)}`,
          `Enquiry type: ${input.enquiryType}`,
          `Telephone: ${safeText(input.telephone)}`,
          `Website: ${safeText(input.companyWebsite)}`,
          `Website/social presence: ${safeText(input.onlinePresence)}`,
          `Preferred package: ${input.preferredPackage || "not provided"}`,
          `Add-ons: ${input.addOns.join(", ") || "none selected"}`,
          `Marketing source: ${input.marketingSource || "not provided"}`,
          `Country: ${safeText(input.country)}`,
          `Preferred language: ${input.preferredLanguage}`,
          `Budget: ${input.budget}`,
          `Timeline: ${input.timeline}`,
          "",
          "Workflow:",
          safeText(input.workflow),
          "",
          "Systems:",
          safeText(input.systems),
          "",
          "Desired outcome:",
          safeText(input.desiredOutcome),
        ].join("\n"),
      }),
    });
    return { channel: "resend", outcome: result.ok ? "delivered" : "failed" };
  } catch {
    return { channel: "resend", outcome: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();

  if (!validOrigin(request)) return response({ error: "Invalid origin" }, 403, requestId);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Unsupported content type" }, 415, requestId);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20_000) return response({ error: "Request too large" }, 413, requestId);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return response({ error: "Invalid request" }, 400, requestId);
  }
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) return response({ error: "Please review the required fields" }, 400, requestId);

  const input = parsed.data;
  if (input.faxNumber) {
    console.info(JSON.stringify({ event: "contact_spam_ignored", requestId }));
    return response({ ok: true, reference: randomUUID(), qualified: false }, 202, requestId);
  }

  if (Date.now() - input.startedAt < 2_500) {
    console.info(JSON.stringify({ event: "contact_fast_submission", requestId }));
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ipHash = createHash("sha256").update(`${runtimeSalt}:${ip}`).digest("hex");
  if (isMemoryLimited(ipHash) || await isDatabaseLimited(ipHash)) {
    console.warn(JSON.stringify({ event: "contact_rate_limited", requestId }));
    return response({ error: "Too many attempts" }, 429, requestId);
  }

  const id = randomUUID();
  const receivedAt = new Date().toISOString();
  const qualified = qualifiesForBooking(input);
  const deliveries = await Promise.all([
    storeLead(input, id, receivedAt, ipHash, qualified),
    notifyTeam(input, id, receivedAt, qualified),
  ]);
  const stored = deliveries.find(({ channel }) => channel === "supabase")?.outcome === "delivered";
  const notified = deliveries.find(({ channel }) => channel === "resend")?.outcome === "delivered";
  console.info(JSON.stringify({
    event: "contact_delivery",
    requestId,
    reference: id,
    qualified,
    durationMs: Date.now() - startedAt,
    channels: Object.fromEntries(deliveries.map(({ channel, outcome }) => [channel, outcome])),
  }));

  if (!stored) return response({ error: "We could not securely store this enquiry", fallback: "mailto:hello@viste.ai" }, 503, requestId);
  return response({
    ok: true,
    reference: id,
    qualified,
    notification: notified ? "sent" : "monitoring-required",
    bookingUrl: qualified ? publicConfig.bookingUrl : undefined,
  }, 201, requestId);
}
