import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { insights } from "../src/content/insights";
import { legalPages } from "../src/content/legal";
import { allPages } from "../src/content/pages";
import { growthPages, growthPairs } from "../src/content/growth";
import { legacyRedirects } from "../src/config/redirects";

const coreRoutes = ["/", "/es", "/advisor", "/es/asesor", "/voice", "/es/voz", "/ai-for-my-business", "/es/ia-para-mi-negocio", "/tools/ai-automation-roi-calculator", "/es/herramientas/calculadora-roi-automatizacion-ia", "/questions", "/es/preguntas", "/services/ai-opportunity-sprint", "/es/servicios/sprint-oportunidades-ia", "/services/website-app-development", "/es/servicios/desarrollo-web-aplicaciones", "/solutions/whatsapp-sales-service-control", "/es/soluciones/control-ventas-servicio-whatsapp", "/solutions/whatsapp-sales-service-control/demo", "/es/soluciones/control-ventas-servicio-whatsapp/demo", "/industries/hospitality-property", "/es/sectores/hospitalidad-propiedades", "/insights/choose-first-ai-use-case", "/es/recursos/elegir-primer-caso-uso-ia", "/privacy", "/es/privacidad", "/contact", "/es/contacto"];
const publicPairs = [
  ["/", "/es"],
  ["/contact", "/es/contacto"],
  ["/advisor", "/es/asesor"],
  ["/voice", "/es/voz"],
  ["/insights", "/es/recursos"],
  ["/solutions/whatsapp-sales-service-control/demo", "/es/soluciones/control-ventas-servicio-whatsapp/demo"],
  ...growthPairs,
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

for (const route of ["/", "/contact", "/advisor", "/voice", "/solutions/whatsapp-sales-service-control/demo", "/es", "/es/asesor", "/es/voz", "/es/ia-para-mi-negocio", "/es/herramientas/calculadora-roi-automatizacion-ia"]) test(`${route} has no serious accessibility violations`, async ({ page }) => {
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

test("homepages explain the WhatsApp workflow with an explicitly illustrative bilingual phone scenario", async ({ page }) => {
  for (const [path, heading, note, link] of [
    ["/", "Show the complicated request—not just the chatbot.", "Illustrative scenario · no client data", "/solutions/whatsapp-sales-service-control/demo"],
    ["/es", "Muestra la petición compleja, no solo el chatbot.", "Escenario ilustrativo · sin datos de clientes", "/es/soluciones/control-ventas-servicio-whatsapp/demo"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText(note).first()).toBeVisible();
    await expect(page.locator(".whatsapp-message-incoming")).toBeVisible();
    await expect(page.locator(".whatsapp-message-draft")).toBeVisible();
    await expect(page.locator(`a[href="${link}"]`).filter({ visible: true })).toBeVisible();
  }
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
  const unapprovedGrowthPaths = new Set(growthPages.filter((page) => !page.publishApproved).map((page) => page.path));
  const expectedUrls = publicPairs
    .flat()
    .filter((path) => !unapprovedGrowthPaths.has(path))
    .map((path) => new URL(path, "https://viste.ai").toString());
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  expect(new Set(sitemapUrls).size, "sitemap must not contain duplicate URLs").toBe(sitemapUrls.length);
  expect(new Set(sitemapUrls), "sitemap must contain every approved bilingual public route").toEqual(new Set(expectedUrls));
  expect(sitemap).toContain("https://viste.ai/advisor");
  expect(sitemap).toContain("https://viste.ai/es/asesor");
  expect(sitemap).toContain("hreflang=\"es\"");
  expect(sitemap).not.toContain("privacy-policy.html");
  expect(sitemap).not.toContain("https://viste.ai/admin");
  expect(sitemap).not.toContain("https://viste.ai/api/");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Disallow: /api/");
  expect(robots).toContain("Sitemap: https://viste.ai/sitemap.xml");
});

test("AI discovery maps expose only approved bilingual public sources", async ({ request }) => {
  for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain("text/plain");
    const text = await response.text();
    expect(text, path).toContain("https://viste.ai/services");
    expect(text, path).toContain("https://viste.ai/es/servicios");
    expect(text, path).toContain("hello@viste.ai");
    expect(text, path).not.toContain("https://viste.ai/admin");
    expect(text, path).not.toContain("https://viste.ai/api/");
    expect(text, path).not.toMatch(/guarantees? results|garantiza resultados/i);
  }
});

test("approved growth assets are indexable in production builds", async ({ request }) => {
  for (const [english, spanish] of growthPairs) for (const path of [english, spanish]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(await response.text(), path).toContain('name="robots" content="index, follow"');
  }
});

test("structured data is valid JSON and covers supported visible content", async ({ page }) => {
  await page.goto("/");
  const home = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(home["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual(expect.arrayContaining(["Organization", "ImageObject", "WebSite", "WebPage"]));
  expect(home["@graph"].find((item: { "@type": string }) => item["@type"] === "Organization").logo["@id"]).toBe("https://viste.ai/#logo");
  expect(home["@graph"].find((item: { "@type": string }) => item["@type"] === "ImageObject").contentUrl).toBe("https://viste.ai/icon-512.png");
  await page.goto("/es");
  const spanishHome = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(spanishHome["@graph"].find((item: { "@type": string }) => item["@type"] === "WebPage").inLanguage).toBe("es");
  await page.goto("/services/ai-opportunity-sprint");
  const service = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(service["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual(expect.arrayContaining(["BreadcrumbList", "WebPage", "Service"]));
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
  await page.getByLabel("Current website (if any)").fill("https://example.com");
  await page.getByLabel("Country / region").fill("Spain");
  await page.getByLabel("Preferred language").selectOption("en");
  await page.getByLabel("Timeline").selectOption("quarter");
  await page.getByLabel("What would you like us to build or improve?").fill("Customer requests arrive across several inboxes without clear ownership.");
  await page.getByLabel("Which systems or channels are involved? (if known)").fill("WhatsApp Business, HubSpot and email");
  await page.getByLabel("What outcome needs to change?").fill("Reduce response time and make every handoff accountable.");
  await page.getByLabel("Indicative budget").selectOption("10k-30k");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send secure enquiry" }).click();
  await expect(page.getByRole("heading", { name: "Thank you — we’ve received your enquiry." })).toBeVisible();
  await expect(page.getByText("We’ll review it and get back to you shortly.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Book the conversation" })).toHaveAttribute("href", "https://booking.example.com/viste");
});

test("contact form explains incomplete fields instead of appearing unresponsive", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send secure enquiry" }).click();
  await expect(page.locator(".form-error")).toContainText("Please review the highlighted fields");
  await expect(page.getByLabel("Name")).toBeFocused();
});

test("opportunity diagnostic shows transparent value before contact capture", async ({ page }) => {
  await page.goto("/es/ia-para-mi-negocio#diagnostic-es");
  const diagnostic = page.locator(".diagnostic");
  await expect(diagnostic.locator('input[type="email"]')).toHaveCount(0);
  await page.getByLabel("Atención al cliente").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Las solicitudes esperan o quedan sin respuesta").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Cada día").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("WhatsApp").check();
  await page.getByLabel("CRM").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Historial de conversaciones o tickets").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Una persona puede revisar antes de actuar").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Responder más rápido").check();
  await page.getByRole("button", { name: "Ver mi resultado preliminar" }).click();
  await expect(page.getByRole("heading", { name: "Candidato para operaciones de cliente y WhatsApp" })).toBeVisible();
  await expect(page.getByText("no una puntuación científica", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver servicio relacionado/ })).toHaveAttribute("href", "/es/servicios/atencion-cliente-whatsapp");
});

test("VIS_010 qualifies a visitor, recommends services and captures a reachable lead", async ({ page }) => {
  await page.route("**/api/advisor/reply", async (route) => {
    const input = route.request().postDataJSON() as { stage: "business" | "goal" | "situation"; answer: string };
    const body = input.stage === "business" && input.answer === "not sure"
      ? { reply: "No problem. To make this useful, tell me what the business sells or does and the kind of customer it helps.", nextStage: "business", normalizedAnswer: "", intent: "AI_EXPLORATION", quality: "recoverable", mode: "fallback" }
      : input.stage === "business"
        ? { reply: "Outsourced sales for B2B software companies gives me a clear picture. What improvement would create the most commercial value now?", nextStage: "goal", normalizedAnswer: input.answer, intent: "SALES_CRM", quality: "accepted", mode: "ai" }
        : input.stage === "goal"
          ? { reply: "Winning more customers is clear. Where does the sales process currently lose momentum?", nextStage: "situation", normalizedAnswer: input.answer, intent: "SALES_CRM", quality: "accepted", mode: "ai" }
          : { reply: "That sounds frustrating. I have enough context to match this with the right Viste options; leave your details first so we can carry the conversation forward.", nextStage: "ready", normalizedAnswer: input.answer, intent: "SALES_CRM", quality: "accepted", mode: "ai" };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  const advisorLead = { value: null as Record<string, unknown> | null };
  await page.route("**/api/opportunities", async (route) => {
    advisorLead.value = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, reference: "b1234567-b123-c123-d123-e12345678900", intent: "SALES_CRM", score: 82, priority: "P1_PRIORITY", confidence: 0.91, risk: "LOW", stage: "QUALIFIED", service: { label: "Sales and CRM Automation", href: "/services/sales-crm-automation" }, nextAction: "Diagnostic session with a senior practitioner", missingInformation: [], notification: "sent", storage: "stored", bookingUrl: "https://booking.example.com/viste" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Viste Opportunity Advisor" })).toHaveCount(0);
  await page.getByRole("button", { name: "Talk to Viste" }).click();
  await expect(page.getByRole("dialog", { name: "Viste Opportunity Advisor" })).toBeVisible();
  await expect(page.getByText("Hi — I’m Viste’s AI business advisor.")).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await page.getByLabel("What does your business do, and who does it serve?").fill("not sure");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/what the business sells or does/)).toBeVisible();
  await page.getByLabel("What does your business do, and who does it serve?").fill("We provide outsourced sales services to B2B software companies.");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/gives me a clear picture/)).toBeVisible();
  await page.getByRole("button", { name: "Win more customers" }).click();
  await expect(page.getByText(/sales process currently lose momentum/)).toBeVisible();
  await page.getByLabel("What is getting in the way today?").fill("Qualified leads are scattered across inboxes and CRM follow-up is inconsistent.");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/leave your details first/)).toBeVisible();
  await expect(page.locator(".chat-sales-brief")).toHaveCount(0);
  await page.getByLabel("Name").fill("Test Person");
  await page.getByLabel("Work email").fill("test@example.com");
  await page.getByLabel("Phone / WhatsApp (optional)").fill("+34 600 000 000");
  await page.getByLabel("Company").fill("Example Ltd");
  await page.getByLabel("Country / region").fill("Spain");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send my details and show next steps" }).click();
  await expect(page.getByText("Thank you — Viste has your details and conversation.")).toBeVisible();
  await expect(page.getByText("What I’d explore with you")).toBeVisible();
  await expect(page.locator(".chat-sales-brief").getByText("Sales and CRM Automation", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book a time with Rupert" })).toHaveAttribute("href", "https://booking.example.com/viste");
  await expect(page.getByRole("link", { name: "Continue on WhatsApp" })).toHaveAttribute("href", "https://wa.me/message/5IYX266Z5KPKK1");
  expect(advisorLead.value).toMatchObject({ name: "Test Person", email: "test@example.com", phone: "+34 600 000 000", company: "Example Ltd" });
  expect(String(advisorLead.value?.advisorTranscript)).toContain("Qualified leads are scattered across inboxes");
});

test("ROI planner uses user inputs and exposes three scenarios", async ({ page }) => {
  await page.goto("/es/herramientas/calculadora-roi-automatizacion-ia");
  await page.getByLabel("Personas que intervienen en cada tarea").fill("2");
  await page.getByLabel("Minutos por tarea y persona").fill("30");
  await page.getByLabel("Tareas al mes").fill("100");
  await page.getByLabel("Coste horario completo").fill("50");
  await page.getByLabel("Tasa actual de error o reproceso (%)").fill("10");
  await page.getByLabel("Parte del trabajo que podría recibir asistencia (%)").fill("80");
  await page.getByLabel("Coste único de implementación").fill("10000");
  await page.getByLabel("Coste operativo mensual").fill("200");
  await page.getByLabel("Base", { exact: true }).fill("50");
  await page.getByRole("button", { name: "Calcular escenarios de planificación" }).click();
  await expect(page.getByText("110 horas", { exact: true })).toBeVisible();
  await expect(page.getByText("5 meses", { exact: true })).toBeVisible();
  await expect(page.getByText("La capacidad liberada solo se convierte en ahorro de caja", { exact: false })).toBeVisible();
});

test("contact page provides a calendar path or an honest form fallback", async ({ page }) => {
  await page.goto("/contact");
  const booking = page.locator(".contact-layout .booking-cta .button");
  await expect(booking).toBeVisible();
  const href = await booking.getAttribute("href");
  expect(href === "#contact-form" || href?.startsWith("https://")).toBe(true);
});

test("contact API validates failure states without exposing details", async ({ request }) => {
  const unsupported = await request.post("/api/contact", { data: "invalid", headers: { "content-type": "text/plain", "x-contact-request-id": "test_request_1234" } });
  expect(unsupported.status()).toBe(415);
  expect(unsupported.headers()["x-request-id"]).toBe("test_request_1234");
  const invalid = await request.post("/api/contact", { data: { consent: false }, headers: { "content-type": "application/json" } });
  expect(invalid.status()).toBe(400);
});

test("opportunity analytics accepts only allowlisted privacy-safe events", async ({ request }) => {
  const invalid = await request.post("/api/analytics/opportunity", { data: { sessionId: crypto.randomUUID(), event: "free_text_message", locale: "en", path: "/advisor" } });
  expect(invalid.status()).toBe(400);
  const valid = await request.post("/api/analytics/opportunity", { data: { sessionId: crypto.randomUUID(), event: "advisor_started", locale: "en", step: 0, intent: "SALES_CRM", path: "/advisor", utmSource: "search", utmMedium: "organic", utmCampaign: "operations" } });
  expect([202, 204]).toContain(valid.status());
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
    expect(headers["content-security-policy"]).toContain("https://challenges.cloudflare.com");
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
    botProtection: expect.stringMatching(/ready|layered-basic|configuration-error/),
    opportunityReporting: expect.stringMatching(/ready-after-migration|configuration-required/),
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
