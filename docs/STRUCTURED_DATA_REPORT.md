# Structured data validation report

Validation date: 3 August 2026

Method: parse every rendered `application/ld+json` block in desktop and mobile browser tests and verify required types against visible page content.

| Type | Where emitted | Guard |
|---|---|---|
| `Organization` | Site roots and public pages | Uses only the visible Viste.ai name, URL and logo; no invented address or registration |
| `WebSite` | Site roots | Canonical production URL and visible site name |
| `Service` | Service detail pages | Name and description match visible page copy |
| `BreadcrumbList` | Deep public pages | Matches visible breadcrumb navigation |
| `Article` | Insight detail pages | Organization author, publication date, calculated read time context and visible headline |
| `Person` | Approved founder profile only | Completely omitted unless required verified fields and explicit approval flag are present |

Result: all JSON parsed successfully; supported templates contained the expected types; unapproved `Person` data did not render. Before production, run the final public URLs through Google Rich Results Test and Schema.org Validator after promotion, because the preview is intentionally noindex.
