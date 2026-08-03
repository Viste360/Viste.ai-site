import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { validContact } from "../../../lib/contact.test";

const mocks = vi.hoisted(() => ({
  abortSignal: vi.fn().mockResolvedValue({ error: null }),
  insert: vi.fn(),
  update: vi.fn(),
  rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
  createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));

function request(payload: object, ip = "203.0.113.20") {
  return new NextRequest("https://viste.ai/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://viste.ai", "x-forwarded-for": ip, "x-contact-request-id": `request_${ip.replaceAll(".", "_")}` },
    body: JSON.stringify(payload),
  });
}

describe("contact API", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.abortSignal.mockResolvedValue({ error: null });
    mocks.insert.mockReturnValue({ abortSignal: mocks.abortSignal });
    mocks.createClient.mockReturnValue({ rpc: mocks.rpc, from: vi.fn().mockReturnValue({ insert: mocks.insert }) });
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "test-secret-key";
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.CONTACT_NOTIFICATION_EMAIL = "owner@example.com";
    process.env.NEXT_PUBLIC_BOOKING_URL = "https://booking.example.com/viste";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "RESEND_API_KEY", "CONTACT_NOTIFICATION_EMAIL", "NEXT_PUBLIC_BOOKING_URL"]) delete process.env[key];
  });

  it("stores, notifies and returns the qualified booking handoff", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const { POST } = await import("./route");
    const response = await POST(request(validContact));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.qualified).toBe(true);
    expect(body.bookingUrl).toBe("https://booking.example.com/viste");
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
      company_website: "https://example.com",
      preferred_language: "en",
      workflow: validContact.workflow,
      systems: validContact.systems,
      desired_outcome: validContact.desiredOutcome,
      utm_source: "search",
      utm_term: "ai implementation",
      qualified_for_booking: true,
    }));
  });

  it("succeeds when storage works but notification is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { POST } = await import("./route");
    const response = await POST(request(validContact, "203.0.113.21"));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(expect.objectContaining({ notification: "monitoring-required" }));
  });

  it("fails safely when notification works but durable storage fails", async () => {
    mocks.abortSignal.mockResolvedValue({ error: { message: "database unavailable" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const { POST } = await import("./route");
    const response = await POST(request(validContact, "203.0.113.24"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual(expect.objectContaining({ fallback: "mailto:hello@viste.ai" }));
  });

  it("returns a safe failure when no delivery provider is configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_NOTIFICATION_EMAIL;
    const { POST } = await import("./route");
    const response = await POST(request(validContact, "203.0.113.22"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual(expect.objectContaining({ fallback: "mailto:hello@viste.ai" }));
  });

  it("silently accepts a honeypot submission without delivery", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ ...validContact, faxNumber: "spam" }, "203.0.113.23"));
    expect(response.status).toBe(200);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
