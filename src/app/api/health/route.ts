import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function payload() {
  const storageReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
  const notificationReady = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL);
  const bookingReady = Boolean(process.env.NEXT_PUBLIC_BOOKING_URL);
  const turnstilePublic = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const turnstileSecret = Boolean(process.env.TURNSTILE_SECRET_KEY);
  const botProtection = turnstilePublic && turnstileSecret ? "ready" : turnstilePublic === turnstileSecret ? "layered-basic" : "configuration-error";
  const contactReady = storageReady && notificationReady;
  return {
    status: contactReady ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
    contact: contactReady ? "ready" : "configuration-required",
    checks: {
      leadStorage: storageReady ? "ready" : "configuration-required",
      notification: notificationReady ? "ready" : "configuration-required",
      booking: bookingReady ? "ready" : "configuration-required",
      botProtection,
      opportunityReporting: storageReady ? "ready-after-migration" : "configuration-required",
    },
  };
}

export async function GET() {
  return NextResponse.json(payload(), { headers: { "Cache-Control": "no-store" } });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
