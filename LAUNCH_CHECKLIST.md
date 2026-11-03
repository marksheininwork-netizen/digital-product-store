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
- [x] Inspect Stripe Live catalog and webhook. Live one-time prices exist: Email Swipe File $9 (`price_1UX7YePKQ5OP9J0xqjZj8s2K`), Cleaning Business Brand Kit $19 (`price_1UX7YePKQ5OP9J0xCWjv4eMm`), and Niche Template Bundle $29 (`price_1UX7YePKQ5OP9J0xXOYIpw79`). Toolbox Plus has a $12/month live price but remains excluded. An unrelated `myproduct` entry has no price and is not part of Northstar.
- [x] Inspect Stripe Live webhook. Endpoint `we_1UX8IAPKQ5OP9J0xIYGO18DU` is enabled at the production `northstar-live-webhook` URL. It currently subscribes to checkout, refund/dispute, and subscription events; the handler intentionally ignores subscriptions.
- [x] Add the three verified Stripe Live price IDs for Email Swipe File ($9), Cleaning Business Brand Kit ($19), and Niche Template Bundle ($29) to Supabase under the exact names expected by the live functions.
- [x] Save the enabled Stripe Live endpoint's signing secret in Supabase as `NORTHSTAR_STRIPE_LIVE_WEBHOOK_SECRET`. The credential is not present in the repository or documentation.
- [ ] Verify signed non-payment webhook delivery and validate the existing `NORTHSTAR_STRIPE_LIVE_SECRET_KEY`. Its name is present in Supabase, but the key has not been validated.
- [ ] Set `NORTHSTAR_LIVE_CHECKOUT_ENABLED=true` and release the source guard only after tax registration/classification, checkout terms acceptance, policy URLs, refund operations, payout, support, and production webhook checks are ready.
- [x] Confirm Stripe Live merchant readiness and set Tax Settings head office from the business address already on the verified Stripe account. Stripe reports `charges_enabled=true`, `payouts_enabled=true`, `details_submitted=true`, and no currently due requirements; Tax Settings now reports `active`.
- [ ] Confirm tax registration obligations and add only registrations already approved with the relevant tax authorities. Stripe has no active registrations; threshold monitoring returned no locations and no computation timestamp, so it does not establish the business's tax obligations. Do not enable automatic tax or infer registration obligations without confirmed business registration and advice.
- [ ] Classify each paid digital product for New York sales tax and confirm whether a Certificate of Authority is required. Stripe's live business address is in New York and the planned products include editable templates and software-like tools; New York treats prewritten software as taxable, including electronically delivered software. This does not by itself determine the taxability of every Northstar file. Do not enable checkout or automatic tax until the product treatment and any required registration are confirmed.
- [x] Publish buyer-facing Terms, Privacy, Refunds, and Product License pages; add footer links; publish a 14-day no-reason refund promise and a direct support phone path. Effective date: 2026-11-02. Source: `terms.html`, `privacy.html`, `refunds.html`, `license.html`, and `PRODUCT_LICENSE.md`.
- [x] Configure Stripe Live's customer-facing Terms of Service URL (`https://northstar.atlaspointdigital.com/terms.html`), Privacy Policy URL (`https://northstar.atlaspointdigital.com/privacy.html`), and support URL (`https://northstar.atlaspointdigital.com/account.html`). Saved in the Stripe Dashboard on 2026-11-02 and verified on Business > Public details. Required terms consent is deployed in live Checkout; hosted consent still needs verification before release.
- [ ] Confirm the support phone is actively monitored and test a manual refund end-to-end in Stripe without creating a real purchase; the policy is published but refund operations and response coverage are not yet verified.
- [ ] Verify the configured live webhook signing secret with a signed non-payment event; no real payment is needed for this check.
- [x] Add required terms-of-service consent to the prepared live Checkout Session. Stripe's Terms, Privacy, and support URLs are now configured; hosted Checkout consent still needs verification before release.
- [x] Deploy the prepared live Checkout source with required terms acceptance to Supabase Edge Function version 6. `LIVE_SALES_RELEASED` remains `false`; the live checkout enable switch remains off, so this deployment does not enable purchases.
- [ ] Add customer-facing live purchase actions only after tax, customer terms/refunds/support, and merchant verification are ready. Current shop buttons remain disabled and the checkout function remains source-locked.
- [ ] Release live sales only after legal, payment, tax, refund, payout, and support gates are complete. The owner has authorized the live transition, but live sales are not enabled. Stripe Tax Settings is now `active`, but there are no active tax registrations; the product metadata still says `test_only`, signed webhook delivery is unverified, and the checkout release switch remains off.

