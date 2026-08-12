# Hudi CRM (Amtel)

A customer relationship management app for Amtel — manage customers, subscription
bundles, and loyalty status, with real-time sync and bulk import.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Firebase (Auth, Firestore, Analytics)
- Recharts for dashboard charts
- Installable as a PWA (add to home screen on mobile)

## Features

- Email/password authentication
- Real-time customer table (search, filter by loyalty status)
- Add / edit / delete customers, toggle loyal ↔ normal status
- Bulk import customers from an Excel (`.xlsx`) or CSV file, with per-row validation
- Editable profile: display name, password, avatar
- Dashboard stats + charts (loyalty distribution, new customers over time)
- Bundle expiry tracking (badges, stat card, filter) and Excel export
- Per-customer activity timeline (created/updated/status/call/top-up, plus manual notes)
- Somali/English UI toggle, click-to-call phone links
- EVC Plus SMS-to-CRM webhook (Cloud Function) and 24h bundle-expiry push notifications

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Firebase project config
npm run dev
```

## Firebase setup

This project needs, in the Firebase console for your project:

1. **Authentication** → Sign-in method → Email/Password enabled, with at least one user created.
2. **Firestore Database** → created (production mode).
3. Firestore rules published from [`firestore.rules`](./firestore.rules).

## Build & deploy

```bash
npm run build
firebase deploy --only hosting,firestore:rules,functions
```

Hosting and project config live in [`firebase.json`](./firebase.json) and [`.firebaserc`](./.firebaserc).

## Cloud Functions (SMS webhook + expiry alerts)

Lives in [`functions/`](./functions) — a separate Node package, deployed with
`firebase deploy --only functions`. Requires:

1. **Blaze (pay-as-you-go) plan** on the Firebase project — Cloud Functions
   don't run on the free Spark plan.
2. `firebase login` completed once on the machine deploying (Functions can't
   be deployed by pasting code into the console, unlike Firestore rules).
3. `functions/.env` with `SMS_WEBHOOK_SECRET` set (see `functions/.env.example`)
   — a long random token that authorizes calls to the SMS webhook.
4. A **VAPID key** for web push: Firebase Console → Project Settings → Cloud
   Messaging → Web Push certificates → generate one, then set
   `VITE_FIREBASE_VAPID_KEY` in `.env` (and as a Vercel environment variable).

### SMS webhook

`receiveSmsWebhook` (HTTPS function) accepts a POST with the raw SMS text
(JSON `{"message": "..."}`, or a form field named `message`/`body`/`text`/`sms`),
parses the EVC Plus "sell airtime" confirmation format, matches the phone
number against the `customers` collection, and logs a top-up activity.

Point an SMS-forwarding app (installed on the phone with the Amtel SIM,
e.g. "SMS Forwarder" on Android) at:

```
https://<region>-<project-id>.cloudfunctions.net/receiveSmsWebhook?token=<SMS_WEBHOOK_SECRET>
```

### Expiry alerts

`checkExpiredBundles` (scheduled function, hourly) finds customers whose
`bundleExpiry` passed 24+ hours ago and hasn't been renewed, and sends a web
push notification to every staff member who has enabled notifications
(Profile → Enable Notifications).
