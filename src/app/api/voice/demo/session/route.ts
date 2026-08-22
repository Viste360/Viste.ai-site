import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getVoiceConfig } from "@/lib/voice/config";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

const inputSchema = z.object({ locale: z.enum(["en", "es"]), turnstileToken: z.string().max(2_048).optional().default("") });
const attempts = new Map<string, { count: number; resetAt: number }>();
const sessionRuntimeSalt = randomUUID();

function limited(key: string) {
  const now = Date.now();
  const item = attempts.get(key);
  if (!item || item.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  item.count += 1;
  return item.count > 3;
}

export async function POST(request: NextRequest) {
  const config = getVoiceConfig();
  if (!config.enabled || config.globalKillSwitch || !config.elevenLabsApiKey || !config.veraAgentId) return NextResponse.json({ error: "Vera is not available right now" }, { status: 503 });
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    if (originHost !== request.nextUrl.host) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limitKey = createHmac("sha256", config.phoneHashSalt || sessionRuntimeSalt).update(ip).digest("hex");
  if (limited(limitKey)) return NextResponse.json({ error: "Please wait before starting another conversation" }, { status: 429 });
  const turnstile = await verifyTurnstileToken({ token: parsed.data.turnstileToken, idempotencyKey: randomUUID(), expectedAction: "viste_voice_session" });
  if (!turnstile.success) return NextResponse.json({ error: "Please complete the anti-spam check" }, { status: 403 });

  const url = new URL("/v1/convai/conversation/token", "https://api.elevenlabs.io");
  url.searchParams.set("agent_id", config.veraAgentId);
  url.searchParams.set("environment", process.env.VERCEL_ENV === "production" ? "production" : "staging");
  const response = await fetch(url, { headers: { "xi-api-key": config.elevenLabsApiKey }, cache: "no-store", signal: AbortSignal.timeout(10_000) }).catch(() => null);
  if (!response?.ok) return NextResponse.json({ error: "Vera could not start the conversation" }, { status: 502 });
  const result = await response.json().catch(() => null) as { token?: unknown } | null;
  if (typeof result?.token !== "string") return NextResponse.json({ error: "Vera could not start the conversation" }, { status: 502 });
  return NextResponse.json({ conversationToken: result.token, locale: parsed.data.locale }, { headers: { "Cache-Control": "private, no-store" } });
}
