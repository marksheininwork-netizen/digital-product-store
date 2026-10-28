# FlowPilot MVP

Independent application scaffold in a dedicated feature branch. No changes to the existing storefront main branch.

## Functional scope
Email/password Supabase Auth, organization creation, membership-based RLS, lead CRUD (create/read/update stage), task create/read/complete, KPI dashboard, audit triggers. Other modules are clearly labeled placeholders, not functioning products.

## Setup
1. Create a new Supabase project. Execute `supabase/schema.sql` in SQL Editor.
2. Copy `.env.example` to `.env.local`, set the project URL and **publishable/anon** key (never the service-role key).
3. Run `npm install && npm run build && npm run dev` in this folder.
4. Configure Supabase Auth allowed site URLs and email confirmation settings. Test with two separate users and organizations to verify isolation before production.
5. Deploy `dist` to a static hosting provider with the same public environment variables. Keep billing disabled until Stripe webhooks and entitlements are implemented.

## Security notes
The database uses RLS and per-organization membership checks. Only the authenticated owner can bootstrap an organization via a restricted RPC. Membership management, invitation flows, billing, and secure automation execution remain future work. The audit log records lead/task mutations but is not yet a comprehensive security audit system. No marketing sends are implemented.

## Pricing hypothesis
Free, Starter $19, Professional $49, Business $99 monthly. These are proposed prices, not active subscriptions. Free-tier hosting/backend quotas and Stripe payment processing fees apply; confirm current provider terms before launch.
