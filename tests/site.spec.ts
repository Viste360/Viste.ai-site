import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { insights } from "../src/content/insights";
import { legalPages } from "../src/content/legal";
import { allPages } from "../src/content/pages";
import { legacyRedirects } from "../src/config/redirects";

const coreRoutes = ["/", "/es", "/services/ai-opportunity-sprint", "/es/servicios/sprint-oportunidades-ia", "/solutions/whatsapp-sales-service-control", "/es/soluciones/control-ventas-servicio-whatsapp", "/solutions/whatsapp-sales-service-control/demo", "/es/soluciones/control-ventas-servicio-whatsapp/demo", "/industries/hospitality-property", "/es/sectores/hospitalidad-propiedades", "/insights/choose-first-ai-use-case", "/es/recursos/elegir-primer-caso-uso-ia", "/privacy", "/es/privacidad", "/contact", "/es/contacto"];
const publicPairs = [
  ["/", "/es"],
  ["/contact", "/es/contacto"],
  ["/insights", "/es/recursos"],
  ["/solutions/whatsapp-sales-service-control/demo", "/es/soluciones/control-ventas-servicio-whatsapp/demo"],
  ...allPages.filter((page) => page.locale === "en").map((page) => [page.path, page.alternatePath]),
  ...legalPages.filter((page) => page.locale === "en").map((page) => [page.path, page.alternatePath]),
  ...insights.map((insight) => [insight.path.en, insight.path.es]),
] as [string, string][];

for (const route of coreRoutes) test(`${route} renders without browser errors`, async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto(route, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(errors).toEqual([]);
});

for (const route of ["/", "/contact", "/solutions/whatsapp-sales-service-control/demo", "/es"]) test(`${route} has no serious accessibility violations`, async ({ page }) => {
  await page.goto(route);
  const consent = page.getByRole("button", { name: /Essential only|Solo esenciales/ });
  if (await consent.isVisible()) await consent.click();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => ["critical", "serious"].includes(violation.impact || ""))).toEqual([]);
});

test("mobile navigation opens, closes and switches to the equivalent page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/ai-opportunity-sprint");
  const trigger = page.getByRole("button", { name: "Open menu" });
  const panel = page.locator(".mobile-menu-panel");
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/mobile-menu-open/);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("link", { name: /Language ES/ }).click();
  await expect(page).toHaveURL(/\/es\/servicios\/sprint-oportunidades-ia$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("Spanish routes render only the Spanish server shell", async ({ request, page }) => {
  const response = await request.get("/es/servicios/sprint-oportunidades-ia");
  const html = (await response.text()).replace(/<script[\s\S]*?<\/script>/gi, "");
  expect(html).toMatch(/<html[^>]+lang="es"/);
  expect((html.match(/<header\b/g) || []).length).toBe(1);
  expect((html.match(/<footer\b/g) || []).length).toBe(1);
  expect(html).not.toContain("Main navigation");
  expect(html).not.toContain("Global delivery · English &amp; Spanish");
  await page.goto("/es/servicios/sprint-oportunidades-ia");
  await expect(page.locator('nav[aria-label="Navegación principal"]')).toHaveCount(1);
  await expect(page.locator(".header-actions .language")).toHaveAttribute("href", "/services/ai-opportunity-sprint");
});

test("every legacy URL is a direct 301 to its canonical destination", async ({ request }) => {
  for (const [from, to] of legacyRedirects) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(301);
    expect(response.headers().location, from).toBe(to);
  }
});

test("legacy homepage anchors remain meaningful in both languages", async ({ page }) => {
  for (const route of ["/", "/es"]) for (const anchor of ["body", "features", "pricing", "cta", "how-it-works", "key-benefits", "demo-video", "faq", "testimonials"]) {
    await page.goto(`${route}#${anchor}`);
    await expect(page.locator(`#${anchor}`), `${route}#${anchor}`).toHaveCount(1);
  }
});

test("all public pages have unique metadata, canonical, reciprocal hreflang and social image", async ({ request }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const [english, spanish] of publicPairs) for (const [path, alternate, locale] of [[english, spanish, "en"], [spanish, english, "es"]] as const) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || "";
    expect(title, path).not.toBe("");
    expect(description, path).not.toBe("");
    expect(titles.has(`${locale}:${title}`), path).toBe(false);
    expect(descriptions.has(`${locale}:${description}`), path).toBe(false);
    titles.add(`${locale}:${title}`);
    descriptions.add(`${locale}:${description}`);
    const canonical = new URL(path, "https://viste.ai").toString().replace(/\/$/, "");
    const alternateUrl = new URL(alternate, "https://viste.ai").toString().replace(/\/$/, "");
    expect(html, path).toContain(`rel="canonical" href="${canonical}"`);
    expect(html, path).toContain(`hrefLang="${locale === "en" ? "es" : "en"}" href="${alternateUrl}"`);
    expect(html, path).toContain("property=\"og:title\"");
    expect(html, path).toContain("property=\"og:description\"");
    expect(html, path).toContain("property=\"og:image\" content=\"https://viste.ai/og.png\"");
  }
});

