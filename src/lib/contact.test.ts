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

export const validWebsiteContact = {
  name: "Local Owner",
  email: "owner@example.com",
  company: "Example Café",
  enquiryType: "website",
  role: "",
  telephone: "+34 600 000 000",
  companyWebsite: "",
  onlinePresence: "https://instagram.com/example-cafe",
  preferredPackage: "local-start",
  addOns: ["photography", "booking"],
  marketingSource: "instagram",
  country: "",
  preferredLanguage: "en",
  workflow: "We need a clear website with menus, opening hours and easy contact.",
  systems: "https://instagram.com/example-cafe",
  desiredOutcome: "Help customers understand the business and contact us easily.",
  budget: "exploring",
  timeline: "planning",
  consent: true,
  faxNumber: "",
  startedAt: Date.now() - 5_000,
  locale: "en",
  sourceUrl: "https://viste.ai/services/websites-for-local-businesses?utm_source=instagram",
  referrer: "",
  utmSource: "instagram",
  utmMedium: "social",
  utmCampaign: "viste-local",
  utmTerm: "",
  utmContent: "",
} as const;

describe("contactSchema", () => {
  it("accepts a complete qualified enquiry", () => expect(contactSchema.safeParse(validContact).success).toBe(true));
  it("rejects missing consent", () => expect(contactSchema.safeParse({ ...validContact, consent: false }).success).toBe(false));
  it("rejects a short workflow", () => expect(contactSchema.safeParse({ ...validContact, workflow: "help" }).success).toBe(false));
  it("accepts an enquiry before a website or technical systems exist", () => expect(contactSchema.safeParse({ ...validContact, companyWebsite: "", systems: "" }).success).toBe(true));
  it("accepts a structured website enquiry without an existing website", () => expect(contactSchema.safeParse({ ...validWebsiteContact, onlinePresence: "", systems: "" }).success).toBe(true));
  it("requires a telephone and package for a website enquiry", () => {
    expect(contactSchema.safeParse({ ...validWebsiteContact, telephone: "" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validWebsiteContact, preferredPackage: undefined }).success).toBe(false);
  });
  it("requires a valid company website when one is provided", () => expect(contactSchema.safeParse({ ...validContact, companyWebsite: "example" }).success).toBe(false));
  it("qualifies only funded, near-term enquiries for booking", () => {
    expect(qualifiesForBooking(validContact)).toBe(true);
    expect(qualifiesForBooking({ budget: "exploring", timeline: "quarter" })).toBe(false);
    expect(qualifiesForBooking({ budget: "30k-75k", timeline: "planning" })).toBe(false);
  });
});
