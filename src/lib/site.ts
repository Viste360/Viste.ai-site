import type { Metadata } from "next";
import { siteUrl } from "@/content/site";
import type { Locale } from "@/content/types";

export function absolute(path: string) { return new URL(path, siteUrl).toString(); }

export function pageMetadata(input: { title: string; description: string; path: string; alternatePath: string; locale: Locale; noIndex?: boolean; type?: "website" | "article" }): Metadata {
  const preview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path, languages: input.locale === "en" ? { "en": input.path, "es": input.alternatePath, "x-default": input.path } : { "es": input.path, "en": input.alternatePath, "x-default": input.alternatePath } },
    openGraph: { title: input.title, description: input.description, url: input.path, type: input.type || "website", locale: input.locale === "en" ? "en_GB" : "es_ES", alternateLocale: input.locale === "en" ? ["es_ES"] : ["en_GB"], siteName: "Viste.ai", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Viste.ai — AI implementation for established businesses" }] },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: ["/og.png"] },
    robots: input.noIndex || preview ? { index: false, follow: false } : { index: true, follow: true },
  };
}