test("sitemap and robots expose the production crawl contract", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://viste.ai/solutions/whatsapp-sales-service-control/demo");
  expect(sitemap).toContain("https://viste.ai/industries/multi-location-businesses");
  expect(sitemap).toContain("hreflang=\"es\"");
  expect(sitemap).not.toContain("privacy-policy.html");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Sitemap: https://viste.ai/sitemap.xml");
});

test("structured data is valid JSON and covers supported visible content", async ({ page }) => {
  await page.goto("/");
  const home = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(home["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual(expect.arrayContaining(["Organization", "WebSite"]));
  await page.goto("/services/ai-opportunity-sprint");
  const service = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(service["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual(expect.arrayContaining(["BreadcrumbList", "Service"]));
  await page.goto("/insights/choose-first-ai-use-case");
  const article = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(article["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual(expect.arrayContaining(["BreadcrumbList", "Article"]));
  await expect(page.getByRole("heading", { name: "Sources and further reading" })).toBeVisible();
  await expect(page.getByText("Viste.ai", { exact: true }).first()).toBeVisible();
});

test("interactive demo exposes the full illustrative control flow", async ({ page }) => {
  await page.goto("/solutions/whatsapp-sales-service-control/demo");
  await expect(page.getByText("ILLUSTRATIVE DATA · NOT CLIENT RESULTS")).toBeVisible();
  await expect(page.getByText("Unanswered alert")).toBeVisible();
  const approve = page.getByRole("button", { name: "Review and approve" });
  await expect(approve).toBeDisabled();
  await page.getByLabel("Owner").selectOption("Maya");
  await approve.click();
  await expect(page.getByRole("button", { name: "Human approved ✓" })).toBeVisible();
  await page.getByRole("button", { name: "Send to CRM" }).click();
  await expect(page.getByRole("button", { name: "Sent to CRM ✓" })).toBeVisible();
});

test("contact form exposes every qualification field and a tested booking success state", async ({ page }) => {
  await page.route("**/api/contact", async (route) => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, reference: "a1234567-b123-c123-d123-e12345678900", qualified: true, bookingUrl: "https://booking.example.com/viste" }) }));
  await page.goto("/contact?utm_source=search&utm_medium=organic&utm_campaign=operations");
  await page.getByLabel("Name").fill("Test Person");
  await page.getByLabel("Work email").fill("test@example.com");
  await page.getByLabel("Company", { exact: true }).fill("Example Ltd");
  await page.getByLabel("Role").fill("Operations Director");
  await page.getByLabel("Company website").fill("https://example.com");
  await page.getByLabel("Country / region").fill("Spain");
  await page.getByLabel("Preferred language").selectOption("en");
  await page.getByLabel("Timeline").selectOption("quarter");
  await page.getByLabel("Which workflow should work better?").fill("Customer requests arrive across several inboxes without clear ownership.");
  await page.getByLabel("Which systems and channels are involved?").fill("WhatsApp Business, HubSpot and email");
  await page.getByLabel("What outcome needs to change?").fill("Reduce response time and make every handoff accountable.");
  await page.getByLabel("Indicative budget").selectOption("10k-30k");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send secure enquiry" }).click();
  await expect(page.getByRole("heading", { name: "Thank you. Your enquiry was delivered securely." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book the conversation" })).toHaveAttribute("href", "https://booking.example.com/viste");
});

test("contact API validates failure states without exposing details", async ({ request }) => {
  const unsupported = await request.post("/api/contact", { data: "invalid", headers: { "content-type": "text/plain", "x-contact-request-id": "test_request_1234" } });
  expect(unsupported.status()).toBe(415);
  expect(unsupported.headers()["x-request-id"]).toBe("test_request_1234");
  const invalid = await request.post("/api/contact", { data: { consent: false }, headers: { "content-type": "application/json" } });
  expect(invalid.status()).toBe(400);
});

test("security headers protect every page template", async ({ request }) => {
  for (const path of ["/", "/es", "/contact", "/solutions/whatsapp-sales-service-control/demo"]) {
    const headers = (await request.get(path)).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
  }
});

test("health endpoint reports a non-secret operational state", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const body = await response.json();
  expect(["ok", "degraded"]).toContain(body.status);
  expect(["ready", "configuration-required"]).toContain(body.contact);
  expect(body.checks).toEqual(expect.objectContaining({
    leadStorage: expect.stringMatching(/ready|configuration-required/),
    notification: expect.stringMatching(/ready|configuration-required/),
    booking: expect.stringMatching(/ready|configuration-required/),
  }));
  expect(body.release).toBeTruthy();
});

test("unapproved founder and legal placeholders never render", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator(".founder-profile")).toHaveCount(0);
  await page.goto("/privacy");
  await expect(page.getByText(/example\.com|placeholder|TBD/i)).toHaveCount(0);
  await expect(page.getByText(/form activates|activate automatically/i)).toHaveCount(0);
});
