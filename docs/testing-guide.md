# KARMA Testing Guide

## What You Can Test Today

The app code, screens, scoring logic, and backend route structure can be checked locally.

Run:

```bash
npm test
npx tsc --noEmit
```

These checks confirm:

- The scoring engine gives valid score ranges.
- The expected backend API files exist.
- The TypeScript app code compiles.

## What Needs Cloud Database Setup First

The full login-to-dashboard flow needs a cloud PostgreSQL database connection.

Before full testing, create a Supabase project and add the real database connection string to `.env`:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SESSION_SECRET="a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
KARMA_ADMIN_PIN="your-test-admin-pin"
```

Then run:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test Login

Use any phone number.

The test OTP is:

```text
123456
```

Expected result:

- You enter phone number.
- App says dummy OTP is ready.
- You enter `123456`.
- You enter the app dashboard.

## Test Assessment

1. Open `Assessment`.
2. Select segment, function, AI adoption, experience, salary, and task atoms.
3. Click `Calculate and save score`.

Expected result:

- You land on `Safety Dashboard`.
- Safety Score, AI Risk, Logic Quotient, Safety Window, and Monthly Drift update.
- Refreshing the page still shows the saved result.

## Test Intelligence Feed

Open `Intelligence Feed`.

Expected result:

- Feed items load from the backend.
- If seed data exists, it shows database items.
- If no seed data exists, it shows fallback items.

## Test Mission Plan

Open `90-Day Mission Plan`.

Expected result:

- Mission actions appear.
- Clicking an action marks it complete.
- Refreshing the page preserves the completed state.

## Test Subscription

Open `Profile & Plans`.

Expected result:

- Selecting Free, Explorer, Navigator, or Pioneer updates the user subscription in the database.
- This is not real payment yet. Razorpay should be connected after pricing and plan rules are final.

## Test Admin

Open `Admin`.

Enter the admin PIN from `.env`.

Expected result:

- Total users
- Paid users
- Assessment count
- MRR
- Plan breakdown

## Beta User Testing Script

Ask each beta user to do only this:

1. Sign in with phone and dummy OTP.
2. Complete one assessment.
3. Read their dashboard.
4. Open the mission plan.
5. Tell you where they felt confused, skeptical, or motivated.

Do not ask, “Do you like the app?”

Ask:

- Did the score feel believable?
- Which question felt hard to answer?
- Did the result make you want to take action?
- Would you share this with a colleague?
- Would you pay ₹299/month for continued monitoring?

## Launch Readiness Rule

Do not market heavily until:

- 20 people complete the assessment.
- At least 12 say the result felt personally relevant.
- At least 5 say they would share it.
- At least 3 say they would consider paying.

