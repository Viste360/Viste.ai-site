# Repository guidance

- Preserve English/Spanish route and content parity.
- Never invent clients, partnerships, results, offices, registrations, certifications or legal details.
- Never commit `.env*` files other than placeholder-only `.env.example`.
- Keep secrets in Vercel environment variables and import secret keys only in server routes.
- Run `npm run check` and `npm run test:e2e` before deployment.
- Use a non-production branch and Vercel Preview for review. Do not change DNS for ordinary releases.
- Keep the tag `pre-viste-global-rebuild-2026-08-02` and branch `archive/legacy-hospitality-site` available for rollback and legal history.
