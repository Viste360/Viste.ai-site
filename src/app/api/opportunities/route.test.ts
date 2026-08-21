import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  abortSignal: vi.fn().mockResolvedValue({ error: null }),
  insert: vi.fn(),
  eq: vi.fn().mockResolvedValue({ error: null }),
  update: vi.fn(),
  rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
  createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));

const validOpportunity = {
  locale: "en",
  initialNeed: "We provide outsourced sales services to B2B software companies and want more customers.",
  currentProcess: "Qualified leads are scattered across inboxes and CRM follow-up is inconsistent.",
  affectedUsers: "The business team and its customers",
  volume: "weekly",
  businessImpact: "Win more customers while giving the team a consistent follow-up process.",
  desiredOutcome: "Win more customers with a clear process agreed with the Viste team.",
  systems: "Systems and tools to be confirmed during a human review",
  dataReadiness: "low",
  processOwnership: "medium",
  stakeholderAccess: "medium",
  timeline: "planning",
  commercialReadiness: "medium",
  risk: "LOW",
  constraints: "Final scope and consequential actions require human review.",
  advisorTranscript: "Visitor: We need a better sales process.\n\nViste Advisor: I can see why scattered follow-up slows the team down.",
  name: "Test Person",
  email: "test@example.com",
  phone: "+34 600 000 000",
  company: "Example Ltd",
  region: "Spain",
  consent: true,
  consentWording: "I agree that Viste.ai may use these details to respond to and qualify my enquiry under the privacy notice.",
  sourceUrl: "https://viste.ai/",
  referrer: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmTerm: "",
  utmContent: "",
  gclid: "",
  faxNumber: "",
  turnstileToken: "",
  startedAt: Date.now() - 5_000,
};

function request(payload: object, ip = "203.0.113.60") {
  return new NextRequest("https://viste.ai/api/opportunities", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://viste.ai", "x-forwarded-for": ip },
    body: JSON.stringify(payload),
  });
}

describe("opportunity advisor API", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.abortSignal.mockResolvedValue({ error: null });
    mocks.insert.mockReturnValue({ abortSignal: mocks.abortSignal });
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.createClient.mockReturnValue({ rpc: mocks.rpc, from: vi.fn().mockReturnValue({ insert: mocks.insert, update: mocks.update }) });
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "test-secret-key";
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.CONTACT_NOTIFICATION_EMAIL = "hello@viste.ai";
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "RESEND_API_KEY", "CONTACT_NOTIFICATION_EMAIL", "TURNSTILE_SECRET_KEY"]) delete process.env[key];
  });

  it("stores the reachable lead, notifies the team and avoids the missing opportunity RPC", async () => {
    const emailFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", emailFetch);
    const { POST } = await import("./route");
    const response = await POST(request(validOpportunity));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expect.objectContaining({ ok: true, intent: "SALES_CRM", notification: "sent" }));
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: "Test Person",
      email: "test@example.com",
      phone: "+34 600 000 000",
      company: "Example Ltd",
      source: "advisor",
      status: "new",
    }));
    expect(mocks.rpc).toHaveBeenCalledWith("check_contact_rate_limit", expect.any(Object));
    expect(mocks.rpc).not.toHaveBeenCalledWith("create_viste_opportunity", expect.any(Object));
    expect(emailFetch).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({ method: "POST" }));
    const emailPayload = JSON.parse(emailFetch.mock.calls[0][1].body as string);
    expect(emailPayload).toEqual(expect.objectContaining({ to: ["hello@viste.ai"], reply_to: "test@example.com" }));
    expect(emailPayload.subject).toBe("Advisor lead: Test Person — Sales and CRM Automation");
    expect(emailPayload.text).toContain("Calendar offered after submission:");
    expect(emailPayload.text).toContain("Advisor conversation:");
    expect(emailFetch.mock.calls[0][1].headers).toEqual(expect.objectContaining({ "Idempotency-Key": expect.stringMatching(/^advisor-lead-/) }));
  });

  it("confirms the handoff when email works but CRM storage needs monitoring", async () => {
    mocks.abortSignal.mockResolvedValue({ error: { message: "database unavailable" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const { POST } = await import("./route");
    const response = await POST(request(validOpportunity, "203.0.113.61"));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(expect.objectContaining({ notification: "sent", storage: "monitoring-required" }));
  });

  it("still delivers the lead to the inbox when CRM storage is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    const emailFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", emailFetch);
    const { POST } = await import("./route");
    const response = await POST(request(validOpportunity, "203.0.113.63"));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(expect.objectContaining({ notification: "sent", storage: "monitoring-required" }));
    expect(emailFetch).toHaveBeenCalledOnce();
  });

  it("does not claim success when the Viste inbox could not be notified", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { POST } = await import("./route");
    const response = await POST(request(validOpportunity, "203.0.113.62"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual(expect.objectContaining({ fallback: "mailto:hello@viste.ai" }));
  });
});
