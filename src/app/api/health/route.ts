import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function payload() {
  const contactReady = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY)
    || (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL),
  );
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
    contact: contactReady ? "ready" : "direct",
  };
}

export async function GET() {
  return NextResponse.json(payload(), { headers: { "Cache-Control": "no-store" } });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
