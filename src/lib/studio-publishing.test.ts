import { describe, expect, it } from "vitest";
import { publishingAdapterFor } from "./studio-publishing";

describe("Studio publishing adapters", () => {
  it("fails closed until a reviewed platform adapter is configured", () => {
    expect(publishingAdapterFor("linkedin")).toBeNull();
    expect(publishingAdapterFor("manual_export")).toBeNull();
  });
});
