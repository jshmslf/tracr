# Tracr

Your job application tracker. A personal tool for keeping track of job applications: titles, companies, statuses, salaries, links, and notes, in one place instead of scattered across spreadsheets and browser tabs.

## Features

- **Applications table** with sortable columns, filters (status, company, search), and a status pipeline (Saved → Applied → Interviewing → Offer / Rejected / Withdrawn)
- **Auto-fill from a link**: paste a job posting URL and Tracr scrapes the title, company, salary, location, and description for you (fast HTML parsing first, falling back to a headless browser for JS-heavy pages)
- **Rich text descriptions**: paste formatted content from a job posting (bold, italics, bullet/numbered lists, links) and it's preserved, sanitized, and still editable
- **Salary tracking** with currency and pay-period (hourly/monthly/yearly)
- **Accounts**: email/password or Google sign-in, with the option to set/change a password, a "Connected devices" list for the browser extension, and self-service account deletion
- **Light/dark theme**, saved per account
- **Browser extension**: add an application without leaving the job posting tab — see below

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Drizzle ORM](https://orm.drizzle.team) + Postgres ([Neon](https://neon.tech))
- [better-auth](https://www.better-auth.com) for authentication (email/password + Google OAuth)
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS
- [TipTap](https://tiptap.dev) for the rich text description editor
- [cheerio](https://cheerio.js.org) + [Playwright](https://playwright.dev) for scraping (fast path + headless fallback)
- [Font Awesome](https://fontawesome.com) for icons

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values:
   ```
   DATABASE_URL=          # Postgres connection string (e.g. from Neon)
   BETTER_AUTH_SECRET=    # random string, e.g. `openssl rand -hex 32`
   BETTER_AUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=      # optional, enables Google sign-in
   GOOGLE_CLIENT_SECRET=  # optional, enables Google sign-in
   ```
3. Push the database schema:
   ```bash
   npm run db:push
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Browser extension

Tracr has a companion browser extension (Chrome/Edge) that lets you add an application from any job posting tab without switching to the website, using a one-time 12-word phrase to connect it to your account (generated from your Profile page).

Source: **[tracr-extension](https://github.com/your-username/tracr-extension)** *(update this link once the repo is pushed to GitHub)*

## Project structure

```
app/                Next.js App Router routes (pages, API routes, server actions)
components/          UI components (shadcn primitives in components/ui, feature components grouped by area)
lib/                 Database client/schema, auth config, scraping, validation, shared helpers
```
