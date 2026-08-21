import { siteUrl } from "@/content/site";

const absolute = (path: string) => new URL(path, siteUrl).toString();

export function GET() {
  const body = `# Viste.ai

> Senior-led AI implementation and automation for established businesses, delivered in English and Spanish.

Viste.ai helps established businesses identify suitable operational AI opportunities, design controlled pilots and integrate approved systems into real workflows. Public solution blueprints are illustrative capabilities, not client case studies or guaranteed results.

## Primary pages

- [Services](${absolute("/services")}): English overview of discovery, automation, knowledge, customer operations and data services.
- [Servicios](${absolute("/es/servicios")}): Resumen en español de servicios de diagnóstico, automatización, conocimiento, operaciones de cliente y datos.
- [Viste Local — websites for local businesses](${absolute("/services/websites-for-local-businesses")}): One-off website and connected digital-presence packages from €490; third-party and optional ongoing costs are separate.
- [Viste Local — páginas web para negocios locales](${absolute("/es/servicios/paginas-web-negocios-locales")}): Webs y presencia digital conectada en un proyecto único desde 490 €; los costes de terceros y servicios continuos opcionales se pagan aparte.
- [Solutions](${absolute("/solutions")}): English solution blueprints with implementation boundaries and human controls.
- [Soluciones](${absolute("/es/soluciones")}): Diseños de solución en español con límites de implementación y control humano.
- [Industries](${absolute("/industries")}): Operational contexts where the approach may apply.
- [Sectores](${absolute("/es/sectores")}): Contextos operativos donde puede aplicarse el enfoque.
- [Process](${absolute("/process")}): How Viste.ai discovers, designs, pilots, integrates and measures.
- [Proceso](${absolute("/es/proceso")}): Cómo Viste.ai diagnostica, diseña, pilota, integra y mide.

## Decision resources

- [Insights](${absolute("/insights")}): Reviewed English guidance for AI decision-makers.
- [Recursos](${absolute("/es/recursos")}): Orientación revisada en español para responsables de IA.
- [Practical questions](${absolute("/questions")}): Plain-language answers and decision boundaries.
- [Preguntas prácticas](${absolute("/es/preguntas")}): Respuestas claras y límites de decisión.
- [AI opportunity diagnostic](${absolute("/ai-for-my-business")}): A transparent, non-scientific starting-point diagnostic.
- [Diagnóstico de oportunidades de IA](${absolute("/es/ia-para-mi-negocio")}): Diagnóstico inicial transparente y no científico.

## Contact and canonical sources

- [Discuss your use case](${absolute("/contact")}) or email hello@viste.ai.
- [Cuéntanos tu caso](${absolute("/es/contacto")}) o escribe a hello@viste.ai.
- [XML sitemap](${absolute("/sitemap.xml")}) lists approved indexable routes and language alternates.
- [Extended content map](${absolute("/llms-full.txt")}) lists the approved public source set.

This optional file is maintained for systems that choose to read llms.txt. It is not a ranking control and does not replace the canonical HTML pages, robots.txt or sitemap.xml.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
