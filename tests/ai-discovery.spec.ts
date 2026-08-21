import { expect, test } from "@playwright/test";

test("AI discovery maps provide bilingual identity, service and pricing facts", async ({ request }) => {
  const conciseResponse = await request.get("/llms.txt");
  expect(conciseResponse.status()).toBe(200);
  expect(conciseResponse.headers()["content-type"]).toContain("text/plain");
  const concise = await conciseResponse.text();
  expect(concise).toContain("# Viste.ai");
  expect(concise).toContain("## English service directory");
  expect(concise).toContain("## Directorio de servicios en español");
  expect(concise).toContain("Viste Local public pricing");
  expect(concise).toContain("Local Start: €490 fixed project price");
  expect(concise).toContain("https://viste.ai/services/websites-for-local-businesses");
  expect(concise).toContain("https://viste.ai/es/servicios/paginas-web-negocios-locales");
  expect(concise).toContain("does not guarantee ranking or citation");

  const fullResponse = await request.get("/llms-full.txt");
  expect(fullResponse.status()).toBe(200);
  expect(fullResponse.headers()["content-type"]).toContain("text/plain");
  const full = await fullResponse.text();
  expect(full).toContain("## Service catalogue / Catálogo de servicios");
  expect(full).toContain("## Solution patterns / Patrones de solución");
  expect(full).toContain("## Industry contexts / Contextos sectoriales");
  expect(full).toContain("Business problem:");
  expect(full).toContain("Problema empresarial:");
  expect(full).toContain("Delivery approach:");
  expect(full).toContain("Enfoque de entrega:");
  expect(full).not.toContain("https://viste.ai/admin");
  expect(full).not.toContain("https://viste.ai/api/");
});

test("production crawler policy explicitly permits major AI search and retrieval bots", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  for (const crawler of ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot"]) {
    expect(robots).toContain(`User-Agent: ${crawler}`);
  }
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Disallow: /api/");
  expect(robots).toContain("Sitemap: https://viste.ai/sitemap.xml");
});

test("public pages advertise the AI-readable source map", async ({ request }) => {
  for (const path of ["/", "/es", "/services/websites-for-local-businesses", "/es/servicios/paginas-web-negocios-locales"]) {
    const response = await request.get(path, { headers: { accept: "text/html" } });
    expect(response.headers().link).toBe('</llms.txt>; rel="describedby"; type="text/plain"');
  }
});

test("Viste Local structured data exposes only the visible project pricing", async ({ page }) => {
  for (const path of ["/services/websites-for-local-businesses", "/es/servicios/paginas-web-negocios-locales"]) {
    await page.goto(path);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const catalog = scripts.map((script) => JSON.parse(script)).find((item) => item["@type"] === "OfferCatalog");
    expect(catalog.url).toBe(`https://viste.ai${path}`);
    expect(catalog.itemListElement).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "Local Start", price: "490", priceCurrency: "EUR" }),
      expect.objectContaining({ name: "Local Business", price: "950", priceCurrency: "EUR" }),
      expect.objectContaining({ name: "Signature", price: "1500", priceCurrency: "EUR" }),
    ]));
  }
});
