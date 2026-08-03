# Rollback runbook

Current known-good production commit before this migration: `b72609e`.

## Fast deployment rollback

1. In Vercel, locate the last known-good Production deployment before the release.
2. Promote that immutable deployment; do not rebuild it from the current branch.
3. Verify `/`, `/es`, `/contact`, `/privacy-policy.html`, `/term-and-condition.html`, `/cookie-policy/en/`, `/sitemap.xml`, `/robots.txt` and `/api/health`.
4. Confirm lead delivery and notification on the restored version; export any leads received during the incident before changing database code.
5. Record the incident and stop further merges while the failing commit is corrected.

## Source rollback

- New-platform safety source: revert the launch commit through a reviewed Git commit.
- Pre-migration production source: commit `b72609e`.
- Full legacy source: tag `pre-viste-global-rebuild-2026-08-02` or branch `archive/legacy-hospitality-site`, both at `bdfb68b`.
- Never reset or delete Supabase lead data to roll back website code.
- DNS is unchanged and is not part of ordinary rollback.

After recovery, preserve the new redirect map unless testing shows that it caused the incident.

Website rollback does not authorize deletion or rollback of Supabase rows. Database migrations in this change are additive; correct forward unless a separately reviewed data plan requires otherwise.
