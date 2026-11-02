# Northstar Studio — Final Launch Checklist
Updated 2026-11-02. This is a task list, not a declaration of completion.

## Current release checks
- [x] Verify GitHub Actions deploy, custom domain, and fresh assets. Run 41536768022 succeeded for commit `f1701e5d7366340d0983a284baa1ec2bc4ed7f72`; production account page loads the current portal.
- [ ] Test account sign-in/out, session expiry, purchase library and settings persistence in the production browser profile.
- [x] Verify a signed-in account can open an entitled product in a new tab. Existing authorized test purchase opened successfully.
- [ ] Test server-authorized purchased-product access and error states, including an unauthorized account.
- [x] Verify Open in new tab and PDF in new tab on desktop. The PDF opened in Chrome's viewer with 15 pages and the purchased product content.
- [ ] Test Open in new tab and PDF in new tab on iPhone Safari.
- [x] Verify Save to Files with the authorized product file. The native share sheet was observed earlier; the current Chrome session used the direct-download fallback and saved the 13.8 KB TXT file.
- [x] Verify the deployed Word-compatible .doc and Excel-compatible .csv exports download successfully after the file-share fallback fix. From the signed-in production account, both direct downloads completed: email-swipe-file.doc (14.0 KB) and email-swipe-file.csv (18.9 KB).
- [ ] Verify ZIP behavior, dead buttons, broken links, accessibility and mobile layout regressions.
- [x] Verify Stripe sandbox checkout creates an entitlement and purchased-product access for the Email Swipe File. Three existing paid test sessions each match a paid order and private-file entitlement; the signed-in account shows the product and the new-tab viewer worked. No additional checkout was initiated. Verify the other two product links and subscription separately before launch.
- [x] Run `npm test` and `npm run build` in GitHub Actions (run 41536768022).
- [ ] Review release logs and verify the rollback process.
- [x] Resolve the Supabase Preview migration failure before the next database change. The preview logs identified missing local migration versions; canonical migration files matching the five already-applied production versions were restored to the repository. The later preview run reported “All migrations are up to date” (2 skipped, no migration errors).
- [ ] Enable Supabase Auth leaked-password protection and verify. The security advisor reports it disabled; Supabase currently offers this only on the Pro plan, which costs $25/month. Upgrade requires the account owner to authorize paid billing.

## Real-purchase preparation — 2026-11-02
- [x] Add explicit `livemode` fields to orders, Stripe event records, and memberships; apply Supabase migration `20261102225132_northstar_payment_mode_isolation`. Existing records remain sandbox by default.
- [x] Add separate service-role-only live fulfillment and live refund/dispute RPCs. Verified `anon` and `authenticated` cannot execute them; `service_role` can.
- [x] Bring the live Checkout, live webhook, and private-download Edge Function source into this repository. Supabase has live checkout v3, live webhook v4, and private downloads v13 deployed.
- [x] Keep live Checkout locked with a source-level `LIVE_SALES_RELEASED = false` interlock, in addition to its Supabase environment switch. A non-purchasing production probe returned HTTP 503 with “Purchases are not yet available”; no Checkout Session was created.
- [x] Restrict the prepared live Checkout catalog to the three one-time digital products. Toolbox Plus subscriptions remain excluded until live membership entitlements and live billing-portal management are implemented.
- [x] Make the account purchase library label sandbox purchases as test and reserve “Paid” for records marked live. The signed-in account page does not claim that a test purchase was a real payment.
- [x] Add the package lockfile and change the Pages workflow to deterministic `npm ci` installs.
- [ ] Configure and independently verify the three live price IDs, live Stripe secret, and live webhook signing secret in Supabase. These are not present in the connected sandbox; no live credentials were read or added.
- [ ] Configure a real Stripe live webhook endpoint for `northstar-live-webhook` and verify test delivery using Stripe’s Live account only after merchant readiness; current webhook safely returns HTTP 503 while live secrets are missing.
- [ ] Add customer-facing live purchase links and product disclosures only after live product prices, customer terms/support, tax treatment, and business verification are ready.
- [ ] Keep live sales disabled until the owner confirms the legal, payment, tax, refund, payout, and support gates are complete.

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
- Latest account export fallback commit `9d9adaa98a46bf3d60709321722416ebaf6f8f5e` passed GitHub Actions run 41537916098, including tests, build, and deployment. Word/CSV exports now use direct downloads; Save to Files retains the native share attempt and falls back to a direct download when sharing is unavailable.
- Production browser check: home and product catalog load; catalog shows 21 downloads; searching “Uber Driver” returns the matching single product; signed-out account page loads with sign-in, library, order-history, and settings sections. The latest portal loads on the production custom domain.
- Signed-in production browser check: two test purchases appeared in the library and order history; the purchase survived a refresh; opening an entitled product in a new tab succeeded. Save to Files offered and downloaded the 13.8 KB TXT file after native sharing was unavailable. The deployed Word and CSV direct links downloaded email-swipe-file.doc (14.0 KB) and email-swipe-file.csv (18.9 KB). The PDF export opened in a new tab as a 15-page PDF.
- Supabase project `hwsavnkammbhgizltqrc` is active. The `northstar-private-products` bucket is private. `northstar_profiles` has per-user insert/read/update policies; order, order-item, membership, and Stripe-event tables have no browser policies.
- Supabase security advisor reports leaked-password protection is disabled. It also reports four RLS-enabled tables without policies (expected for server-only data); performance advisor reports no findings.
- Supabase Auth Site URL is `https://northstar.atlaspointdigital.com`. The exact production account redirect `https://northstar.atlaspointdigital.com/account.html` was added to the allowed redirect URLs after user authorization. The currently available production browser profile is signed out, so the redirect still needs an end-to-end email-link check.
- Stripe Primary account is confirmed test mode. Its active webhook endpoint targets the Northstar Supabase function and subscribes to checkout completion/async success, subscription lifecycle, refunds and disputes.
- Three existing paid test sessions for the $9 Email Swipe File each have a corresponding paid Supabase order and private storage entitlement (`email-swipe-file.txt`). The signed-in production account showed two purchases; the purchased product opened successfully in a new tab. No extra checkout or payment was initiated for this audit.
- Updated the Email Swipe File Payment Link in test mode to redirect to the Northstar account page and mark its fulfillment as verified. Updated the Stripe Test Store notice to distinguish that verified product from the still-unverified Cleaning Business Brand Kit, Niche Template Bundle and inactive subscription delivery.
- The currently available production browser profile is signed out, so the deployed .doc/.csv fallback and allowed Auth redirect still need signed-in end-to-end verification.
- Stripe remains in test mode. No real charge was made.
- Current real-purchase backend state: checkout gate probe returned 503 before contacting Stripe; the live webhook returned 503 because live credentials are not configured; private-download health returned 200 with `mode=live_and_test_separated`. Supabase migration `20261102225132` is present and the live RPC grants were verified read-only.
- Local regression suite passed 15/15 and Vite build completed successfully after these changes. GitHub Actions deployment is pending this commit.
