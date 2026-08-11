# Analytics and consent

Vercel Web Analytics and Speed Insights provide first-party traffic and Core Web Vitals monitoring. They are enabled by default in production but are not rendered until the visitor selects “Allow analytics.” Set `NEXT_PUBLIC_ENABLE_ANALYTICS=false` to disable all optional measurement. Rejecting analytics leaves the site fully usable; the choice is stored locally and can be reopened from the footer.

GA4 remains optional. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` only after the property and legal basis are approved. It follows the same consent choice as Vercel measurement.

Enable Web Analytics and Speed Insights for the Vercel project before expecting dashboard data. Do not add ad pixels, session replay, Tag Manager or Consent Mode without a fresh privacy review. Lead source URL, referrer and approved UTM fields are stored with the enquiry when Supabase is configured.

VIS_010 adds a first-party Opportunity Control report. Pre-submission events (`advisor_viewed`, `advisor_started`, `advisor_brief_viewed` and `advisor_handoff_started`) are sent only after the visitor accepts optional analytics. They contain an ephemeral session identifier that is hashed on the server, locale, route, step, classified intent and allowlisted UTM values. They never contain names, emails, free-text answers, raw IP addresses, GCLIDs or device fingerprints.

Submitted-opportunity counts come from explicit-consent operational records, so the report labels the difference between consented pre-submission interactions and enquiry records. Apply `202608110002_vis_010_analytics_and_abuse.sql` after the base VIS_010 migration. Set `ANALYTICS_SESSION_SALT` to a separate random server-only value; do not reuse it in a client variable.
