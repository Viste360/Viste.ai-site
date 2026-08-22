import { describe, expect, it } from "vitest";
import { demoConsentVersion, voiceDemoRequestSchema } from "./demo";

const valid = {
  businessName: "Example Salon",
  websiteUrl: "https://example.com",
  firstName: "Marta",
  phoneE164: "+34 600 000 000",
  preferredLanguage: "es",
  consent: true,
  consentVersion: demoConsentVersion,
  startedAt: Date.now(),
  locale: "es",
};

describe("voice demo request", () => {
  it("normalises a consented E.164 request", () => {
    const result = voiceDemoRequestSchema.parse(valid);
    expect(result.phoneE164).toBe("+34600000000");
  });

  it("rejects missing consent, private URLs, insecure URLs and local telephone formats", () => {
    expect(voiceDemoRequestSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(voiceDemoRequestSchema.safeParse({ ...valid, websiteUrl: "https://localhost" }).success).toBe(false);
    expect(voiceDemoRequestSchema.safeParse({ ...valid, websiteUrl: "http://example.com" }).success).toBe(false);
    expect(voiceDemoRequestSchema.safeParse({ ...valid, phoneE164: "600000000" }).success).toBe(false);
  });
});
