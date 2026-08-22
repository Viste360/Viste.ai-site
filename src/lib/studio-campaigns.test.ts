import { describe, expect, it } from "vitest";
import { canApprovePublication, hookBriefSchema, isFutureSchedule, readResponsesText, voiceRegistrationSchema } from "./studio-campaigns";

describe("Studio campaign controls", () => {
  it("requires a grounded, channel-specific hook brief", () => {
    expect(hookBriefSchema.safeParse({}).success).toBe(false);
    expect(hookBriefSchema.safeParse({ brandId: crypto.randomUUID(), name: "Launch", objective: "Build qualified awareness", audience: "Operations leaders", productOrService: "", geographicMarket: "", language: "en", platforms: ["linkedin"], desiredCta: "Book a call", idea: "Show the hidden cost of manual handoffs" }).success).toBe(true);
  });

  it("limits publish approval to review roles", () => {
    expect(canApprovePublication("reviewer")).toBe(true);
    expect(canApprovePublication("practitioner")).toBe(false);
  });

  it("rejects immediate or past schedules", () => {
    const now = Date.parse("2026-08-17T10:00:00Z");
    expect(isFutureSchedule("2026-08-17T10:00:30Z", now)).toBe(false);
    expect(isFutureSchedule("2026-08-17T10:02:00Z", now)).toBe(true);
  });

  it("reads structured text from Responses API output", () => {
    expect(readResponsesText({ output: [{ content: [{ type: "output_text", text: "{\"concepts\":[]}" }] }] })).toBe("{\"concepts\":[]}");
  });

  it("requires an account voice, language and speech model before syncing", () => {
    const input = { brandId: crypto.randomUUID(), providerVoiceId: "voice-123", languageCodes: ["en"] };
    expect(voiceRegistrationSchema.safeParse(input).success).toBe(false);
    expect(voiceRegistrationSchema.safeParse({ ...input, rightsReference: "", modelId: "eleven_multilingual_v2" }).success).toBe(true);
  });
});
