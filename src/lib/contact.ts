import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().min(2).max(120),
  companyWebsite: z.url().max(300),
  country: z.string().trim().min(2).max(100),
  preferredLanguage: z.enum(["en", "es", "other"]),
  workflow: z.string().trim().min(30).max(2500),
  systems: z.string().trim().min(2).max(1500),
  desiredOutcome: z.string().trim().min(20).max(2000),
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
});

export type ContactInput = z.infer<typeof contactSchema>;

export function qualifiesForBooking(input: Pick<ContactInput, "budget" | "timeline">) {
  return ["10k-30k", "30k-75k", "75k-plus"].includes(input.budget)
    && ["now", "quarter", "six-months"].includes(input.timeline);
}
