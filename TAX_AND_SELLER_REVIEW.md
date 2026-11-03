# Northstar — Low-Paperwork Launch: Product Tax Review
Updated 2026-11-03. Planning document only; not legal/tax advice or a tax-exemption determination.

## Intended operating arrangement
- Intended individual seller: Alexander Tsudikman. Northstar Studio may remain a storefront/collection brand where legally appropriate; confirm naming and payment processor details before representing it as the legal seller.
- Start with genuinely nontaxable downloadable content only, if confirmed on a product-by-product basis. Keep paid SaaS/subscriptions off.
- Live checkout must remain disabled until classification, legal, payment, and operational launch checks are complete.
- No claim that avoiding New York sales tax registration is automatically lawful; the actual product, delivery, buyer location and sales activity determine obligations.

## Product-by-product release gate
| Product | Current classification | Release gate |
| --- | --- | --- |
| 50 Editable Email Templates | UNDETERMINED | Review delivered TXT/DOC/PDF content and rights; verify it is written content rather than software or taxable information service |
| Cleaning Business Brand Kit | UNDETERMINED | Review exact files and whether any software, interactive tool, or taxable component is included |
| Niche Template Bundle | UNDETERMINED | Inventory ZIP contents individually; do not assume the whole bundle is exempt |
| Browser utilities | FREE ONLY | Do not charge for access until NY software tax and registration obligations are addressed |
| Toolbox Plus / paid SaaS | DISABLED | NY generally taxes prewritten software, including remotely accessed software; separate tax review and registration before launch |
| Spreadsheet systems | UNDETERMINED | Check if file is data/document content versus licensed functional software; get qualified tax determination |

## NY authority
- Registration: https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/do_i_need_to_register_for_sales_tax.htm
- Taxable software: https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/computer_software.htm
- Electronically delivered e-books (limited scope): https://www.tax.ny.gov/pdf/memos/sales/m11_5s.pdf
- Registering when required: https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/how_to_register_for_nys_sales_tax.htm

## Work possible without state registration
- Keep building, testing, marketing free tools and preparing product descriptions.
- Inventory actual product contents and secure delivery; prepare draft policies and seller disclosures for review.
- Verify Stripe sandbox fulfillment, refunds, authentication, and customer support.
- Review individual income tax, business-name/assumed-name, payment processor, age and local obligations separately. Nontaxable sales do not imply no income tax or other requirements.

## Pre-live checklist
- [ ] Inventory all actual delivered paid files and contents.
- [ ] Document written tax analysis or obtain NY Tax Department/adviser guidance for each SKU and bundle.
- [ ] Determine whether any registration is needed based on products, sales locations and other taxable activities.
- [ ] Verify Alexander's seller/payment-account authority, business name presentation and required disclosures.
- [ ] Finalize customer-facing legal policies, refund/support process and sales records.
- [ ] Validate live Stripe webhook/fulfillment/refund controls; then separately authorize live launch.

## Evidence gathered 2026-11-03 (read-only audit)

Private Supabase Storage bucket `northstar-private-products` currently contains:
- `email-swipe-file.txt`: text/plain, 20,208 bytes.
- `cleaning-business-brand-kit.txt`: text/plain, 11,200 bytes.
- `niche-template-bundle.zip`: application/zip, 17,121 bytes.

**Limitation:** These are metadata checks, not an inspection of private file contents. The ZIP contents remain unknown. Do not classify any SKU as exempt on file extension alone.

The public repository also contains `email-swipe-file.html`, an interactive free tool advertising 50 editable email starters, and `cleaning-business-brand-kit.html`, an interactive free starter kit. These may overlap paid products. Before activating checkout, confirm that paid listings accurately distinguish the delivered files from the free versions, with no misleading exclusivity or value claims.

Stripe live merchant account was identified as Alexander Tsudikman; its existence does not establish the legally correct seller identity, authority to operate, or tax exemption. Existing live catalog and checkout settings were already prepared in prior work; **no new charges or release toggles were made during this audit**.

New York's official software bulletin was updated October 16, 2026 and states prewritten software can be taxable when delivered electronically or by remote access: https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/computer_software.htm . New York's registration bulletin says taxable sales generally require a Certificate of Authority before sales begin: https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/do_i_need_to_register_for_sales_tax.htm .

## Additional release gate
- [ ] Compare actual paid TXT and ZIP contents with free public tools; correct marketing copy or improve paid bundles as needed.
- [ ] Verify actual delivered content before assigning Stripe tax codes; never label all downloads nontaxable by default.
- [ ] Review state-specific nexus and sales tax requirements for intended customer locations, not just New York.
