import type { Insight, Locale, PageDefinition } from "@/content/types";
import type { GrowthPage } from "@/content/growth";
import { insightMinutes, insightSources } from "@/content/insight-meta";
import { siteUrl } from "@/content/site";
import { approvedFounder, publicConfig } from "@/lib/public-config";

type JsonObject = Record<string, unknown>;

function Script({ data }: { data: JsonObject }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

function organization(): JsonObject {
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Viste.ai",
    legalName: publicConfig.legalOperator.companyName,
    url: siteUrl,
    email: "hello@viste.ai",
    description: "Senior-led website, business app, automation and AI development for established businesses.",
    logo: { "@id": `${siteUrl}/#logo` },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business enquiries",
      email: "hello@viste.ai",
      availableLanguage: ["English", "Spanish"],
    },
  };
}

function logo(): JsonObject {
  return {
    "@type": "ImageObject",
    "@id": `${siteUrl}/#logo`,
    contentUrl: new URL("/icon-512.png", siteUrl).toString(),
    width: 512,
    height: 512,
    caption: "Viste.ai",
  };
}

function webPage(path: string, title: string, description: string, locale: Locale): JsonObject {
  const url = new URL(path, siteUrl).toString();
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

function person(): JsonObject | null {
  if (!approvedFounder) return null;
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#founder`,
    name: approvedFounder.name,
    jobTitle: approvedFounder.role,
    description: approvedFounder.bio,
    image: approvedFounder.imageUrl,
    sameAs: approvedFounder.profileUrl ? [approvedFounder.profileUrl] : undefined,
    worksFor: { "@id": `${siteUrl}/#organization` },
  };
}

function breadcrumbs(path: string, title: string, locale: Locale): JsonObject {
  const base = locale === "en" ? "/" : "/es";
  const firstSegment = path.replace(/^\/es\/?/, "").split("/").filter(Boolean)[0];
  const labels: Record<string, Record<Locale, string>> = {
    services: { en: "Services", es: "Servicios" }, servicios: { en: "Services", es: "Servicios" },
    solutions: { en: "Solutions", es: "Soluciones" }, soluciones: { en: "Solutions", es: "Soluciones" },
    industries: { en: "Industries", es: "Sectores" }, sectores: { en: "Industries", es: "Sectores" },
    insights: { en: "Insights", es: "Recursos" }, recursos: { en: "Insights", es: "Recursos" },
  };
  const items = [{ "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Inicio", item: new URL(base, siteUrl).toString() }];
  const parentLabel = labels[firstSegment]?.[locale];
  if (parentLabel && path.split("/").filter(Boolean).length > (locale === "es" ? 2 : 1)) {
    const parentPath = locale === "es" ? `/es/${firstSegment}` : `/${firstSegment}`;
    items.push({ "@type": "ListItem", position: 2, name: parentLabel, item: new URL(parentPath, siteUrl).toString() });
  }
  items.push({ "@type": "ListItem", position: items.length + 1, name: title, item: new URL(path, siteUrl).toString() });
  return { "@type": "BreadcrumbList", itemListElement: items };
}

export function HomeJsonLd({ locale }: { locale: Locale }) {
  const path = locale === "en" ? "/" : "/es";
  const graph: JsonObject[] = [organization(), logo(), {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Viste.ai",
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: ["en", "es"],
  }, webPage(
    path,
    locale === "en" ? "Viste.ai — Website, app and AI development for businesses" : "Viste.ai — Desarrollo web, aplicaciones e IA para empresas",
    locale === "en"
      ? "Viste.ai designs and builds websites, business apps, admin tools, databases and controlled AI systems."
      : "Viste.ai diseña y construye webs, aplicaciones de negocio, herramientas de administración, bases de datos y sistemas de IA controlados.",
    locale,
  )];
  const founder = person();
  if (founder) graph.push(founder);
  return <Script data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

export function PageJsonLd({ page }: { page: PageDefinition }) {
  const graph: JsonObject[] = [
    breadcrumbs(page.path, page.title, page.locale),
    webPage(page.path, page.title, page.description, page.locale),
  ];
  if (/^\/(es\/)?servic(?:es|ios)\//.test(page.path)) {
    graph.push({
      "@type": "Service",
      "@id": `${new URL(page.path, siteUrl)}#service`,
      name: page.title,
      description: page.description,
      url: new URL(page.path, siteUrl).toString(),
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "Worldwide",
      inLanguage: page.locale,
    });
  }
  if ((page.path === "/about" || page.path === "/es/nosotros") && approvedFounder) {
    graph.push(organization(), person() as JsonObject);
  }
  return <Script data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

export function GrowthPageJsonLd({ page }: { page: GrowthPage }) {
  return <Script data={{
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbs(page.path, page.title, page.locale),
      {
        "@type": "WebPage",
        "@id": `${new URL(page.path, siteUrl)}#webpage`,
        name: page.title,
        description: page.description,
        url: new URL(page.path, siteUrl).toString(),
        inLanguage: page.locale,
        dateModified: page.lastReviewed,
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  }} />;
}

export function ArticleJsonLd({ insight, locale }: { insight: Insight; locale: Locale }) {
  const path = insight.path[locale];
  const sources = insightSources[insight.id] || [];
  return <Script data={{
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbs(path, insight.title[locale], locale),
      {
        "@type": "Article",
        "@id": `${new URL(path, siteUrl)}#article`,
        headline: insight.title[locale],
        description: insight.description[locale],
        datePublished: insight.publishedAt,
        dateModified: insight.publishedAt,
        inLanguage: locale,
        timeRequired: `PT${insightMinutes(insight, locale)}M`,
        mainEntityOfPage: new URL(path, siteUrl).toString(),
        image: new URL("/og.png", siteUrl).toString(),
        author: { "@type": "Organization", name: "Viste.ai", url: siteUrl },
        publisher: { "@id": `${siteUrl}/#organization` },
        citation: sources.map((source) => source.url),
      },
    ],
  }} />;
}
