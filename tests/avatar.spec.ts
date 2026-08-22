import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [path, language, heading, startLabel] of [
  ["/avatar", "en", "Your form. Michael’s timing.", "Start coaching demo"],
  ["/es/avatar", "es", "Tu técnica. El momento justo.", "Iniciar demo de coaching"],
] as const) {
  test(`${path} renders the bilingual coach experience`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading.split(" ")[0]);
    await expect(page.getByRole("button", { name: startLabel })).toBeVisible();
    await expect(page.getByText("Caption fallback active").or(page.getByText("Respaldo por subtítulos activo"))).toBeVisible();
  });
}

test("the workout simulator exposes safety interruption and no paid avatar network path", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/avatar");
  await page.getByRole("button", { name: "Start coaching demo" }).click();
  await page.getByRole("button", { name: "I feel pain" }).click();
  await expect(page.getByText("Stop there. If you feel sharp pain, don’t push through it.", { exact: true })).toBeVisible();
  expect(requests.some((url) => /heygen|tavus|elevenlabs|d-id/i.test(url))).toBe(false);
});

test("the pilot switches from the listening loop to the two real test cues", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-08-21T12:00:00.000Z") });
  await page.goto("/avatar");
  await expect(page.locator('video[src*="idle-loop.v1.mp4"]').first()).toBeAttached();

  await page.getByRole("button", { name: "Start coaching demo" }).click();
  await page.clock.fastForward(6_100);
  await page.getByRole("button", { name: "Log a shallow rep" }).click();
  await page.getByRole("button", { name: "Log a shallow rep" }).click();
  await expect(page.locator('video[src*="squat-depth-shallow-01.v1.mp4"]')).toBeAttached();
  await expect(page.getByText("Temporary test media")).toBeVisible();

  await page.getByRole("button", { name: "Log a strong rep" }).click();
  await page.clock.fastForward(6_100);
  await expect(page.locator('video[src*="encourage-comeback-01.v1.mp4"]')).toBeAttached();
});

test("the English coach route has no serious accessibility violations", async ({ page }) => {
  await page.goto("/avatar");
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => ["critical", "serious"].includes(violation.impact || ""))).toEqual([]);
});

for (const [path, language, heading] of [
  ["/avatar/studio", "en", "Build your avatar library."],
  ["/es/avatar/studio", "es", "Crea tu biblioteca de avatares."],
] as const) {
  test(`${path} is protected by the private owner gate`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText("yon.wallace@viste.ai")).toBeVisible();
    await expect(page.getByRole("heading", { name: /One avatar|Un avatar/ })).toHaveCount(0);
  });
}

test("the authenticated Avatar Studio exposes the provider-neutral production workflow", async ({ page }) => {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  test.skip(!configuredUrl || configuredUrl.includes("example.supabase.co"), "Authenticated Avatar Studio test requires Preview public environment variables");
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
        user_metadata: {}, identities: [],
        created_at: "2026-08-21T00:00:00.000Z",
        updated_at: "2026-08-21T00:00:00.000Z",
      },
    }));
  }, { storageKey: `sb-${projectRef}-auth-token` });
  await page.route("**/api/avatar/render-jobs", async (route) => {
    if (route.request().method() === "POST") return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ job: { id: "job-new", status: "awaiting_upload" } }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      talents: [{ id: "20000000-0000-4000-8000-000000000001", display_name: "Pilot talent", status: "ready", default_language: "en", avatar_consents: [{ status: "active", expires_at: null }] }],
      jobs: [], assets: [],
      providers: [
        { id: "manual", configured: true, mode: "ingest" },
        { id: "open_source", configured: false, mode: "self_hosted" },
        { id: "heygen", configured: false, mode: "hosted" },
      ],
    }) });
  });

  await page.goto("/avatar/studio");
  await expect(page.getByRole("heading", { level: 1, name: "One avatar. A reusable video system." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Render engines" })).toBeVisible();
  await expect(page.getByText("Open-source worker", { exact: true })).toBeVisible();
  await expect(page.getByText("HeyGen connector", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create render job" })).toBeEnabled();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => ["critical", "serious"].includes(violation.impact || ""))).toEqual([]);
});
