import { z } from "zod";

export const demoConsentVersion = "voice-demo-callback-consent-2026-08-21-v1";

function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "");
}

export const voiceDemoRequestSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  websiteUrl: z.url().max(500).refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.includes(".") && !url.hostname.endsWith(".local");
  }, "Use the public HTTPS address for your business website"),
  firstName: z.string().trim().min(2).max(100),
  phoneE164: z.string().trim().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/)),
  preferredLanguage: z.enum(["en", "es"]),
  consent: z.literal(true),
  consentVersion: z.literal(demoConsentVersion),
  turnstileToken: z.string().max(2_048).optional().default(""),
  startedAt: z.number().int().positive(),
  faxNumber: z.string().max(200).optional().default(""),
  locale: z.enum(["en", "es"]),
});

export type VoiceDemoRequest = z.infer<typeof voiceDemoRequestSchema>;

export function demoConsentWording(locale: "en" | "es") {
  return locale === "es"
    ? "Solicito y acepto recibir esta llamada de demostración de VISTE realizada por Vera, una asistente de IA. Entiendo que puedo pedir que finalice la llamada o retirar mi consentimiento en cualquier momento."
    : "I request and agree to receive this VISTE demonstration call from Vera, an AI assistant. I understand that I can ask to end the call or withdraw my consent at any time.";
}
