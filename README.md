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
- EVC Plus SMS-to-CRM webhook and 24h bundle-expiry push notifications (no Firebase Blaze plan required)

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

## SMS webhook + expiry alerts (Vercel, no Blaze plan needed)

Lives in [`api/`](./api) as Vercel Serverless Functions — these deploy
automatically with the rest of the app via the existing GitHub → Vercel
integration (no separate deploy step, no `firebase login`, no Firebase
Blaze/billing plan). They use `firebase-admin` with an explicit service
account credential instead, since they run outside Google Cloud.

Required Vercel environment variables (Project Settings → Environment
Variables — add for all environments):

| Variable | Where it comes from |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Console → Project Settings → Service Accounts → **Generate new private key** (paste the whole downloaded JSON as the value) |
| `SMS_WEBHOOK_SECRET` | Any long random string — authorizes calls to `/api/sms-webhook` |
| `CRON_SECRET` | Any long random string — authorizes calls to `/api/check-expiry` |

A **VAPID key** is also needed client-side for web push: Firebase Console →
Project Settings → Cloud Messaging → Web Push certificates → generate one,
then set `VITE_FIREBASE_VAPID_KEY` in `.env` and as a Vercel env var too.

### SMS webhook

`/api/sms-webhook` accepts a POST with the raw SMS text (JSON
`{"message": "..."}`, or a form field named `message`/`body`/`text`/`sms`),
parses the EVC Plus "sell airtime" confirmation format, matches the phone
number against the `customers` collection, and logs a top-up activity.

Point an SMS-forwarding app (installed on the phone with the Amtel SIM,
e.g. "SMS Forwarder" on Android) at:

```
https://<your-vercel-domain>/api/sms-webhook?token=<SMS_WEBHOOK_SECRET>
```

#### Alternative: Termux script (no third-party forwarding app)

If a black-box SMS-forwarding app isn't reliable enough, run
[`scripts/termux-evc-forwarder.sh`](./scripts/termux-evc-forwarder.sh) instead —
a small open-source script (not a compiled app) that polls the inbox itself
via [Termux:API](https://wiki.termux.com/wiki/Termux:API) and posts new
messages from the EVC sender straight to the webhook. On the phone with the
Amtel SIM:

1. Install **Termux** and **Termux:API** from
   [F-Droid](https://f-droid.org/packages/com.termux/) (not the Play Store
   build — it's outdated and incompatible). Open Termux:API once and grant it
   the SMS permission when prompted.
2. In Termux: `pkg install termux-api jq curl`
3. Copy `scripts/termux-evc-forwarder.sh` onto the phone (e.g. `curl` it from
   a Gist/raw GitHub URL, or use Termux's built-in file editor) and edit the
   `WEBHOOK_TOKEN` variable at the top to match `SMS_WEBHOOK_SECRET`.
4. `chmod +x termux-evc-forwarder.sh && ./termux-evc-forwarder.sh` — it polls
   every 20 seconds, tracks the last forwarded message so nothing is sent
   twice, and logs each forward with its HTTP response code.
5. To survive phone reboots, install **Termux:Boot** (also from F-Droid),
   then put a one-line script in `~/.termux/boot/` that launches
   `termux-evc-forwarder.sh`. Also disable battery optimization for Termux in
   Android Settings → Apps → Termux → Battery, so Android doesn't kill it.

### Expiry alerts

`/api/check-expiry` finds customers whose `bundleExpiry` passed 24+ hours
ago and hasn't been renewed, and sends a web push notification to every
staff member who has enabled notifications (Profile → Enable Notifications).
Vercel Hobby's built-in cron is daily-only, so trigger this hourly with a
free external scheduler like [cron-job.org](https://cron-job.org) hitting:

```
https://<your-vercel-domain>/api/check-expiry?token=<CRON_SECRET>
```

### Optional: Firebase Cloud Functions alternative

An equivalent implementation also lives in [`functions/`](./functions) for
projects that are already on the Firebase Blaze plan and would rather run
this natively on Firebase instead of Vercel — deploy with
`firebase deploy --only functions` (requires `firebase login` once). The two
implementations are independent; use one or the other, not both.
