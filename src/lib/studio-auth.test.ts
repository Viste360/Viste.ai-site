import { describe, expect, it } from "vitest";
import { STUDIO_OWNER_EMAIL, studioUserIsOwner } from "./studio-auth";

describe("Studio owner authentication", () => {
  it("accepts only the configured owner using Google", () => {
    expect(studioUserIsOwner({ email: STUDIO_OWNER_EMAIL, app_metadata: { provider: "google" } })).toBe(true);
    expect(studioUserIsOwner({ email: STUDIO_OWNER_EMAIL.toUpperCase(), app_metadata: { providers: ["email", "google"] } })).toBe(true);
  });

  it("rejects every other email and non-Google identity", () => {
    expect(studioUserIsOwner({ email: "someone@viste.ai", app_metadata: { provider: "google" } })).toBe(false);
    expect(studioUserIsOwner({ email: STUDIO_OWNER_EMAIL, app_metadata: { provider: "email" } })).toBe(false);
    expect(studioUserIsOwner(null)).toBe(false);
  });
});
