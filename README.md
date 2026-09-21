# BAHA TRACKER

Production-oriented flood observation and emergency coordination application built with Next.js App Router, Supabase, Leaflet, TypeScript, Tailwind CSS, Vitest, and Playwright.

## Project structure

- `app/` — pages and secure Route Handlers
- `components/` — responsive UI, forms, map, and dashboards
- `lib/` — Supabase clients, validation, permissions, and passability engine
- `supabase/migrations/` — versioned PostgreSQL schema, triggers, RLS, Storage, and Realtime
- `tests/unit/` — validation, permission, and rule tests
- `tests/integration/` — live Supabase schema checks (enabled when credentials exist)
- `tests/e2e/` — mobile, tablet, and desktop Playwright coverage

## Local installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with values from the Supabase project dashboard. The service-role key is server-only; never prefix it with `NEXT_PUBLIC_` or expose it to browser code.

## Supabase setup

1. Create a Supabase project.
2. Install the Supabase CLI and link the repository to that project.
3. Apply `supabase/migrations/202609210001_initial_schema.sql` using `supabase db push`, or paste the migration once into the project's SQL editor.
4. In Authentication URL configuration, set the production Site URL and add `https://YOUR_DOMAIN/auth/callback` as an allowed redirect. Add the local callback during local development.
5. Register the first account, then run the documented one-time admin bootstrap statement at the end of the migration with that account's email.
6. Confirm Realtime replication includes `flood_reports`, `sos_alerts`, and `notifications`. The migration adds them to `supabase_realtime`.
7. The migration creates a private `flood-photos` bucket with MIME, size, owner, responder, and admin policies.

All tables use RLS. Public access is limited to non-flagged, public flood observations and active vehicle rules. SOS coordinates/details are restricted to the alert owner, responders, and administrators. Role changes are protected by RLS and a database trigger.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role client is isolated in `lib/supabase/admin.ts` and is not imported by Client Components. Current routes intentionally rely on user sessions plus RLS wherever possible.

## Verification

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Integration tests automatically run only when real Supabase credentials are present. For full authenticated E2E coverage, use dedicated test accounts in a separate Supabase staging project and seed them through a CI-only setup job; never use production user credentials.

## Vercel deployment

1. Import this repository into Vercel as a Next.js project.
2. Add all three environment variables for Production and Preview. Keep the service-role value secret.
3. Apply migrations to the matching Supabase project before promoting the deployment.
4. Set the Supabase Auth Site URL and redirect allow-list to the Vercel domain.
5. Deploy and verify `/`, `/map`, authenticated report/SOS flows, responder status changes, and admin moderation.

The included `vercel.json` selects the Singapore region. Change the region if the Supabase project is hosted elsewhere to reduce latency.

## Operational configuration

- The in-process limiter is defense in depth. Configure a distributed rate limiter at the Vercel edge for multi-instance production. PostgreSQL duplicate guards remain active.
- Configure an external SMS/push provider separately if dispatch notifications are required. The app only states that an SOS was stored; it never claims external delivery.
- Review vehicle thresholds with qualified local authorities. They are informational and must not override closures, moving-water warnings, or responder instructions.
- Establish retention rules for GPS and SOS records based on local privacy requirements.

## Troubleshooting

- **Backend setup notice:** one or both public Supabase variables are absent.
- **Permission denied:** confirm the migration ran and the account has the correct role in `profiles`.
- **No live updates:** verify the Realtime publication and RLS visibility for the signed-in account.
- **Upload rejected:** file must be JPEG, PNG, or WebP and no larger than 5 MB.
- **GPS unavailable:** browser permission, secure HTTPS context, and device location services are all required.
- **Build fails on environment checks:** use syntactically valid staging credentials during end-to-end CI, or build without credentials; connections occur at request time.

## Security notes

No password is stored by this app; authentication is delegated to Supabase Auth. Do not commit `.env.local`. Rotate any key that has been exposed. Audit logs are append-only from application clients and readable only by admins.
