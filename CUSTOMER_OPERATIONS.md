# Northstar Studio — Prelaunch customer operations

**Status:** Draft operational runbook. No live sales authorization. Stripe live checkout remains disabled.

## Refund request handling
1. Direct the customer to the published Refund Policy and Contact pages. Do not request full payment card details, passwords, or sign-in links.
2. Request only the checkout email, approximate purchase date, product name, and a brief description. Use Stripe's authenticated Dashboard to locate the payment; never trust a screenshot as proof of ownership.
3. Check the published 14-day refund promise and applicable legal rights. Escalate unclear or disputed cases to the merchant before responding.
4. An authorized operator initiates a refund **only** in the correct Stripe account and mode, checks the amount and original payment, and records the Stripe refund identifier and customer notification. Never refund to a different card or via an external transfer.
5. Confirm webhook processing revokes the corresponding paid entitlement when required, and check that no unrelated purchases were removed.
6. Record case creation, resolution, customer communication, and any Stripe processing exceptions in an access-controlled support system. Do not store customer PII in this repository.

## Delivery and account support
- Direct customers to /account.html and the email used at checkout.
- The return from Checkout is **not** proof of payment. Confirm the order in Stripe and server-side entitlements.
- For missing delivery, check webhook event processing, paid status, the correct product mapping, and private storage availability. Do not email the paid master file or create public download URLs.
- For ZIP products, advise customers to save and extract the ZIP. For text products, use the secure viewer or compatible exports.
- Escalate account takeover, disputed charges, or repeated delivery failures before changing entitlements.

## Tax classification worksheet — requires qualified review
| Product | Delivery | Price | Tax determination |
| --- | --- | ---: | --- |
| 50 Editable Email Templates | Digital text download | $9 | Pending jurisdiction-specific review |
| Cleaning Business Brand Kit | Digital text download | $19 | Pending jurisdiction-specific review |
| Niche Template Bundle | ZIP of digital resources | $29 | Pending review of each included item |
| Toolbox Plus | Proposed software subscription | $12/month | Deferred; not available for live purchase |

**Before real checkout:** confirm seller's legal identity and jurisdiction, product tax treatment, required registrations (including New York if applicable), nexus, Stripe Tax settings, refund operations, support coverage, and checkout disclosures. Do not treat an active Stripe Tax account as evidence of registration or exemption.

## Launch release gate
Live sales may be enabled only after the merchant explicitly confirms the above, a signed webhook delivery check is completed, product-specific paid entitlement/reversal behavior is verified, and the published support and refund promises can actually be honored. Keep both source-level and environment checkout locks in place until then.
