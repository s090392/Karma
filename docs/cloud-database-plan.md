# KARMA Cloud Database Plan

## Recommendation

Use **Supabase PostgreSQL** for launch.

This gives KARMA a real cloud database, built-in authentication options, Row Level Security, backups on paid plans, and a clean path to production without hiring a database team on day one.

## Why Supabase First

KARMA needs three things immediately:

1. A reliable cloud database.
2. User-level privacy controls.
3. A setup that can be operated by a solo founder.

Supabase is the best launch fit because it is PostgreSQL, has built-in user-aware security policies, and has a dashboard that makes day-to-day operations simpler. Supabase documentation specifically recommends enabling Row Level Security on exposed tables, and paid plans include managed backup options.

## Database Strategy

### Phase 1: Beta And First Paying Users

Provider: Supabase PostgreSQL  
App hosting: Vercel or Render  
Database region: Mumbai if available, otherwise Singapore  
Backups: paid Supabase plan before public launch  
Data policy: store only what is needed for account, scoring, subscriptions, streaks, and analytics

Tables:

- `users`: account identity, phone/email, country, created date
- `otp_challenges`: dummy OTP during testing, real SMS later
- `assessments`: score numbers and high-level category fields
- `mission_actions`: user mission progress
- `subscriptions`: plan and payment state
- `streaks`: daily check-in habit
- `intelligence_items`: admin-controlled feed items

Sensitive data such as raw task text, exact salary, employer/client name, profile identity answers, and uploaded CV content should remain device-side unless you explicitly decide to store it later.

### Phase 2: Growth

Add:

- Point-in-time recovery
- Scheduled database exports to separate storage
- Read-only analytics replica or warehouse
- Admin audit log
- Referral tracking
- Payment webhook event table

### Phase 3: Enterprise Scale

Move only if needed:

- AWS RDS PostgreSQL for deeper infrastructure control
- Separate analytics warehouse
- Disaster recovery region
- Formal data retention workflows

Do not start here. It adds operational burden too early.

## Security Rules

- No database password in frontend code.
- Only backend APIs can talk to the database.
- Every table must be scoped by `user_id` where user data exists.
- Admin endpoints require a server-side secret, never a browser-visible key.
- Payment card details stay with Razorpay, not KARMA.
- Backups must be enabled before any public launch.

## Environment Variables

Production must set:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SESSION_SECRET="long-random-secret"
NEXT_PUBLIC_APP_URL="https://mykarma.work"
KARMA_ADMIN_PIN="strong-private-pin"
```

For Prisma migrations, use `DIRECT_URL` when the provider gives a direct, non-pooled database connection. Use `DATABASE_URL` for normal app traffic.

## Launch Checklist

1. Create Supabase project.
2. Choose India/Singapore region.
3. Copy the Postgres connection string into production environment variables.
4. Run Prisma migration against Supabase.
5. Seed intelligence feed items.
6. Enable daily backups on a paid plan before inviting public users.
7. Add monitoring for failed logins, failed payments, slow queries, and API errors.
8. Test backup restore before launch.

## Alternatives

Neon PostgreSQL is excellent if the priority is serverless scaling and database branching for development. Neon is also a good fit if the app is hosted on Vercel because Vercel now connects external Postgres providers through its marketplace.

AWS RDS PostgreSQL is best later, when KARMA has enough scale to justify more infrastructure control and maintenance.
