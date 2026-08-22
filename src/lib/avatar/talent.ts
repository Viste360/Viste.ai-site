import { z } from "zod";

export const avatarTalentSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  defaultLanguage: z.enum(["en", "es"]),
  referenceVideoAssetId: z.string().uuid(),
  referenceAudioAssetId: z.string().uuid().nullable().optional(),
  consentEvidenceAssetId: z.string().uuid(),
  consentScope: z.string().trim().min(10).max(1_000),
});

export function avatarTalentSlug(name: string, suffix: string) {
  const base = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "talent";
  return `${base}-${suffix.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}`;
}
