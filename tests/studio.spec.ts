import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [path, language, heading] of [
  ["/studio", "en", "One idea. Every channel. Always on brand."],
  ["/es/studio", "es", "Una idea. Todos los canales. Siempre fiel a tu marca."],
] as const) {
  test(`${path} renders the Studio product shell`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('[aria-label="Viste Studio"]').first()).toBeVisible();
  });
}

test("every Studio workspace route is hidden behind the owner-only Google gate", async ({ page }) => {
  for (const [path, language, heading] of [
    ["/app", "en", "Your Studio. Your access only."],
    ["/app/create", "en", "Your Studio. Your access only."],
    ["/app/assets", "en", "Your Studio. Your access only."],
    ["/app/calendar", "en", "Your Studio. Your access only."],
    ["/es/app", "es", "Tu Studio. Solo tu acceso."],
    ["/es/app/create", "es", "Tu Studio. Solo tu acceso."],
    ["/es/app/assets", "es", "Tu Studio. Solo tu acceso."],
    ["/es/app/calendar", "es", "Tu Studio. Solo tu acceso."],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText("yon.wallace@viste.ai")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your studio, in motion|Tu estudio, en movimiento|Create|Crear|Assets|Recursos|Calendar|Calendario/ })).toHaveCount(0);
  }
});

test("Studio landing has no serious accessibility violations", async ({ page }) => {
  await page.goto("/studio");
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => ["critical", "serious"].includes(violation.impact || ""))).toEqual([]);
});

test("private creation and calendar controls are not rendered before authentication", async ({ page }) => {
  await page.goto("/app/create");
  await expect(page.getByText("Retention-oriented · never a virality guarantee")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Generate 3 openings" })).toHaveCount(0);
  await page.goto("/app/calendar");
  await expect(page.getByText("No silent auto-posting")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Approve & schedule" })).toHaveCount(0);
});

test("authenticated Studio creation is simple and loads the real provider catalogue", async ({ page }) => {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  test.skip(!configuredUrl || configuredUrl.includes("example.supabase.co"), "Authenticated Studio test requires Preview public environment variables");
  const projectRef = new URL(configuredUrl as string).hostname.split(".")[0];
  await page.addInitScript(({ storageKey }) => {
    localStorage.setItem(storageKey, JSON.stringify({
      access_token: "test-owner-token",
      refresh_token: "test-owner-refresh",
      expires_at: 4_102_444_800,
      expires_in: 3_600,
      token_type: "bearer",
      user: {
        id: "10000000-0000-4000-8000-000000000099",
        aud: "authenticated",
        role: "authenticated",
        email: "yon.wallace@viste.ai",
        app_metadata: { provider: "google", providers: ["google"] },
        user_metadata: {},
        identities: [],
        created_at: "2026-08-18T00:00:00.000Z",
        updated_at: "2026-08-18T00:00:00.000Z",
      },
    }));
  }, { storageKey: `sb-${projectRef}-auth-token` });
  await page.route("**/api/studio/campaigns", async (route) => {
    if (route.request().method() === "PATCH") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ saved: true }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      brands: [{ id: "20000000-0000-4000-8000-000000000001", name: "Viste.ai", default_language: "en", default_voice_id: null, default_tts_model_id: "eleven_multilingual_v2" }],
      voices: [],
      campaigns: [],
      canManageVoices: true,
    }) });
  });
  await page.route("**/api/studio/elevenlabs/catalog", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
    voices: [{ voiceId: "voice-one", name: "Natural Narrator", category: "premade", description: "Warm and conversational", previewUrl: "", labels: { accent: "British" }, languages: ["en", "es"], highQualityModelIds: ["eleven_multilingual_v2"] }],
    models: [{ modelId: "eleven_multilingual_v2", name: "Multilingual v2", description: "", languages: ["en", "es"] }],
  }) }));

  await page.goto("/app/create");
  await expect(page.getByRole("heading", { level: 1, name: "Create" })).toBeVisible();
  await expect(page.getByText("Viste.ai", { exact: true })).toBeVisible();
  await expect(page.getByText("ElevenLabs", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Choose a voice")).toHaveValue("voice-one");
  await expect(page.getByLabel("Choose a speech model")).toHaveValue("eleven_multilingual_v2");
  await expect(page.getByText("1 voice")).toBeVisible();
  await expect(page.getByText("1 model")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create 3 openings" })).toBeEnabled();
  await expect(page.getByText("Product or service")).not.toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => ["critical", "serious"].includes(violation.impact || ""))).toEqual([]);
});
