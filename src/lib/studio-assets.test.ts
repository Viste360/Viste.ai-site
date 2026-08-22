import { describe, expect, it } from "vitest";
import { isAllowedStudioMime, safeStudioFileName, studioAssetKind } from "./studio-assets";

describe("studio asset validation", () => {
  it("allows supported media and document types", () => {
    expect(isAllowedStudioMime("video/mp4")).toBe(true);
    expect(isAllowedStudioMime("application/pdf")).toBe(true);
    expect(isAllowedStudioMime("application/x-sh")).toBe(false);
  });

  it("normalises user-controlled filenames", () => {
    expect(safeStudioFileName("../../Brand Guide (final).pdf")).toBe("Brand-Guide-final-.pdf");
    expect(safeStudioFileName("🔥")).toBe("asset");
  });

  it("maps content types to preview kinds", () => {
    expect(studioAssetKind("image/webp")).toBe("image");
    expect(studioAssetKind("video/mp4")).toBe("video");
    expect(studioAssetKind("application/pdf")).toBe("document");
  });
});

