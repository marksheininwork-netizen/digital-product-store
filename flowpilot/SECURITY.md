# Security model and pre-launch gates

## Implemented
- Supabase Auth user identity, per-organization membership and database row-level security for CRM and tasks.
- Write operations check membership role; viewer is read-only.
- Audit triggers on leads and tasks, with tenant-scoped audit read policy.
- No service-role secret in browser and no outbound marketing actions.

## Must verify before launch
1. Create users A and B; create separate organizations A and B.
2. With A's token, attempt SELECT, INSERT, UPDATE, DELETE against B's leads and tasks. All must be denied or affect zero rows.
3. Verify a viewer cannot modify records, and a member cannot manage permissions.
4. Confirm anonymous requests cannot read tenant records.
5. Test audit logs are immutable from the public API.
6. Add owner/admin invitation management with carefully constrained server-side authorization.
7. Add rate limiting, account recovery, backup/restore, retention/deletion, monitoring, and legal/privacy documents.
8. Verify Supabase security advisors and automated browser tests against a staging project.

Static source tests do **not** prove database RLS behavior; live multi-user tests are mandatory.
