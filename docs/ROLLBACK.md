# Rollback runbook

## Fast deployment rollback

1. In Vercel, locate the last known-good Production deployment before the release.
2. Promote that deployment and verify `/`, `/es`, contact routes and critical redirects.
3. Record the incident and stop further merges while the failing commit is corrected.

## Source rollback

- New-platform safety source: revert the launch commit through a reviewed Git commit.
- Full legacy source: tag `pre-viste-global-rebuild-2026-08-02` or branch `archive/legacy-hospitality-site`, both at `bdfb68b`.
- Never reset or delete Supabase lead data to roll back website code.
- DNS is unchanged and is not part of ordinary rollback.

After recovery, preserve the new redirect map unless testing shows that it caused the incident.
