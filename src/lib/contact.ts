import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().max(120).optional().default(""),
  country: z.string().trim().max(100).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  challenge: z.string().trim().min(30).max(4000),
  budget: z.enum(["exploring", "under-10k", "10k-30k", "30k-75k", "75k-plus", "undisclosed"]),
  timeline: z.enum(["now", "quarter", "six-months", "planning"]),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
  locale: z.enum(["en", "es"]),
  sourceUrl: z.string().url().max(500).optional().default("https://viste.ai"),
  referrer: z.string().max(500).optional().default(""),
  utmSource: z.string().max(120).optional().default(""),
  utmMedium: z.string().max(120).optional().default(""),
  utmCampaign: z.string().max(120).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
