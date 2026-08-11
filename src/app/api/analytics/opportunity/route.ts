import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const tenantId = "10000000-0000-4000-8000-000000000010";
const salt = process.env.ANALYTICS_SESSION_SALT || process.env.CONTACT_IP_SALT || randomUUID();
const attempts = new Map<string, { count: number; reset: number }>();
const schema = z.object({
  sessionId: z.uuid(),
  event: z.enum(["advisor_viewed", "advisor_started", "advisor_step_completed", "advisor_brief_viewed", "advisor_handoff_started"]),
  locale: z.enum(["en", "es"]),
  step: z.number().int().min(0).max(6).optional(),
  intent: z.string().max(40).optional(),
  path: z.string().trim().startsWith("/").max(300),
  utmSource: z.string().max(120).default(""),
  utmMedium: z.string().max(120).default(""),
  utmCampaign: z.string().max(120).default(""),
});

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
}
function rateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.reset < now) { attempts.set(key, { count: 1, reset: now + 15 * 60_000 }); return false; }
  current.count += 1;
  return current.count > 60;
}

export async function POST(request: NextRequest) {
  if (!validOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 4_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rateKey = createHash("sha256").update(`${salt}:rate:${ip}`).digest("hex");
  if (rateLimited(rateKey)) return NextResponse.json({ error: "Too many events" }, { status: 429 });

  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return new NextResponse(null, { status: 202 });
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const sessionHash = createHash("sha256").update(`${salt}:session:${parsed.data.sessionId}`).digest("hex");
  const { error } = await admin.from("opportunity_funnel_events").insert({
    tenant_id: tenantId, session_hash: sessionHash, event: parsed.data.event, locale: parsed.data.locale,
    path: parsed.data.path, step: parsed.data.step ?? null, intent: parsed.data.intent || null,
    utm_source: parsed.data.utmSource || null, utm_medium: parsed.data.utmMedium || null, utm_campaign: parsed.data.utmCampaign || null,
  });
  return new NextResponse(null, { status: error ? 202 : 204 });
}
