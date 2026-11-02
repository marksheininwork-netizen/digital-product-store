# Northstar Studio — Final Launch Checklist
Updated 2026-11-02. This is a task list, not a declaration of completion.

## Current release checks
- [ ] Verify GitHub Actions deploy, custom domain, and fresh assets.
- [ ] Test account sign-in/out, session expiry, purchase library and settings persistence.
- [ ] Test server-authorized purchased-product access and error states.
- [ ] Test Open in new tab and PDF in new tab on iPhone Safari and desktop.
- [ ] Test Save to Files, Word-compatible .doc, Excel-compatible .csv and ZIP behavior.
- [ ] Verify no dead buttons, broken links, accessibility or mobile layout regressions.
- [ ] Test Stripe sandbox checkout to purchase entitlement and access.
- [ ] Run build and tests; check release logs and rollback process.

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
