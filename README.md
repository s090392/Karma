# KARMA Web App

KARMA is a dynamic, full-stack career safety web app for BPO, IT outsourcing, freshers, and managers. It uses backend APIs, login sessions, and a cloud PostgreSQL database plan for market launch.

## Files

- `src/app` - Next.js app screens and backend API routes.
- `src/lib` - database, auth, scoring, and mission logic.
- `prisma/schema.prisma` - cloud PostgreSQL data model.
- `docs/cloud-database-plan.md` - production database plan.
- `docs/testing-guide.md` - plain-English testing plan.
- `tests/scoring-check.js` and `tests/api-shape-check.js` - local checks.

## Production Setup

1. Create a Supabase PostgreSQL project.
2. Set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, and `KARMA_ADMIN_PIN`.
3. Run `npx prisma migrate deploy` in production.
4. Keep dummy OTP for testing; replace with SMS provider when ready.
5. Deploy the app to Vercel, Render, or another Node-capable host.
6. Test login, assessment completion, returning user login, mission tracking, admin metrics, and subscription updates on a real phone.

## Local Checks

Run:

```bash
node tests/scoring-check.js
node tests/api-shape-check.js
```
