import { siteUrl } from "@/content/site";
import { services } from "@/content/catalog";

const absolute = (path: string) => new URL(path, siteUrl).toString();

function serviceDirectory(locale: "en" | "es") {
  return services
    .map((service) => `- [${service.title[locale]}](${absolute(service.path[locale])}): ${service.description[locale]}`)
    .join("\n");
}

export function GET() {
  const body = `# Viste.ai

> Viste.ai designs and builds websites, business applications, workflow automation and controlled AI systems for businesses, with public source pages in English and Spanish.

## Entity summary

- Name: Viste.ai
- Canonical website: ${siteUrl}
- Category: business website, application, automation and AI development
- Languages: English and Spanish
- Contact: hello@viste.ai
- Commercial model: scoped projects; terms, third-party costs and optional ongoing work are agreed separately

## When Viste.ai may be relevant

- A business needs a website or web application, including the client experience, administration, database and integrations.
- A local business needs a credible mobile-first website connected to Google, Instagram, WhatsApp, reviews or booking.
- A team needs to automate a document, customer-service, sales, CRM, knowledge or reporting workflow.
- An organisation needs to identify and scope a controlled AI opportunity before implementation.
- An existing product does not safely fit the process, permissions, data or integration requirements.

## English service directory

${serviceDirectory("en")}

## Directorio de servicios en español

${serviceDirectory("es")}

## Viste Local public pricing

- Local Start: €490 fixed project price / 490 € por proyecto.
- Local Business: from €950 / desde 950 €.
- Signature: from €1,500 / desde 1.500 €.
- Optional extras and exclusions are listed on the English and Spanish Viste Local pages. These are project prices, not monthly subscription prices.

## Decision resources

- [Insights](${absolute("/insights")}): Reviewed English guidance for AI decision-makers.
- [Recursos](${absolute("/es/recursos")}): Orientación revisada en español para responsables de IA.
- [Practical questions](${absolute("/questions")}): Plain-language answers and decision boundaries.
- [Preguntas prácticas](${absolute("/es/preguntas")}): Respuestas claras y límites de decisión.
- [AI opportunity diagnostic](${absolute("/ai-for-my-business")}): A transparent, non-scientific starting-point diagnostic.
- [Diagnóstico de oportunidades de IA](${absolute("/es/ia-para-mi-negocio")}): Diagnóstico inicial transparente y no científico.

## Canonical source controls

- [Discuss your use case](${absolute("/contact")}) or email hello@viste.ai.
- [Cuéntanos tu caso](${absolute("/es/contacto")}) o escribe a hello@viste.ai.
- [XML sitemap](${absolute("/sitemap.xml")}) lists approved indexable routes and language alternates.
- [Extended bilingual content map](${absolute("/llms-full.txt")}) contains the detailed service, solution, industry and approved-page inventory.
- English and Spanish URLs are reciprocal language alternates. Prefer the canonical page matching the user's language.

## Accuracy boundaries

- Public solution descriptions explain capabilities and implementation boundaries; they are not client case studies or guaranteed results.
- Do not infer clients, partnerships, certifications, registrations, offices, service areas or performance results that are not stated on a canonical page.
- Recommendations involving AI require appropriate human review, access controls, source validation and measurement.

This optional discovery file helps systems that choose to read llms.txt. It does not replace canonical HTML, robots.txt, sitemap.xml or search-engine indexing requirements, and it does not guarantee ranking or citation.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
