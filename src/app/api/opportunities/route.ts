import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { buildOpportunityBrief, opportunitySubmissionSchema } from "@/lib/opportunity-engine";
import { publicConfig } from "@/lib/public-config";
import { verifyTurnstileToken } from "@/lib/turnstile";

const attempts = new Map<string, { count: number; reset: number }>();
const runtimeSalt = process.env.CONTACT_IP_SALT || randomUUID();
const tenantId = "10000000-0000-4000-8000-000000000010";

function response(body: object, status: number, requestId: string) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
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
  await admin.from("security_events").insert({ tenant_id: tenantId, route: "/api/opportunities", reason });
}

async function isDatabaseLimited(admin: NonNullable<ReturnType<typeof supabaseAdmin>>, ipHash: string) {
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

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  if (!validOrigin(request)) return response({ error: "Invalid origin" }, 403, requestId);
  if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Unsupported content type" }, 415, requestId);
  if (Number(request.headers.get("content-length") || 0) > 30_000) return response({ error: "Request too large" }, 413, requestId);

  let json: unknown;
  try { json = await request.json(); } catch { return response({ error: "Invalid request" }, 400, requestId); }
  const parsed = opportunitySubmissionSchema.safeParse(json);
  if (!parsed.success) return response({ error: "Please review the required fields" }, 400, requestId);
  const admin = supabaseAdmin();
  if (parsed.data.faxNumber) {
    await recordSecurityEvent(admin, "honeypot");
    return response({ error: "Invalid request" }, 400, requestId);
  }
  if (Date.now() - parsed.data.startedAt < 2_500) {
    await recordSecurityEvent(admin, "too_fast");
    return response({ error: "Please wait before submitting" }, 429, requestId);
  }

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ipHash = createHash("sha256").update(`${runtimeSalt}:${ip}`).digest("hex");
  if (isLimited(ipHash)) {
    await recordSecurityEvent(admin, "memory_rate_limit");
    return response({ error: "Too many attempts" }, 429, requestId);
  }

  if (!admin) return response({ error: "Opportunity storage is not configured", fallback: "mailto:hello@viste.ai" }, 503, requestId);
  if (await isDatabaseLimited(admin, ipHash)) {
    await recordSecurityEvent(admin, "database_rate_limit");
    return response({ error: "Too many attempts" }, 429, requestId);
  }
  const turnstile = await verifyTurnstileToken({ token: parsed.data.turnstileToken, idempotencyKey: requestId, expectedAction: "viste_opportunity" });
  if (!turnstile.success) {
    await recordSecurityEvent(admin, "turnstile_failed");
    console.warn(JSON.stringify({ event: "opportunity_bot_verification_failed", requestId, reason: turnstile.reason }));
    return response({ error: "Bot verification required" }, 400, requestId);
  }

  const brief = buildOpportunityBrief(parsed.data);
  const { turnstileToken: _turnstileToken, ...submission } = parsed.data;
  void _turnstileToken;
  const { data: reference, error } = await admin.rpc("create_viste_opportunity", {
    p_payload: {
      ...submission,
      ipHash,
      intent: brief.classification.intent,
      intentConfidence: brief.classification.confidence,
      intentEvidence: brief.classification.evidence,
      score: brief.score,
      risk: parsed.data.risk,
      stage: brief.stage,
      service: brief.service,
      nextAction: brief.nextAction,
      missingInformation: brief.missingInformation,
    },
  });
  if (error || typeof reference !== "string") {
    console.error(JSON.stringify({ event: "opportunity_storage_failed", requestId, code: error?.code || "invalid-reference" }));
    return response({ error: "We could not securely store this opportunity", fallback: "mailto:hello@viste.ai" }, 503, requestId);
  }

  console.info(JSON.stringify({ event: "opportunity_created", requestId, reference, intent: brief.classification.intent, priority: brief.score.priority, stage: brief.stage }));
  return response({
    ok: true,
    reference,
    intent: brief.classification.intent,
    score: brief.score.total,
    priority: brief.score.priority,
    confidence: brief.score.confidence,
    risk: parsed.data.risk,
    stage: brief.stage,
    service: brief.service,
    nextAction: brief.nextAction,
    missingInformation: brief.missingInformation,
    bookingUrl: brief.score.total >= 65 && parsed.data.risk !== "HIGH" ? publicConfig.bookingUrl : undefined,
  }, 201, requestId);
}
