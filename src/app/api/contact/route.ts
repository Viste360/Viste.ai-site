import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact";

const attempts = new Map<string, { count: number; reset: number }>();
const runtimeSalt = process.env.CONTACT_IP_SALT || randomUUID();
const requestIdPattern = /^[a-zA-Z0-9_-]{8,80}$/;
const deliveryTimeoutMs = 8_000;

type DeliveryResult = { channel: "supabase" | "resend"; outcome: "delivered" | "failed" | "unconfigured" };

function isLimited(key: string) {
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

async function storeLead(input: ReturnType<typeof contactSchema.parse>, id: string, receivedAt: string, ipHash: string): Promise<DeliveryResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey) return { channel: "supabase", outcome: "unconfigured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), deliveryTimeoutMs);
  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("leads").insert({
      id,
      name: input.name,
      email: input.email,
      company: input.company,
      role: input.role || null,
      country: input.country || null,
      phone: input.phone || null,
      challenge: input.challenge,
      budget: input.budget,
      timeline: input.timeline,
      locale: input.locale,
      consent_at: receivedAt,
      source: "website",
      source_url: input.sourceUrl,
      referrer: input.referrer || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
      ip_hash: ipHash,
      status: "new",
    }).abortSignal(controller.signal);
    return { channel: "supabase", outcome: error ? "failed" : "delivered" };
  } catch {
    return { channel: "supabase", outcome: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyTeam(input: ReturnType<typeof contactSchema.parse>, id: string, receivedAt: string): Promise<DeliveryResult> {
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
        subject: `New Viste.ai enquiry — ${safeText(input.company)}`,
        text: [
          `Reference: ${id}`,
          `Received: ${receivedAt}`,
          `Name: ${safeText(input.name)}`,
          `Email: ${safeText(input.email)}`,
          `Company: ${safeText(input.company)}`,
          `Role: ${safeText(input.role)}`,
          `Country: ${safeText(input.country)}`,
          `Phone: ${safeText(input.phone)}`,
          `Budget: ${input.budget}`,
          `Timeline: ${input.timeline}`,
          "",
          "Challenge:",
          safeText(input.challenge),
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
  if (input.website || Date.now() - input.startedAt < 2_500) {
    console.info(JSON.stringify({ event: "contact_spam_ignored", requestId }));
    return response({ ok: true }, 200, requestId);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ipHash = createHash("sha256").update(`${runtimeSalt}:${ip}`).digest("hex");
  if (isLimited(ipHash)) {
    console.warn(JSON.stringify({ event: "contact_rate_limited", requestId }));
    return response({ error: "Too many attempts" }, 429, requestId);
  }

  const id = randomUUID();
  const receivedAt = new Date().toISOString();
  const deliveries = await Promise.all([
    storeLead(input, id, receivedAt, ipHash),
    notifyTeam(input, id, receivedAt),
  ]);
  const delivered = deliveries.some(({ outcome }) => outcome === "delivered");
  console.info(JSON.stringify({
    event: "contact_delivery",
    requestId,
    reference: id,
    durationMs: Date.now() - startedAt,
    channels: Object.fromEntries(deliveries.map(({ channel, outcome }) => [channel, outcome])),
  }));

  if (!delivered) return response({ error: "Contact service is not configured", fallback: "mailto:hello@viste.ai" }, 503, requestId);
  return response({ ok: true, reference: id }, 201, requestId);
}