## Final launch tasks — deferred
- [ ] Google Sign-In: OAuth credentials, redirect domains, consent, linking and mobile testing.
- [ ] Google Docs/Sheets: secure backend Drive authorization; complete native master templates; verified purchaser-specific copy/shared access; genuine new-tab Docs/Sheets URLs.
- [ ] Optional Microsoft Word/Excel Online account integration; existing .doc/.csv exports are not online documents.
- [ ] Legal and operations review: confirm the merchant legal name and public disclosures, applicable jurisdiction and age requirements, terms acceptance, privacy retention/rights workflow, accessibility, and tax treatment. Customer-facing Terms, Privacy, Refund, and License pages are now published; publication alone does not complete this review.
- [ ] Stripe live mode: merchant identity, taxes, payouts, refund handling, chargebacks, production webhook and security verification.
- [ ] Production monitoring, backups, support, email deliverability and analytics.

## Customer policy release — 2026-11-02
- [x] Replace stale privacy notice with the actual Supabase sign-in/profile, Stripe checkout/order, private-file, local browser storage, Google Fonts, and QR service data flows.
- [x] Publish accessible footer-linked Terms, Privacy, Refunds, and Product License pages. The refund policy offers a full refund within 14 days without requiring a reason.
- [x] Replace the broken empty-recipient mail composer with a direct business support phone link and account sign-in/download guidance. Confirm live staffing and refund handling before taking payments.
- [x] Add regression coverage for the new policy routes, footer links, current privacy disclosures, 14-day refund terms, and continued closed live checkout.
- [ ] Confirm the correct legal merchant name and jurisdictional disclosures for publication. Stripe identifies the account as an individual and shows the account holder's legal name at checkout/receipt; keep checkout closed until the owner confirms that this is the intended public identity.
- [x] Configure Stripe's public Terms, Privacy, and support URLs after the production pages went live. Verified saved Terms, Privacy, and account support links in Stripe Live on 2026-11-02.
- [ ] Have a qualified adviser classify each paid item for New York sales tax and confirm whether a Certificate of Authority is required. New York's official guidance says prewritten computer software is taxable even when electronically transmitted, and taxable sellers must register before making taxable sales. Northstar's downloadable templates/products still require item-by-item classification. References: [NY computer software bulletin](https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/computer_software.htm), [NY register as a sales tax vendor](https://www.tax.ny.gov/bus/st/register.htm).

## Guardrails
- Do not accept real payments until fulfillment, merchant, tax, customer terms, refunds, payouts, and support are ready.
- Do not expose paid master documents through public sharing links.
- ChatGPT's connected Google Drive plugin does not automatically give the Northstar website Google API access.
- Treat a GitHub commit, successful deployment and browser verification as three separate states.

## Verified audit evidence — 2026-11-02
- GitHub main documentation updates `a0c3474c1feec255c3286fc5f6d5eab02b002b` and `e8cd230668262562dd9b00fd1e7129878db9f4a4` recorded the Supabase webhook secret setup. Actions run `41550770048` for `e8cd230668262562dd9b00fd1e7129878db9f4a4` passed dependency installation, regression tests, production build, and GitHub Pages deployment. The production browser still shows `Test purchases only`; account footer copy is being corrected to say live purchases are not yet available.
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
- The owner authorized a live transition on 2026-11-02. Stripe Live was inspected: the three intended one-time prices and an enabled production webhook exist, but product records still carry `status=test_only` metadata. Stripe Tax Settings was later set to `active` using the business address already on the verified account. The registrations list remains empty; no automatic tax or real charge was enabled.
- Authenticated Chrome tabs for Stripe Live and Supabase project `hwsavnkammbhgizltqrc` were available for this audit. The three verified live price IDs and live webhook signing secret are saved in Supabase. The live API-key name is present, but its value and validity were not validated. The checkout enable switch remains absent. Stripe reports charges and payouts enabled with no currently due requirements. The live API key was not validated. The app’s checkout remains source-locked, and the shop continues to disable purchase buttons.
- Current real-purchase backend state: checkout gate probe returned 503 before contacting Stripe. The webhook signing secret has since been saved but signed delivery has not been independently verified; private-download health returned 200 with `mode=live_and_test_separated`. Supabase migration `20261102225132` is present and the live RPC grants were verified read-only.
- GitHub Actions run `41541107271` for commit `0712759ca8aec74a45698739650cd12986abbe17` passed dependency installation, 15 regression tests, the Vite production build, and GitHub Pages deployment.
- Independent production-browser check at `https://northstar.atlaspointdigital.com/account.html?release=0712759` showed the updated order-history wording and the signed-out account portal; the page still clearly says test purchases only while real checkout remains locked.

- Latest live-readiness check on 2026-11-02: Stripe account requirements show no currently due fields and Tax Settings is `active`, but the live registrations list is empty and threshold monitoring returned no locations with `computed_at: null`. Stripe's public Terms, Privacy, and support URLs are now configured. Automatic tax and checkout remain off; hosted terms-consent, signed webhook delivery, product tax classification/registration, support coverage, and legal merchant identity remain unresolved.


## Production fixes and renewed readiness check — 2026-11-02
- [x] In the owner's existing Chrome tab, the live `/shop.html` route returned a GitHub Pages 404. Root cause: Vite's multi-page input list omitted `shop`. Added the page to the production build.
- [x] Removed the unconfirmed `Seller: Maria Sheinin` statement from the membership page. Stripe's verified live account is registered as an individual under a different legal name; the public page now says seller identity and required disclosures must be confirmed before paid checkout opens.
- [x] Regression test covers the published shop route and prevents either unconfirmed seller name from reappearing. Local verification: `npm test` (19/19) and `npm run build` passed.
- [x] Published main commit `02c7345ba3881138a151618b2345417d5d634f0d`; GitHub Actions run `41569589421` succeeded, including tests, production build and Pages deployment. In the same open Chrome tab, verified `/shop.html` now loads and all purchase controls remain disabled; verified the membership disclosure was updated. No payment was created.
- [ ] Keep real checkout closed. Stripe Live has no active tax registrations; threshold monitoring returned no data and no computation timestamp. Product-by-product New York classification and any registration decision remain unresolved.
- [ ] Live webhook endpoint is enabled, but Stripe reports zero deliveries. The secret name exists in Supabase but the live API key and signed live delivery still need validation.
- [ ] The three intended one-time Stripe Live products remain tagged `status=test_only`; correct metadata and verify fulfillment only after tax and identity gates are resolved. Toolbox Plus subscriptions remain excluded.
- [ ] Verify a monitored customer support channel, refund operations, and the correct legal merchant identity/public disclosures before accepting payment. Stripe account has no customer support email; support-phone monitoring is unverified.
- [ ] Release live checkout only after every preceding gate is evidenced. The source release guard remains false and no real charge has been made.

## Tested payment hardening — 2026-11-02
- [x] Local regression suite passes 31/31, including runtime tests of signed webhooks, stale/absent signatures, sandbox rejection, restricted live keys, tax totals, reversed charges, database failure, and source-locked checkout. Vite production build passed.
- [x] Applied Supabase migration `20261103031415_northstar_live_reversal_ordering`. A durable reversal ledger and per-payment transaction locks preserve refunds/disputes across delayed or duplicate checkout events.
- [x] Database assertions passed for refund-before-order, duplicate event/item, late completion, disputed order, refund precedence, and browser-role permission denial. Synthetic records were rolled back; no real payment was made.
- [x] Deployed live checkout v7 and live webhook v7. Checkout remains source-locked. Both accept restricted live keys; requests have timeouts and webhook verification uses native HMAC verification.
- [x] Implemented account checkout-return guidance, sensitive URL cleanup, safer text-to-CSV exports, recoverable settings/PDF errors, accurate format explanations, shop policy/support links, and currency labels.
- [x] Code commit `2dee2d604cea384734637a636217ad3cb997ddad` deployed successfully through GitHub Actions run `41571332087`. Production Chrome verification showed USD/one-time labels and refund/license/support links. Account return guidance appeared, checkout/session parameters were removed, and signed-out users were not granted access.
- [ ] Replace invalid `NORTHSTAR_STRIPE_LIVE_SECRET_KEY`: a temporary, token-protected, read-only Supabase diagnostic used the stored key against all three live Stripe prices; each returned HTTP 401 Unauthorized. No credential value was exposed. Diagnostic retired to an authenticated HTTP 410 stub immediately afterward. Real Stripe-signed delivery remains unverified.
- [ ] Owner facts remain required: intended legal merchant identity, monitored support channel, and product tax treatment/registration. Keep checkout closed until those and end-to-end fulfillment are verified.


- Deployed endpoint probes: checkout returns 503 (release lock); webhook returns 503 (live configuration invalid). Neither probe creates a charge or entitlement.
- Post-migration security advisor: five server-only tables have RLS with no browser policies (intentional; permissions verified). Existing leaked-password protection warning remains; no paid upgrade performed.
- Next priorities: replace the rejected live credential and verify actual Stripe delivery; confirm legal merchant identity/monitored support/tax treatment; complete signed-in purchase/download/refund checks before releasing sales.

## 2026-11-03 account export reliability patch
- [x] Source fix committed as `125ae24b14e434e9c270ac85e4fb8ded81160a11`: PDF library failure now clears its loader for retry; export failures now show an inline accessible alert beside the product. Confirmed by reading back the committed `main` source.
- [ ] Verify GitHub Actions build/test/deployment for this commit and independently test the live account page; no live-browser verification is claimed for this patch.

## 2026-11-03 implementation-only release preparation
- [x] Replace inactive premium-shop checkout buttons with links to product support or membership details. Commit `8c6375be19b6d4d88bc151675caaf7eb63e5d8aa`; real checkout remains disabled.
- [x] Add `CUSTOMER_OPERATIONS.md` covering refund workflow, delivery support, safe entitlement handling, and a tax-classification worksheet. Commit `5751affddd13d51b690ed201ba56fa4c9f4614db`.
- [ ] Confirm a monitored customer support channel and refund operator; the written procedure alone does not establish operational coverage.
- [ ] Obtain merchant-specific tax classification and registrations as applicable; worksheet is not a tax determination.
- [ ] Build, browser, and payment testing intentionally deferred for this implementation-only batch at owner's request.

## 2026-11-03 follow-up verification
- [x] Confirm the Stripe test-store subscription checkout is paused in current `main` source: a noninteractive status element replaces the old subscription payment link; one-time sandbox links remain. This is a source verification, not proof of production deployment.
- [x] Confirm the three private product objects still exist in Supabase Storage with expected names and MIME types; private file contents and ZIP entries were not read, so tax classification remains open.
- [x] Confirm Supabase live checkout and webhook functions remain deployed; deployment presence alone does not prove working credentials or webhook delivery.
- [ ] Verify GitHub Actions build and production deployment for the subscription pause and latest storefront text.
- [ ] Resolve live Stripe secret-key authentication failure, then test signed non-payment webhook and sandbox delivery/refund without live charges.
- [ ] Verify paid file contents and distinguish them clearly from the free interactive tools; get product-specific tax treatment before any live launch.
