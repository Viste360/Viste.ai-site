import { z } from "zod";

export const idempotencyKeySchema = z.string().trim().min(8).max(120).regex(/^[a-zA-Z0-9:_-]+$/);

export const createBookingToolSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  startAt: z.iso.datetime({ offset: true }),
  timezone: z.string().trim().min(3).max(80),
  name: z.string().trim().min(2).max(100),
  contactChannel: z.enum(["phone", "email", "whatsapp"]),
  criticalDetailsConfirmed: z.literal(true),
});

export const captureLeadToolSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  name: z.string().trim().min(2).max(100),
  phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/),
  preferredLanguage: z.enum(["en", "es"]),
  intent: z.string().trim().min(3).max(180),
  contactDetailsConfirmed: z.literal(true),
});

export const recordOptOutToolSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/),
  scope: z.enum(["marketing", "all_outbound"]),
});

export const postCallAnalysisSchema = z.object({
  schemaVersion: z.literal("voice-post-call-v1"),
  intent: z.string().trim().min(1).max(180),
  outcome: z.string().trim().min(1).max(180),
  leadScore: z.number().int().min(0).max(100),
  summary: z.string().trim().min(1).max(2_000),
  objections: z.array(z.string().trim().max(180)).max(10),
  nextAction: z.object({ type: z.string().trim().max(80), dueAt: z.iso.datetime({ offset: true }).nullable() }).nullable(),
  quality: z.object({ disclosurePresent: z.boolean(), unsupportedClaim: z.boolean(), criticalDetailsConfirmed: z.boolean() }),
  compliance: z.object({ outboundBasisValid: z.boolean(), optOutRequested: z.boolean() }),
});
