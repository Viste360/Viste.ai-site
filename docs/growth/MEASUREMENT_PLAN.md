# Search-to-qualified-demand measurement plan

## Privacy boundary

Optional analytics run only after the visitor selects “Allow analytics.” Event properties are allowlisted to non-personal operational values: locale, step number, recommendation category, source, destination, qualification state and scenario label. Free-text answers, names, emails, companies and confidential workflow details are dropped by the analytics wrapper.

Diagnostic selections stay in React memory only. They are not written to local storage or included in analytics. The “email or save summary” action opens the visitor’s email client and does not collect an address. The ROI tool runs entirely in the browser and does not persist inputs or place them in the URL.

## Stable event taxonomy

| Event | When it fires | Allowed properties |
| --- | --- | --- |
| `diagnostic_viewed` | Diagnostic client component becomes available | locale |
| `diagnostic_started` | First answer is selected | locale |
| `diagnostic_step_completed` | A valid step is advanced | locale, step |
| `diagnostic_completed` | Rule-based result is calculated | locale, result |
| `recommendation_viewed` | Recommendation is rendered | locale, result |
| `roi_tool_started` | First calculator field receives focus | locale |
| `roi_tool_completed` | Valid scenarios are calculated | locale, scenario |
| `content_cta_clicked` | Calendar/contact decision CTA is used | locale, source, destination |
| `service_viewed_from_content` | Diagnostic recommendation opens a service/blueprint | locale, source, destination |
| `lead_form_started` | Contact form receives first focus | locale |
| `lead_submitted` | Server confirms durable lead storage | locale, qualified |
| `whatsapp_clicked` | Tracked WhatsApp contact path is selected | locale, source |
| `email_summary_requested` | Client-side diagnostic summary action is selected | locale, result |

## Funnel

1. Non-brand discovery
2. Engaged decision support
3. Service or Solution Blueprint view
4. Diagnostic or tool completion
5. Contact or booking action
6. Qualified opportunity
7. Paid Opportunity Sprint
8. Pilot or implementation pipeline

The public website can directly measure stages 1–5. Stage 6 is available in the secure lead record when configured. Stages 7–8 require an approved CRM or privacy-safe manual outcome import; closed-loop revenue attribution must not be claimed before that connection exists.

## Primary decisions

- Search intent → diagnostic/tool completion
- Diagnostic recommendation → related service/blueprint view
- Decision asset → contact, booking or WhatsApp action
- Contact source → qualified lead rate
- Page/update decisions prompted by repeated first-party questions
- Core Web Vitals and accessibility guardrails

Pageviews alone do not decide success. A low-volume page that creates a qualified paid conversation may be more valuable than a broad informational page.
