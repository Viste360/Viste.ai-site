import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

describe("product subdomain routing", () => {
  it("serves the English voice experience at the voice subdomain root", () => {
    const response = proxy(new NextRequest("https://voice.viste.ai/"));

    expect(response.headers.get("x-middleware-rewrite")).toBe("https://voice.viste.ai/voice");
    expect(response.headers.get("permissions-policy")).toContain("microphone=(self)");
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
  });

  it("serves the Spanish voice experience at the voice subdomain language root", () => {
    const response = proxy(new NextRequest("https://voice.viste.ai/es"));

    expect(response.headers.get("x-middleware-rewrite")).toBe("https://voice.viste.ai/es/voz");
    expect(response.headers.get("permissions-policy")).toContain("microphone=(self)");
  });

  it("allows the microphone on direct voice paths and denies it elsewhere", () => {
    const voiceResponse = proxy(new NextRequest("https://viste.ai/voice"));
    const siteResponse = proxy(new NextRequest("https://viste.ai/"));

    expect(voiceResponse.headers.get("permissions-policy")).toContain("microphone=(self)");
    expect(siteResponse.headers.get("permissions-policy")).toContain("microphone=()");
  });
});
