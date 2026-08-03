import { describe, expect, it } from "vitest";
import { contactSchema, qualifiesForBooking } from "./contact";

export const validContact = {
  name: "Test Person",
  email: "test@example.com",
  company: "Example Ltd",
  role: "Operations Director",
  companyWebsite: "https://example.com",
  country: "Spain",
  preferredLanguage: "en",
  workflow: "Customer requests arrive across several inboxes without clear ownership.",
  systems: "WhatsApp Business, HubSpot and email",
  desiredOutcome: "Reduce response time and make every handoff accountable.",
  budget: "10k-30k",
  timeline: "quarter",
  consent: true,
  faxNumber: "",
  startedAt: Date.now() - 5_000,
  locale: "en",
  sourceUrl: "https://viste.ai/contact",
  referrer: "https://example.com/article",
  utmSource: "search",
  utmMedium: "organic",
  utmCampaign: "operations",
  utmTerm: "ai implementation",
  utmContent: "guide",
} as const;

describe("contactSchema", () => {
  it("accepts a complete qualified enquiry", () => expect(contactSchema.safeParse(validContact).success).toBe(true));
  it("rejects missing consent", () => expect(contactSchema.safeParse({ ...validContact, consent: false }).success).toBe(false));
  it("rejects a short workflow", () => expect(contactSchema.safeParse({ ...validContact, workflow: "help" }).success).toBe(false));
  it("requires a valid company website", () => expect(contactSchema.safeParse({ ...validContact, companyWebsite: "example" }).success).toBe(false));
  it("qualifies only funded, near-term enquiries for booking", () => {
    expect(qualifiesForBooking(validContact)).toBe(true);
    expect(qualifiesForBooking({ budget: "exploring", timeline: "quarter" })).toBe(false);
    expect(qualifiesForBooking({ budget: "30k-75k", timeline: "planning" })).toBe(false);
  });
});
