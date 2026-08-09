import type { MetadataRoute } from "next";
import { allPages } from "@/content/pages";
import { legalPages } from "@/content/legal";
import { insights } from "@/content/insights";
import { siteUrl } from "@/content/site";
import { growthPages } from "@/content/growth";

type Pair = { en: string; es: string; lastModified: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" };

export default function sitemap(): MetadataRoute.Sitemap {
  const pairs: Pair[] = [
    { en: "/", es: "/es", lastModified: "2026-08-03", priority: 1, changeFrequency: "weekly" },
    { en: "/contact", es: "/es/contacto", lastModified: "2026-08-03", priority: 0.9, changeFrequency: "monthly" },
    { en: "/insights", es: "/es/recursos", lastModified: "2026-08-03", priority: 0.8, changeFrequency: "weekly" },
    { en: "/solutions/whatsapp-sales-service-control/demo", es: "/es/soluciones/control-ventas-servicio-whatsapp/demo", lastModified: "2026-08-03", priority: 0.8, changeFrequency: "monthly" },
    ...growthPages.filter((page) => page.locale === "en" && page.publishApproved).map((page) => ({ en: page.path, es: page.alternatePath, lastModified: page.lastReviewed, priority: 0.8, changeFrequency: "monthly" as const })),
    ...allPages.filter((page) => page.locale === "en").map((page) => ({ en: page.path, es: page.alternatePath, lastModified: "2026-08-03", priority: page.path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.7, changeFrequency: "monthly" as const })),
    ...legalPages.filter((page) => page.locale === "en").map((page) => ({ en: page.path, es: page.alternatePath, lastModified: "2026-08-03", priority: 0.4, changeFrequency: "yearly" as const })),
    ...insights.map((insight) => ({ en: insight.path.en, es: insight.path.es, lastModified: insight.publishedAt, priority: 0.6, changeFrequency: "monthly" as const })),
  ];

  return pairs.flatMap((pair) => {
    const languages = { en: new URL(pair.en, siteUrl).toString(), es: new URL(pair.es, siteUrl).toString(), "x-default": new URL(pair.en, siteUrl).toString() };
    return [pair.en, pair.es].map((path) => ({
      url: new URL(path, siteUrl).toString(),
      lastModified: new Date(pair.lastModified),
      changeFrequency: pair.changeFrequency,
      priority: pair.priority,
      alternates: { languages },
    }));
  });
}
