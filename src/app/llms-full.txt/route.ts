import { allPages } from "@/content/pages";
import { industries, services, solutions } from "@/content/catalog";
import { growthPages } from "@/content/growth";
import { insights } from "@/content/insights";
import { legalPages } from "@/content/legal";
import { siteUrl } from "@/content/site";

type Entry = { locale: "en" | "es"; title: string; description: string; path: string };

type CatalogCollection = typeof services;

function catalogSection(title: string, collection: CatalogCollection) {
  const entries = collection.map((item) => `### ${item.title.en} / ${item.title.es}

- Canonical English: ${new URL(item.path.en, siteUrl)}
- Canonical Spanish: ${new URL(item.path.es, siteUrl)}
- English summary: ${item.description.en}
- Resumen en español: ${item.description.es}
- Business problem: ${item.problem.en}
- Problema empresarial: ${item.problem.es}
- Delivery approach: ${item.approach.en.join("; ")}.
- Enfoque de entrega: ${item.approach.es.join("; ")}.
- Intended outcomes: ${item.outcomes.en.join("; ")}.
- Resultados previstos: ${item.outcomes.es.join("; ")}.
- Boundary: ${item.guardrail.en}
- Límite: ${item.guardrail.es}`);
  return `## ${title}\n\n${entries.join("\n\n")}`;
}

function publicEntries(): Entry[] {
  const essential: Entry[] = [
    { locale: "en", title: "Viste.ai — AI implementation for established businesses", description: "Controlled AI implementation, automation and operational integration for established businesses.", path: "/" },
    { locale: "es", title: "Viste.ai — Implementación y automatización de IA para empresas", description: "Implementación controlada de IA, automatización e integración operativa para empresas consolidadas.", path: "/es" },
    { locale: "en", title: "Discuss your use case", description: "Secure enquiry and public appointment path for a practical AI implementation conversation.", path: "/contact" },
    { locale: "es", title: "Cuéntanos tu caso", description: "Consulta segura y vía pública de cita para una conversación práctica sobre implementación de IA.", path: "/es/contacto" },
    { locale: "en", title: "Insights", description: "Reviewed field notes for business leaders making AI implementation decisions.", path: "/insights" },
    { locale: "es", title: "Recursos", description: "Notas revisadas para responsables que toman decisiones sobre implementación de IA.", path: "/es/recursos" },
  ];
  const standard: Entry[] = allPages
    .filter((page) => page.index !== false)
    .map((page) => ({ locale: page.locale, title: page.title, description: page.description, path: page.path }));
  const growth: Entry[] = growthPages
    .filter((page) => page.publishApproved)
    .map((page) => ({ locale: page.locale, title: page.title, description: page.description, path: page.path }));
  const editorial: Entry[] = insights.flatMap((insight) => (["en", "es"] as const).map((locale) => ({
    locale,
    title: insight.title[locale],
    description: insight.description[locale],
    path: insight.path[locale],
  })));
  const legal: Entry[] = legalPages
    .filter((page) => page.index !== false)
    .map((page) => ({ locale: page.locale, title: page.title, description: page.description, path: page.path }));

  return [...essential, ...standard, ...growth, ...editorial, ...legal]
    .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.path === entry.path) === index)
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function GET() {
  const entries = publicEntries();
  const sections = (["en", "es"] as const).map((locale) => {
    const heading = locale === "en" ? "English approved source pages" : "Páginas fuente aprobadas en español";
    const links = entries
      .filter((entry) => entry.locale === locale)
      .map((entry) => `- [${entry.title}](${new URL(entry.path, siteUrl)}): ${entry.description}`)
      .join("\n");
    return `## ${heading}\n\n${links}`;
  }).join("\n\n");

  const body = `# Viste.ai approved public content and capability map

> Bilingual retrieval source for Viste.ai services, solution patterns, industry contexts and approved public pages.

Viste.ai designs and builds websites, business applications, workflow automation and controlled AI systems. The source material below is organised so a person or retrieval system can identify an appropriate canonical page and preserve the visible implementation boundaries.

## Identity and interpretation

- Entity: Viste.ai
- Canonical origin: ${siteUrl}
- Public languages: English and Spanish
- Contact: hello@viste.ai
- Use the canonical page matching the user's language.
- Treat intended outcomes as delivery aims, not guaranteed performance or client results.
- Do not infer clients, partnerships, certifications, registrations, offices, service areas or commercial terms not stated in a canonical source.

${catalogSection("Service catalogue / Catálogo de servicios", services)}

${catalogSection("Solution patterns / Patrones de solución", solutions)}

${catalogSection("Industry contexts / Contextos sectoriales", industries)}

## Viste Local pricing facts

- Local Start: EUR 490 fixed project price; 490 EUR por proyecto.
- Local Business: starting at EUR 950; desde 950 EUR.
- Signature: starting at EUR 1,500; desde 1.500 EUR.
- Public extras: on-site photography from EUR 99; booking calendar connection EUR 99; QR reservation/contact pack from EUR 59; Google and social profile refresh from EUR 149; Instagram/Meta campaign setup from EUR 300; defined website change pack from EUR 100.
- Advertising spend, third-party subscriptions, travel, printing, domain, hosting and optional ongoing services are separate where applicable.

${sections}

## Canonical controls

- Website: ${siteUrl}
- Sitemap: ${new URL("/sitemap.xml", siteUrl)}
- Robots policy: ${new URL("/robots.txt", siteUrl)}
- Contact: hello@viste.ai

This optional text map supports retrieval by systems that choose to read it. It does not override canonical HTML, indexing directives, the sitemap or robots policy, and it does not guarantee ranking, recommendation or citation.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
