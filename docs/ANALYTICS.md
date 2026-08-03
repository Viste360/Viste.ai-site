# Analytics and consent

Vercel Web Analytics and Speed Insights provide first-party traffic and Core Web Vitals monitoring. They are enabled by default in production but are not rendered until the visitor selects “Allow analytics.” Set `NEXT_PUBLIC_ENABLE_ANALYTICS=false` to disable all optional measurement. Rejecting analytics leaves the site fully usable; the choice is stored locally and can be reopened from the footer.

GA4 remains optional. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` only after the property and legal basis are approved. It follows the same consent choice as Vercel measurement.

Enable Web Analytics and Speed Insights for the Vercel project before expecting dashboard data. Do not add ad pixels, session replay, Tag Manager or Consent Mode without a fresh privacy review. Lead source URL, referrer and approved UTM fields are stored with the enquiry when Supabase is configured.
