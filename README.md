# TRACE — Find My Dog

**Tracker · Relay · Alert · Community · Chip Engine**

A unified missing dog recovery platform combining ACCT microchips, BLE relay mesh, community sightings, and WEA emergency broadcasts.

## Stack

- **Client**: React 18 + Vite + Tailwind + Zustand → Vercel
- **Server**: Express + TypeScript + Supabase → Fly.io
- **DB**: Supabase (PostgreSQL + PostGIS)

## Quick Start

### Client
```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

### Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

### Client (`client/.env.local`)
| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://uneqlkclvazolpwufcwa.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | See Supabase dashboard |
| `VITE_API_URL` | `https://trace-api.fly.dev/api` |

### Server
Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard → Settings → API.

## Deploy

**Client → Vercel**
1. Import `cloudygetty-ai/trace` on vercel.com
2. Root directory: `client`
3. Add env vars above

**Server → Fly.io**
```bash
cd server
flyctl launch --no-deploy
flyctl secrets set SUPABASE_URL=https://uneqlkclvazolpwufcwa.supabase.co SUPABASE_SERVICE_ROLE_KEY=...
flyctl deploy
```

**DB → Supabase**
Schema already applied to project `uneqlkclvazolpwufcwa`.

## Screens

Onboarding → Login → Signup → Home → Map → Dog Profile → Chips → NFC Scanner → Community → Report Sighting → Found Dog → Broadcast → Poster → Notifications → Settings

## ACCT Chip System

- ISO 11784/11785 15-digit IDs
- Passive (NFC/RFID) + Active (BLE) variants
- Public lookup: `GET /api/chip/:chipId` (no auth)
- NFC web tap → `https://trace.app/c/:chipId`
