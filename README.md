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
firebase deploy --only hosting,firestore:rules
```

Hosting and project config live in [`firebase.json`](./firebase.json) and [`.firebaserc`](./.firebaserc).
