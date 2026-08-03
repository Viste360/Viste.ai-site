import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const errorReport = z.object({
  digest: z.string().trim().max(160).optional(),
  route: z.string().trim().max(300).startsWith("/"),
  locale: z.enum(["en", "es"]),
});
const attempts = new Map<string, { count: number; reset: number }>();
const runtimeSalt = process.env.CONTACT_IP_SALT || randomUUID();

function limited(key: string) {
  const now = Date.now();
  const value = attempts.get(key);
  if (!value || value.reset < now) {
    attempts.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  value.count += 1;
  return value.count > 10;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ ok: false }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const key = createHash("sha256").update(`${runtimeSalt}:${ip}`).digest("hex");
  if (limited(key)) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = errorReport.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const event = {
    event: "client_render_error",
    eventId: randomUUID(),
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
    ...parsed.data,
  };
  console.error(JSON.stringify(event));

  const webhook = process.env.ERROR_MONITORING_WEBHOOK_URL;
  if (webhook) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
        signal: controller.signal,
      });
    } catch {
      console.error(JSON.stringify({ event: "error_monitor_delivery_failed", eventId: event.eventId }));
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json({ ok: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
