# Six-format product expansion — draft implementation

## Rules
- Preview pages must not imply an item is purchasable until it has a tested deliverable, licensed assets, fulfillment and refund handling.
- No Stripe prices, subscriptions, email sends or paid services are created by this branch.
- Existing legal seller, tax, checkout, Supabase and protected-download decisions remain unchanged.
- Validate demand with free previews before producing higher-ticket offers. Do not present creator video sales claims as verified benchmarks.

## Catalog and delivery plan

| Category | Initial product | Deliverable | Readiness gate |
| --- | --- | --- | --- |
| Niche templates | Freelancer Client Acquisition Kit | editable tracker, proposal, outreach templates, pricing calculator | files verified and accessible |
| Checklists/swipe files | Small Business Marketing Audit Kit | printable checklist, audit worksheet, example | quality-reviewed |
| Checklists/swipe files | 90 Content Hooks | categorized hooks, examples, rewrite instructions | originality and accuracy checked |
| Email courses | 7-Day First Client Challenge | 7 useful lessons and opt-in/unsubscribe flow | permission-based email delivery tested |
| Full courses | Client Onboarding Fundamentals | structured lessons, exercises, outcome rubric | instructional review and accessibility |
| Mid-ticket implementation | Agency Operations Sprint | milestone tracker, templates, scoped guidance | support capacity and clear terms |
| High-ticket advisory | Implementation Review Program | expert-led sessions, defined scope | qualified adult operator, capacity and legal review |

## Implementation order
1. Add a non-transactional collection preview page.
2. Build actual editable assets for the first three low-cost products; verify no placeholder downloads.
3. Add catalog entries only after file fulfillment, entitlement and refund tests pass.
4. Add opt-in email-course delivery with consent, unsubscribe and privacy checks.
5. Build guided course access and progress tracking.
6. Offer implementation/advisory only after real delivery capacity and documented terms exist.

## QA checklist
- [ ] Preview page checked on mobile and desktop
- [ ] Navigation link reviewed before publishing
- [ ] All product files complete and tested
- [ ] Checkout and entitlement tests in sandbox
- [ ] Refund and partial-refund access behavior tested
- [ ] Adult legal seller approves pricing and publication
- [ ] No paid infrastructure or live payment activation without approval
