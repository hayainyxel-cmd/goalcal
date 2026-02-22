# GoalCal 🎯

A minimalist, habit-focused goal tracking calendar with WhatsApp reminders.

**Live:** Track daily, weekly, and monthly goals on a beautiful interactive calendar — with automatic WhatsApp reminders at your chosen times.

---

## Features

- 📅 **Month view calendar** with color-coded goal indicators (completed / pending / missed)
- ✅ **Daily, weekly & monthly goals** — tap any date to add, update, or log progress
- 🔥 **Streak tracking** — consecutive completions tracked per goal
- 📊 **Monthly stats** — completion rate, totals at a glance
- 📱 **WhatsApp reminders** — verified number receives automatic messages at scheduled times
- 🌙 **Light / dark mode** — toggle saved to user preferences
- 🔐 **Auth** — email + password via Supabase

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase |
| WhatsApp | Twilio |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Cron jobs | Vercel Cron |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/goalcal.git
cd goalcal
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your project URL and keys

### 3. Set up Twilio

1. Create account at [twilio.com](https://twilio.com)
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Join the sandbox by sending the join code from your phone
4. Copy your Account SID and Auth Token

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=some-random-secret-string
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/goalcal)

### Option B: CLI

```bash
npm i -g vercel
vercel --prod
```

Add all environment variables in **Vercel Dashboard → Settings → Environment Variables**.

> **Cron jobs:** `vercel.json` includes a cron that fires every minute to check and send due WhatsApp reminders. This requires a **Vercel Pro** plan. On the free plan, remove the cron and trigger reminders manually or use an external scheduler like [cron-job.org](https://cron-job.org) to hit `GET /api/reminders/send` with header `Authorization: Bearer YOUR_CRON_SECRET`.

---

## Project Structure

```
goalcal/
├── app/
│   ├── api/
│   │   ├── reminders/send/     # Cron endpoint for WhatsApp reminders
│   │   └── whatsapp-verify/    # Send + confirm verification codes
│   ├── auth/
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   └── dashboard/
│       ├── goals/              # Goals list + filter view
│       └── settings/           # Profile + WhatsApp verification
├── components/
│   ├── CalendarView.tsx        # Main calendar grid
│   ├── DashboardShell.tsx      # Nav + theme toggle
│   ├── DayDetailModal.tsx      # Day popup with goal actions
│   ├── GoalModal.tsx           # Add new goal form
│   ├── GoalsClient.tsx         # Goals list UI
│   ├── SettingsClient.tsx      # Settings UI
│   └── StatsBar.tsx            # Monthly stats display
├── lib/
│   ├── calendar.ts             # Date/grid utilities
│   ├── whatsapp.ts             # Twilio helpers
│   └── supabase/               # Browser + server clients
├── types/index.ts
├── middleware.ts               # Route protection
├── supabase-schema.sql         # Full DB schema
└── vercel.json                 # Cron configuration
```

---

## WhatsApp Flow

1. User enters phone number in **Settings**
2. App sends a 6-digit code via Twilio WhatsApp sandbox
3. User enters the code to verify
4. When creating goals, user can pick a **reminder time**
5. Vercel Cron runs every minute → sends WhatsApp if `reminder_time == current_time` and goal is pending

> ⚠️ **Sandbox limitation:** Each user must opt-in to the Twilio sandbox by texting `join <word>` to `+1 415 523 8886` before receiving messages.

---

## License

MIT
