import { z } from "zod";

export const contactSchema = z.object({
  enquiryType: z.enum(["general", "website"]).optional().default("general"),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().max(120).optional().default(""),
  companyWebsite: z.union([z.url().max(300), z.literal("")]).optional().default(""),
  onlinePresence: z.string().trim().max(1200).optional().default(""),
  telephone: z.string().trim().max(80).optional().default(""),
  preferredPackage: z.enum(["local-start", "local-business", "signature", "not-sure"]).optional(),
  addOns: z.array(z.enum(["photography", "booking", "qr", "profiles", "meta-ads", "change-pack"])).max(6).optional().default([]),
  marketingSource: z.enum(["google", "instagram", "referral", "whatsapp", "event", "other", ""]).optional().default(""),
  country: z.string().trim().max(100).optional().default(""),
  preferredLanguage: z.enum(["en", "es", "other"]),
  workflow: z.string().trim().max(2500),
  systems: z.string().trim().max(1500).optional().default(""),
  desiredOutcome: z.string().trim().max(2500),
  budget: z.enum(["exploring", "under-10k", "10k-30k", "30k-75k", "75k-plus", "undisclosed"]),
  timeline: z.enum(["now", "quarter", "six-months", "planning"]),
  consent: z.literal(true),
  faxNumber: z.string().max(200).optional().default(""),
  startedAt: z.number().int().positive(),
  locale: z.enum(["en", "es"]),
  sourceUrl: z.string().url().max(500).optional().default("https://viste.ai"),
  referrer: z.string().max(500).optional().default(""),
  utmSource: z.string().max(120).optional().default(""),
  utmMedium: z.string().max(120).optional().default(""),
  utmCampaign: z.string().max(120).optional().default(""),
  utmTerm: z.string().max(120).optional().default(""),
  utmContent: z.string().max(120).optional().default(""),
}).superRefine((input, context) => {
  if (input.enquiryType === "general") {
    if (input.role.length < 2) context.addIssue({ code: "custom", path: ["role"], message: "Role is required" });
    if (input.country.length < 2) context.addIssue({ code: "custom", path: ["country"], message: "Country is required" });
    if (input.workflow.length < 30) context.addIssue({ code: "custom", path: ["workflow"], message: "Workflow is too short" });
    if (input.desiredOutcome.length < 20) context.addIssue({ code: "custom", path: ["desiredOutcome"], message: "Desired outcome is too short" });
  }
  if (input.enquiryType === "website") {
    if (input.telephone.length < 5) context.addIssue({ code: "custom", path: ["telephone"], message: "Telephone is required" });
    if (!input.preferredPackage) context.addIssue({ code: "custom", path: ["preferredPackage"], message: "Package is required" });
    if (input.desiredOutcome.length < 20) context.addIssue({ code: "custom", path: ["desiredOutcome"], message: "Business goals are too short" });
  }
});

export type ContactInput = z.infer<typeof contactSchema>;

export function qualifiesForBooking(input: Pick<ContactInput, "budget" | "timeline">) {
  return ["10k-30k", "30k-75k", "75k-plus"].includes(input.budget)
    && ["now", "quarter", "six-months"].includes(input.timeline);
}
