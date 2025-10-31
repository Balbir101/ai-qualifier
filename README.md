# AI Qualifier – Supabase + Prisma + OpenAI

A production-ready prototype that **works end-to-end**:

- Supabase **Auth** (email magic link, client-side)
- **Prisma** models + Postgres (Supabase DB ready)
- Pages for **Onboarding → ICP → Qualify → Results**
- API routes that **persist** ICPs and Qualification Runs
- OpenAI-powered ICP (falls back to mock if no key)

## 0) Prereqs
- Node 18+ and npm
- Supabase project (URL + anon key)
- A Postgres connection string (Supabase -> Database -> Connection Info) for `DATABASE_URL`

## 1) Configure env
Copy `.env.example` → `.env.local` and set:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres

OPENAI_API_KEY=sk-...            # optional; falls back to mock if empty

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 2) Install & DB setup
```bash
npm install
npm run prisma:generate
npm run prisma:migrate   # creates the tables in your DB
```

If you prefer not to manage migrations locally:
```bash
npm run prisma:push
```

## 3) Run the app
```bash
npm run dev
# http://localhost:3000
```

## 4) Flow
1. **Sign in** (optional): navigate to `/login` and use your email (magic link).  
2. **Onboarding**: enter your domain → we scrape & generate an ICP → saved via Prisma.  
3. **ICP page**: shows the latest saved ICP.  
4. **Qualify**: paste domains → we generate signals + score vs ICP → saved as a QualRun + ProspectResults.  
5. **Results**: lists the latest run with scores + rationales + signals.

## 5) Code map
- Prisma schema: `prisma/schema.prisma`
- DB client: `src/lib/prisma.ts`
- Supabase client: `src/lib/supabaseClient.ts` (client-only auth)
- Scraper: `src/lib/scrape.ts` (fetch + cheerio)
- OpenAI ICP: `src/lib/ai.ts` (uses `OPENAI_API_KEY` if present)
- Routes:
  - `POST /api/icp` → save ICP
  - `GET /api/icp/latest` → load ICP
  - `POST /api/qualify` → create QualRun + results
  - `GET /api/qualify/latest` → load latest run

## Notes
- Auth is optional; if you’re not signed in, items are saved with `userId = "public-user"`.
- To scope by user, change queries to filter by `userId` (e.g., `findFirst({ where: { userId } ... })`).
- Scraper is basic and may be blocked by some sites; it’s enough for assignment purposes.
- OpenAI errors fall back to a deterministic ICP so you can demo without keys.
