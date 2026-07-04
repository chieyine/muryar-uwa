# Free-Tier Deployment Guide — Muryar Uwa

This guide explains how to deploy the Muryar Uwa platform to the cloud for **100% free** (with zero subscription fees or payment cards required).

We will host the Next.js application on **Vercel** and connect it to a free hosted PostgreSQL database on **Neon** or **Supabase**.

---

## Part 1: Set Up the Free Database (Supabase or Vercel Postgres)

### Option A: Supabase (Recommended - Generous & highly stable free tier)
1. Go to [https://supabase.com/](https://supabase.com/) and sign up for a free account.
2. Create a new project. Choose a secure database password.
3. In your project settings, navigate to **Database** → **Connection Strings** → **Prisma**.
4. Copy the connection string. It will look like this:
   `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

### Option B: Vercel Postgres (Provisioned directly inside Vercel)
If other sites fail to load or you want the simplest configuration:
1. When creating your project in the Vercel dashboard, navigate to the **Storage** tab.
2. Click **Connect Database** and select **Vercel Postgres** (free tier).
3. Follow the prompt to create a new database. Vercel will automatically configure and inject the `POSTGRES_PRISMA_URL` and `DATABASE_URL` environment variables directly into your project setup!

---

## Part 2: Migrating Prisma to PostgreSQL (Local Setup)

Once you have your cloud database connection string, follow these steps to migrate and seed the database:

1. Run the database toggler command to ensure the codebase is configured for PostgreSQL:
   ```bash
   npm run db:postgres
   ```
2. Open your local `.env` file and temporarily set `DATABASE_URL` to your cloud connection string:
   ```env
   DATABASE_URL="your-supabase-or-vercel-postgres-connection-string"
   ```
3. Run the database push to create the tables in your cloud database:
   ```bash
   npx prisma db push
   ```
4. Run the seed script to populate the cloud database with the demo users, facilities, and participant profiles:
   ```bash
   npx prisma db seed
   ```
5. Restore your local `.env` database URL back to SQLite (or run `npm run db:sqlite` when developing locally again).

---

## Part 3: Deploy to Vercel (100% Free)

1. Push your repository to GitHub (make sure it's private to protect your keys).
2. Go to [https://vercel.com/](https://vercel.com/) and sign up for a free **Hobby** account.
3. Click **Add New** → **Project** and import your GitHub repository.
4. In the **Environment Variables** section, add the following variables:
    *   `DATABASE_URL`: (your Supabase connection string, or skipped if using Option B Vercel Postgres since Vercel configures it automatically)
    *   `NEXTAUTH_SECRET`: `generate-a-secure-random-key`
    *   `NEXTAUTH_URL`: `https://[your-app-name].vercel.app`
5. Click **Deploy**. Vercel will build and launch your application in under 2 minutes for free!
