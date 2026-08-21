import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

function request(body: object, ip: string, origin = "https://viste.ai") {
  return new NextRequest("https://viste.ai/api/advisor/reply", {
    method: "POST",
    headers: { "content-type": "application/json", origin, "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("advisor reply API", () => {
  afterEach(() => { delete process.env.OPENAI_API_KEY; });

  it("prefers the direct OpenAI provider when a server key is configured", async () => {
    process.env.OPENAI_API_KEY = "test-key-not-used";
    const { advisorProvider } = await import("./route");
    expect(advisorProvider()).toBe("openai");
  });

  it("uses the Vercel AI Gateway only when no direct OpenAI key is configured", async () => {
    const { advisorProvider } = await import("./route");
    expect(advisorProvider()).toBe("gateway");
  });

  it("returns a useful same-stage reply for a vague answer without calling a model", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ locale: "en", stage: "business", answer: "not sure", context: { business: "", goal: "", situation: "" } }, "203.0.113.81"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ nextStage: "business", mode: "fallback", normalizedAnswer: "" }));
  });

  it("routes a human request to contact without exposing contact channels", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ locale: "en", stage: "situation", answer: "I want to talk to Rupert", context: { business: "A retailer", goal: "Improve support", situation: "" } }, "203.0.113.82"));
    const body = await response.json();
    expect(body.nextStage).toBe("contact");
    expect(JSON.stringify(body)).not.toContain("wa.me");
    expect(JSON.stringify(body)).not.toContain("mailto:");
  });

  it("closes a repeated low-quality conversation without calling a model", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ locale: "en", stage: "business", answer: "asdfasdfasdf", recoveryAttempts: 1, context: { business: "", goal: "", situation: "" } }, "203.0.113.84"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ nextStage: "closed", quality: "rejected", mode: "fallback" }));
  });

  it("closes the exact repeated Spanish meta-question flow", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ locale: "es", stage: "business", answer: "qué problema dices", recoveryAttempts: 1, context: { business: "", goal: "", situation: "" } }, "203.0.113.85"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ nextStage: "closed", quality: "rejected", mode: "fallback" }));
  });

  it("rejects cross-origin use", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ locale: "en", stage: "business", answer: "A useful answer", context: { business: "", goal: "", situation: "" } }, "203.0.113.83", "https://attacker.example"));
    expect(response.status).toBe(403);
  });
});
