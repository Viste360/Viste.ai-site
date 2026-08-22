import { afterEach, describe, expect, it, vi } from "vitest";
import { avatarProviderStatuses, avatarRenderRequestSchema, submitOpenSourceRender } from "./render-provider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("avatar render providers", () => {
  it("keeps the self-hosted worker disabled until both server secrets exist", () => {
    vi.stubEnv("AVATAR_OPEN_SOURCE_RENDER_URL", "");
    vi.stubEnv("AVATAR_OPEN_SOURCE_RENDER_TOKEN", "");
    expect(avatarProviderStatuses().find(({ id }) => id === "open_source")?.configured).toBe(false);
    expect(avatarProviderStatuses().find(({ id }) => id === "manual")?.configured).toBe(true);
  });

  it("validates a provider-neutral render request", () => {
    expect(avatarRenderRequestSchema.parse({
      talentId: "20000000-0000-4000-8000-000000000001",
      provider: "open_source",
      script: "Good control. Give me a little more depth on the next one.",
      language: "en",
    })).toMatchObject({ aspectRatio: "9:16", background: "studio_dark" });
  });

  it("submits secrets only from the server adapter", async () => {
    vi.stubEnv("AVATAR_OPEN_SOURCE_RENDER_URL", "https://worker.example.test/");
    vi.stubEnv("AVATAR_OPEN_SOURCE_RENDER_TOKEN", "server-secret");
    vi.stubEnv("AVATAR_RENDERING_ENABLED", "true");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "worker-1", status: "queued" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await submitOpenSourceRender({
      jobId: "job-1",
      talentId: "20000000-0000-4000-8000-000000000001",
      provider: "open_source",
      sourceVideoUrl: "https://signed.example.test/source.mp4",
      script: "Two more. Make them clean and strong.",
      language: "en",
      aspectRatio: "9:16",
      background: "studio_dark",
    });
    expect(result.id).toBe("worker-1");
    expect(fetchMock).toHaveBeenCalledWith("https://worker.example.test/v1/jobs", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer server-secret" }),
    }));
  });
});
