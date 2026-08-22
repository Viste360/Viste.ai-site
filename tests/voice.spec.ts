import { expect, test } from "@playwright/test";

test("VISTE Voice renders the bilingual commercial and compliance experience", async ({ page }) => {
  await page.goto("/voice");
  await expect(page.getByRole("heading", { name: /Your business never misses/ })).toBeVisible();
  await expect(page.getByText("Vera always identifies herself as AI.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Voice Sales" })).toBeVisible();
  await expect(page.getByText("Requested callbacks and documented warm leads only—never scraped cold-call lists.")).toBeVisible();
  await expect(page.locator('a[href="/es/voz"]').first()).toHaveAttribute("href", "/es/voz");

  await page.goto("/es/voz");
  await expect(page.getByRole("heading", { name: /Tu negocio no vuelve a perder/ })).toBeVisible();
  await expect(page.getByText("Vera siempre se identifica como IA.")).toBeVisible();
  await expect(page.getByText("Solo callbacks solicitados y oportunidades cálidas documentadas; nunca listas extraídas de internet.")).toBeVisible();
  await expect(page.locator('a[href="/voice"]').first()).toHaveAttribute("href", "/voice");
});

test("requested callback captures explicit consent and shows a safe queued outcome", async ({ page }) => {
  await page.route("**/api/voice/demo/request", async (route) => route.fulfill({
    status: 202,
    contentType: "application/json",
    body: JSON.stringify({ accepted: true, reference: "a1234567-b123-c123-d123-e12345678900", status: "queued" }),
  }));
  await page.goto("/voice#callback");
  await page.getByLabel("Business name").fill("Example Salon");
  await page.getByLabel("Business website").fill("https://example.com");
  await page.getByLabel("First name").fill("Marta");
  await page.getByLabel("Telephone number").fill("+34 600 000 000");
  await page.getByLabel("Demo language").selectOption("es");
  await page.getByRole("checkbox").check();
  const submit = page.getByRole("button", { name: "Call me with the demo" });
  await submit.evaluate((button) => button.removeAttribute("disabled"));
  await submit.click();
  await expect(page.getByRole("heading", { name: /Your requested demo is saved/ })).toBeVisible();
  await expect(page.getByText("Request reference: a1234567")).toBeVisible();
});
