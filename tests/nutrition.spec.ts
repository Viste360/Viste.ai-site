import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [path, title, signIn] of [
  ["/nutrition", "Your personal nutrition coach", "Email me a private access link"],
  ["/es/nutricion", "Tu asesor nutricional personal", "Enviarme un enlace de acceso privado"],
] as const) {
  test(`${path} presents the private nutrition experience`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByLabel(path.startsWith("/es") ? "Tu email" : "Your email")).toBeVisible();
    await expect(page.getByRole("button", { name: signIn })).toBeVisible();
    await expect(page.getByText(/does not diagnose|No diagnostica/)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
}

test("the Spanish nutrition gate has no serious accessibility violations", async ({ page }) => {
  await page.goto("/es/nutricion");
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => ["critical", "serious"].includes(violation.impact || ""))).toEqual([]);
});
