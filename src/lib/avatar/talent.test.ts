import { describe, expect, it } from "vitest";
import { avatarTalentSchema, avatarTalentSlug } from "./talent";

describe("avatar talent", () => {
  it("creates a stable safe slug", () => {
    expect(avatarTalentSlug("Míchael Coach", "A1B2-C3D4")).toBe("michael-coach-a1b2c3d4");
  });

  it("requires both a reference video and consent evidence", () => {
    expect(avatarTalentSchema.safeParse({ displayName: "Michael", defaultLanguage: "en" }).success).toBe(false);
  });
});
