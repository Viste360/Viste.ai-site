# SEO migration guide

The canonical origin is `https://viste.ai`. Every page publishes self-canonical, English/Spanish alternates and `x-default`; the generated sitemap contains only public routes. Vercel previews receive noindex metadata, robots denial and `X-Robots-Tag` defense in depth.

Legacy mappings live in `next.config.ts` and are tested in Playwright. Do not remove a redirect because the source is absent from navigation. Before major route changes, review Search Console landing pages and backlinks. The historical site is preserved at `pre-viste-global-rebuild-2026-08-02` and `archive/legacy-hospitality-site`.

After launch, verify `/robots.txt`, `/sitemap.xml`, canonical/hreflang tags and legacy redirects at one hour, one day, one week and one month. Submit the sitemap in Search Console without changing DNS.
