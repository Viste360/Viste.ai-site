import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/redirects";

const previewScriptSource = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" ? " https://vercel.live" : "";
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${previewScriptSource}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com${previewScriptSource}; font-src 'self' data:; frame-src 'self'${previewScriptSource}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests` },
];

if (process.env.VERCEL_ENV === "production") securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") securityHeaders.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
  async redirects() { return legacyRedirects.map(([source, destination]) => ({ source, destination, statusCode: 301 as const })); },
};

export default nextConfig;
