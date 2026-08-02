import type { NextConfig } from "next";
const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"X-Frame-Options",value:"DENY"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), browsing-topics=()"},
  {key:"Content-Security-Policy",value:"default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"},
];
if(process.env.VERCEL_ENV==="production")securityHeaders.push({key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"});
if(process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=="production")securityHeaders.push({key:"X-Robots-Tag",value:"noindex, nofollow"});
const nextConfig:NextConfig={poweredByHeader:false,reactStrictMode:true,async headers(){return[{source:"/:path*",headers:securityHeaders}]},async redirects(){return[
  {source:"/index.html",destination:"/",permanent:true},{source:"/index-es.html",destination:"/es",permanent:true},
  {source:"/privacy-policy.html",destination:"/privacy",permanent:true},{source:"/privacy-policy-es.html",destination:"/es/privacidad",permanent:true},
  {source:"/privacy-policy",destination:"/privacy",permanent:true},
  {source:"/term-and-condition.html",destination:"/terms",permanent:true},{source:"/term-and-condition-es.html",destination:"/es/terminos",permanent:true},
  {source:"/cookie-policy/en",destination:"/cookies",permanent:true},{source:"/cookie-policy/es",destination:"/es/cookies",permanent:true},
  {source:"/guestterms/en",destination:"/terms",permanent:true},{source:"/guestterms/es",destination:"/es/terminos",permanent:true},
  {source:"/guestterms/terms-en.html",destination:"/terms",permanent:true},{source:"/guestterms/terms-es.html",destination:"/es/terminos",permanent:true},
  {source:"/guestterms/privacy-en.html",destination:"/privacy",permanent:true},{source:"/guestterms/privacy-es.html",destination:"/es/privacidad",permanent:true},
  {source:"/guestterms/cookie-en.html",destination:"/cookies",permanent:true},{source:"/guestterms/cookie-es.html",destination:"/es/cookies",permanent:true},
];}};export default nextConfig;
