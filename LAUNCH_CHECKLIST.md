# Northstar Studio — Final Launch Checklist
Updated 2026-11-02. This is a task list, not a declaration of completion.

## Current release checks
- [x] Verify GitHub Actions deploy, custom domain, and fresh assets (run 41535047458 succeeded for commit `acab345`; production pages independently checked on 2026-11-02).
- [ ] Test account sign-in/out, session expiry, purchase library and settings persistence.
- [ ] Test server-authorized purchased-product access and error states.
- [ ] Test Open in new tab and PDF in new tab on iPhone Safari and desktop.
- [ ] Test Save to Files, Word-compatible .doc, Excel-compatible .csv and ZIP behavior.
- [ ] Verify no dead buttons, broken links, accessibility or mobile layout regressions.
- [ ] Test Stripe sandbox checkout to purchase entitlement and access.
- [x] Run `npm test` and `npm run build` in GitHub Actions (run 41535228709).
- [ ] Review release logs and verify the rollback process.
- [ ] Resolve the Supabase Preview migration failure before the next database change; preview branch `main` reports `MIGRATIONS_FAILED` while production remains `ACTIVE_HEALTHY`.
- [ ] Enable Supabase Auth leaked-password protection and verify; the security advisor currently reports it disabled.

## Final launch tasks — deferred
- [ ] Google Sign-In: OAuth credentials, redirect domains, consent, linking and mobile testing.
- [ ] Google Docs/Sheets: secure backend Drive authorization; complete native master templates; verified purchaser-specific copy/shared access; genuine new-tab Docs/Sheets URLs.
- [ ] Optional Microsoft Word/Excel Online account integration; existing .doc/.csv exports are not online documents.
- [ ] Legal: Terms, Privacy, Cookies/consent where applicable, refunds, digital product license, accessibility, business identity, support, age-related requirements.
- [ ] Stripe live mode: merchant identity, taxes, payouts, refund handling, chargebacks, production webhook and security verification.
- [ ] Production monitoring, backups, support, email deliverability and analytics.

## Guardrails
- Stripe stays in test mode until the launch requirements are met.
- Do not expose paid master documents through public sharing links.
- ChatGPT's connected Google Drive plugin does not automatically give the Northstar website Google API access.
- Treat a GitHub commit, successful deployment and browser verification as three separate states.


## Verified audit evidence — 2026-11-02
- Release commit: `acab345f6e5aa9938ed154a54514cd02ce8051ef` removes the temporary “Deployment check · CORAL STAR 12” banner from the account page.
- GitHub Actions run 41535047458 passed `npm test`, `npm run build`, and GitHub Pages deployment.
- Production browser check: home and product catalog load; catalog shows 21 downloads; searching “Uber Driver” returns the matching single product; signed-out account page loads with sign-in, library, order-history, and settings sections; no account-page console errors were observed. The temporary deployment banner is absent after deployment.
- Supabase project `hwsavnkammbhgizltqrc` is active. The `northstar-private-products` bucket is private. `northstar_profiles` has per-user insert/read/update policies; order, order-item, membership, and Stripe-event tables have no browser policies.
- Supabase security advisor reports leaked-password protection is disabled. It also reports four RLS-enabled tables without policies (expected for server-only data); performance advisor reports no findings.
- Supabase's GitHub Preview check for commit `7745430` failed; the non-persistent preview branch reports `MIGRATIONS_FAILED`, while the production project is `ACTIVE_HEALTHY`. This did not block the GitHub Pages deploy. The preview failure details were not exposed by the connected read-only branch interface.
- Authenticated account journeys, device-specific exports, a new sandbox checkout, and unauthorized-user attempts remain unverified in this release. No new checkout or real payment was initiated.

