import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const preview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
  if (preview) return { rules: { userAgent: "*", disallow: "/" } };
  const protectedPaths = ["/admin", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: protectedPaths },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: protectedPaths },
      { userAgent: "ChatGPT-User", allow: "/", disallow: protectedPaths },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: protectedPaths },
      { userAgent: "Claude-User", allow: "/", disallow: protectedPaths },
      { userAgent: "PerplexityBot", allow: "/", disallow: protectedPaths },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
