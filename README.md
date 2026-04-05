# BOW Story Scheduler

A premium standalone scheduling experience for BOW Sports Capital built with Next.js, Tailwind CSS, shadcn/ui, Framer Motion, Google Sheets, Google Calendar, and a lightweight Vercel KV lock layer.

## What is included

- Public page at `/share-your-bow-story`
- Protected staff area at `/admin` and `/admin/login`
- Google Sheets backed slot and booking storage
- Google Calendar event creation with a live meeting link
- Mock backend mode for local development and tests
- Public booking API plus protected admin APIs

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/share-your-bow-story](http://localhost:3000/share-your-bow-story).

For local preview without Google credentials, the app automatically falls back to mock mode unless `BOOKING_BACKEND_MODE=google` is set.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values you need.

Key variables:

- `BOOKING_BACKEND_MODE`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_WORKSPACE_IMPERSONATED_USER`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Google Sheets shape

Create these tabs in the spreadsheet:

- `availability`
- `bookings`
- `settings`

The app writes the required header row automatically the first time it interacts with `availability` or `bookings`.

`availability` columns:

- `slotId`
- `date`
- `startTime`
- `endTime`
- `active`
- `notes`

`bookings` columns:

- `bookingId`
- `slotId`
- `parentName`
- `studentName`
- `grade`
- `email`
- `phone`
- `formatPreference`
- `reflection`
- `mediaConsent`
- `bookingStatus`
- `storyStatus`
- `eventId`
- `meetLink`
- `createdAt`
- `updatedAt`
- `notes`

## Scripts

```bash
npm run dev
npm run dev:mock
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Deployment

This app is designed for Vercel.

1. Add the project on Vercel.
2. Set the environment variables from `.env.example`.
3. If you want the live Google backend, set `BOOKING_BACKEND_MODE=google`.
4. Redeploy after adding Google and Redis credentials.
