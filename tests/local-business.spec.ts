import { expect, test } from "@playwright/test";

test("Viste Local routes keep bilingual pricing and one-off terms in parity", async ({ page }) => {
  for (const route of ["/services/websites-for-local-businesses", "/es/servicios/paginas-web-negocios-locales"]) {
    await page.goto(route);
    await expect(page.getByText("Local Start", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/€490|490 €/).first()).toBeVisible();
    await expect(page.getByText(/from €950|desde 950 €/).first()).toBeVisible();
    await expect(page.getByText(/from €1,500|desde 1\.500 €/).first()).toBeVisible();
    await expect(page.getByText(/not monthly subscriptions|no son cuotas mensuales/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /I'm interested|Me interesa/ }).first()).toHaveAttribute("href", "#website-enquiry");
  }
});

test("Viste Local enquiry works without an existing website and submits structured values", async ({ page }) => {
  let submission: Record<string, unknown> | null = null;
  await page.route("**/api/contact", async (route) => {
    submission = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, reference: "c1234567-b123-c123-d123-e12345678900", qualified: false }) });
  });
  await page.goto("/services/websites-for-local-businesses?utm_source=instagram&utm_medium=social&utm_campaign=viste-local");
  await page.getByLabel("Contact name").fill("Local Owner");
  await page.getByLabel("Business name").fill("Example Café");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Telephone / WhatsApp").fill("+34 600 000 000");
  await page.getByLabel("Preferred package").selectOption("local-start");
  await page.getByLabel("On-site photography visit").check();
  await page.getByLabel("Business goals or missing features").fill("Explain our menu and opening hours and make WhatsApp contact easier.");
  await page.locator("#website-enquiry .consent input").check();
  await page.getByRole("button", { name: "Send — I’m interested" }).click();
  await expect(page.getByText("Thanks. We have your Viste Local enquiry.")).toBeVisible();
  expect(submission).toMatchObject({
    enquiryType: "website",
    companyWebsite: "",
    onlinePresence: "",
    preferredPackage: "local-start",
    addOns: ["photography"],
    telephone: "+34 600 000 000",
    utmSource: "instagram",
    utmMedium: "social",
    utmCampaign: "viste-local",
  });
});
