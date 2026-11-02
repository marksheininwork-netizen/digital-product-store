# Northstar Studio — Final Launch Checklist
Updated 2026-11-02. This is a task list, not a declaration of completion.

## Current release checks
- [x] Verify GitHub Actions deploy, custom domain, and fresh assets. Run 41536768022 succeeded for commit `f1701e5d7366340d0983a284baa1ec2bc4ed7f72`; production account page loads the current portal.
- [ ] Test account sign-in/out, session expiry, purchase library and settings persistence in the production browser profile.
- [x] Verify a signed-in account can open an entitled product in a new tab. Existing authorized test purchase opened successfully.
- [ ] Test server-authorized purchased-product access and error states, including an unauthorized account.
- [ ] Test Open in new tab and PDF in new tab on iPhone Safari and desktop.
- [x] Verify Save to Files opens the native share sheet with the authorized product file.
- [ ] Verify the deployed Word-compatible .doc and Excel-compatible .csv exports download successfully after the file-share fallback fix.
- [ ] Verify ZIP behavior, dead buttons, broken links, accessibility and mobile layout regressions.
- [ ] Test Stripe sandbox checkout to purchase entitlement and access. Do not use live mode or initiate real charges.
- [x] Run `npm test` and `npm run build` in GitHub Actions (run 41536768022).
- [ ] Review release logs and verify the rollback process.
- [x] Resolve the Supabase Preview migration failure before the next database change. The preview logs identified missing local migration versions; canonical migration files matching the five already-applied production versions were restored to the repository. The later preview run reported “All migrations are up to date” (2 skipped, no migration errors).
- [ ] Enable Supabase Auth leaked-password protection and verify. The security advisor reports it disabled; Supabase currently offers this only on the Pro plan, which costs $25/month. Upgrade requires the account owner to authorize paid billing.

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
- Release commit `acab345f6e5aa9938ed154a54514cd02ce8051ef` removes the temporary “Deployment check · CORAL STAR 12” banner from the account page.
- GitHub Actions run 41535047458 passed `npm test`, `npm run build`, and GitHub Pages deployment.
- Latest account export fix commit `f1701e5d7366340d0983a284baa1ec2bc4ed7f72` passed GitHub Actions run 41536768022, including tests, build, and deployment.
- Production browser check: home and product catalog load; catalog shows 21 downloads; searching “Uber Driver” returns the matching single product; signed-out account page loads with sign-in, library, order-history, and settings sections. The latest portal loads on the production custom domain.
- Earlier authenticated browser check: two existing test purchases appeared in the account library and order history; opening an entitled product in a new tab succeeded. Save to Files presented a 14 KB product document in the native share sheet. The Word export action failed with “Permission denied,” which prompted the deployed fallback change: if native file sharing rejects the request, the account now offers a direct download link. Re-test the deployed .doc and .csv actions while signed into the account before checking those boxes.
- Supabase project `hwsavnkammbhgizltqrc` is active. The `northstar-private-products` bucket is private. `northstar_profiles` has per-user insert/read/update policies; order, order-item, membership, and Stripe-event tables have no browser policies.
- Supabase security advisor reports leaked-password protection is disabled. It also reports four RLS-enabled tables without policies (expected for server-only data); performance advisor reports no findings.
- Supabase Auth Site URL is `https://northstar.atlaspointdigital.com`. The exact production account redirect `https://northstar.atlaspointdigital.com/account.html` was added to the allowed redirect URLs after user authorization. The currently available production browser profile is signed out, so the redirect still needs an end-to-end email-link check.
- Stripe Primary account is confirmed test mode. Its active webhook endpoint targets the Northstar Supabase function and subscribes to checkout completion/async success, subscription lifecycle, refunds and disputes.
- The three one-time Stripe test Payment Links currently show metadata `fulfillment=not_configured` and a confirmation message that paid digital delivery is not enabled. Existing completed test sessions also point to `stripe.com` after checkout. The entitlement checkout test remains unchecked until those specific links are mapped to the verified purchase-delivery flow and redirect customers to the account page. No new checkout or payment was initiated.
- The currently available production browser profile is signed out, so the deployed .doc/.csv fallback and allowed Auth redirect still need signed-in end-to-end verification.
- Stripe remains in test mode. No real charge was made.
