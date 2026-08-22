import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/redirects";

const previewScriptSource = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" ? " https://vercel.live" : "";
// React's development runtime reconstructs stack traces with eval(). Keep this
// exception local to `next dev`; preview and production retain the strict CSP.
const developmentScriptSource = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline'${developmentScriptSource} https://www.googletagmanager.com https://challenges.cloudflare.com${previewScriptSource}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://challenges.cloudflare.com https://api.elevenlabs.io wss://api.elevenlabs.io https://*.livekit.cloud wss://*.livekit.cloud${previewScriptSource}; font-src 'self' data:; media-src 'self' blob: https://*.livekit.cloud; worker-src 'self' blob:; frame-src 'self' https://challenges.cloudflare.com${previewScriptSource}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests` },
];
const aiDiscoveryHeaders = [{ key: "Link", value: "</llms.txt>; rel=\"describedby\"; type=\"text/plain\"" }];

if (process.env.VERCEL_ENV === "production") securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") securityHeaders.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/:path*", has: [{ type: "header", key: "accept", value: ".*text/html.*" }], headers: aiDiscoveryHeaders },
    ];
  },
  async redirects() { return legacyRedirects.map(([source, destination]) => ({ source, destination, statusCode: 301 as const })); },
};

export default nextConfig;
