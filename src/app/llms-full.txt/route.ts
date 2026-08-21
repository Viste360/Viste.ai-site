import { allPages } from "@/content/pages";
import { growthPages } from "@/content/growth";
import { insights } from "@/content/insights";
import { legalPages } from "@/content/legal";
import { siteUrl } from "@/content/site";

type Entry = { locale: "en" | "es"; title: string; description: string; path: string };

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

  const body = `# Viste.ai approved public content map

> Canonical source inventory for Viste.ai public, reviewed English and Spanish pages.

Viste.ai provides senior-led AI implementation and automation for established businesses. The site describes capabilities, decision guidance and clearly labelled illustrative workflows. It does not claim invented clients, partnerships, certifications, offices or results. AI recommendations require appropriate human review, access controls and measurement.

${sections}

## Canonical controls

- Website: ${siteUrl}
- Sitemap: ${new URL("/sitemap.xml", siteUrl)}
- Robots policy: ${new URL("/robots.txt", siteUrl)}
- Contact: hello@viste.ai

This optional text map does not override canonical HTML, indexing directives, the sitemap or the robots policy.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
