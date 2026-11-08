# Maria Sheinin — pre-certificate launch preparation (2026-11-08)

## Decision and release boundary
- Legal seller intended: **Maria Sheinin**, individual sole proprietor. Northstar Studio is a product/site identity, not an assertion of a separately registered legal seller. Whether this public branding requires an assumed-name filing must be checked.
- Sell to **U.S. customers only** after an enforceable billing-country restriction has been implemented and tested. A website notice or client-side country selector alone is not enforcement.
- The New York Certificate of Authority is intentionally deferred **until the end of preparation**, but **before the first taxable NY sale**. NY generally requires application at least 20 days before taxable sales and receipt of the certificate before those sales.
- No real checkout or subscriptions until all release gates are completed. `LIVE_SALES_RELEASED = false` must stay unchanged.

## Work completed without identity documents
- Seller-facing policies and shop text refer to Maria as the **intended** seller, pending payment account verification.
- Prior merchant's Stripe test payment links removed from the public test-store page to prevent testing under an unrelated merchant account.
- Shop remains unavailable; no payment collection should occur from the public shop.
- Regression checks cover seller identity, disabled Stripe links, and the hard-coded live checkout release lock.

## Steps before the certificate application
- [ ] Maria personally confirms she will genuinely own the business and authorizes operations and customer support.
- [ ] Maria creates/obtains a Stripe account in her own legal name, or Stripe explicitly confirms and completes a supported legal-owner transfer. **Do not reuse old live/test secrets, prices, webhook signing secrets, or payout accounts as if they belong to Maria.**
- [ ] Maria completes Stripe SSN/tax-ID, identity documents, payout bank, and any required beneficial owner or representative information **directly in Stripe**, not in GitHub.
- [ ] Confirm accurate public support email, contact workflow, refund processing and response times.
- [ ] Inspect all downloadable product files and document NY tax classification separately (plain text, graphic assets, prewritten software, bundled items).
- [ ] Set appropriate Stripe tax codes for each product after classification. Confirm destination-based taxation and other-state nexus monitoring.
- [ ] Implement a **server-enforced U.S.-only eligibility check before collecting payment**. Stripe Checkout's `billing_address_collection=required` alone does **not** prevent non-U.S. purchasers. Do not rely solely on a post-payment webhook to reject foreign buyers.
- [ ] Migrate/recreate prices, product IDs, webhook endpoints and environment secrets for Maria's verified Stripe account, then test each product, paid/unpaid checkout, secure download, refunds, disputes and failed payments.
- [ ] Verify the site deployment and support contact; run `npm test` and `npm run build` in CI. Do not describe tests as passed unless actual results are available.
- [ ] Confirm whether a DBA/assumed-name filing is necessary for the Northstar brand presentation; do not presume the disclaimer alone removes that requirement.
- [ ] Confirm income-tax bookkeeping and Maria's business location with a qualified tax adviser where uncertain.

## Final steps — only after preparation
- [ ] Maria applies for the **NY Sales Tax Certificate of Authority** if making taxable NY sales, generally at least 20 days before starting them.
- [ ] Wait for certificate issuance; configure verified NY registration in the **correct Maria Stripe account** and validate automatic tax collection.
- [ ] Review out-of-state nexus obligations, refund/tax handling, recordkeeping, and assigned NY filing frequency.
- [ ] Complete final production checkout and webhook verification and get explicit launch approval before modifying the hard-coded live release lock.

Official NY guidance: https://www.tax.ny.gov/bus/doingbus/sell.htm
