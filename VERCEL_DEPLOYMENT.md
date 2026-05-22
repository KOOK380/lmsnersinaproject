# 🚀 Custom Vercel Deployment Guide

This full-stack LMS application has been optimized to be **Vercel-Friendly**! 

Using the pre-configured `vercel.json` and `/api/index.ts` setup, Vercel will host your **React Frontend statically on its high-speed global CDN**, while automatically routing your Express backend `/api/*` endpoints to **high-performance, secure Serverless Functions**.

Follow these straightforward steps to deploy your application to Vercel.

---

## 📋 Prerequisites
1. **GitHub Account**: Prepare a GitHub repository with this code (you can download the ZIP of this project using the top-right settings dropdown in AI Studio, extract it, and push it to a new GitHub repo).
2. **PostgreSQL Database**: A hosted PostgreSQL database URL (e.g., from [Supabase](https://supabase.com/), [Neon](https://neon.tech/), or [Render](https://render.com/)).

---

## 🛠️ Step-by-Step Vercel Deployment

### 1. Link Your Github Repository to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **"Add New"** ➜ **"Project"**.
2. Connect your GitHub account and import your repository.

### 2. Configure Build & Development Settings
Under the **Configure Project** section, Vercel is highly intelligent and will automatically detect the settings, but verify they look like this:
* **Framework Preset**: `Vite` (or `Other` / `Create React App`) - Vercel will auto-detect Vite.
* **Root Directory**: `./` (Root)
* **Build Command**: `prisma generate && tsc && vite build` (Vercel reads this from your `package.json`'s `build` script automatically).
* **Output Directory**: `dist`

### 3. Add Environment Variables (Crucial)
Expand the **Environment Variables** section on Vercel and add your environment configuration:

| Variable Name | Description | Example / Recommended Source |
|:---|:---|:---|
| `DATABASE_URL` | Transaction connection pool URL for Prisma Client. | e.g. `postgresql://postgres...` (from Supabase/Neon) |
| `DIRECT_URL` | Direct connection URL to database for migrations. | e.g. `postgresql://postgres...` (with session/direct port) |
| `JWT_SECRET` | A secure cryptographical string for signing admin tokens. | Generate a long random string (e.g. `your-super-secret-jwt-key`) |
| `STRIPE_SECRET_KEY` | Stripe backend payment secret key (Optional). | From your Stripe developer dashboard |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe frontend client public key (Optional). | Starts with `pk_` (Exposed to the frontend client) |

> 💡 **Note on Supabase / Neon Connection Pooling**: 
> Serverless functions scale instantly. To prevent database connection exhaustion, it is highly recommended to use **Session / Connection Pooling Urls** for `DATABASE_URL` and standard **Direct Connection Url is mapped** in `DIRECT_URL`.

### 4. Push Database Schema & Deploy!
1. Once variables are placed, click **"Deploy"**.
2. Vercel will fetch your repository, run `prisma generate` to compile the database client, package up the static frontend and the Express function, and output your live deployment link.
3. Once deployed, to apply the initial tables to your live database, run this command from your terminal:
   ```bash
   npx prisma db push
   ```
   *(This ensures all your database tables are created matches your PostgreSQL instance schema without needing to manually write SQL queries).*

---

## 🔒 Optimized Serverless Benefits Included
* **Shared Prisma Singleton**: Prevents database gateway leakages on quick lambda starts (located in `src/lib/prisma.ts`).
* **CDN-Fast Loading**: Vite static bundle takes full advantage of edge-optimized assets cache distribution.
* **Autonomous Zero-Serverless Management**: Express runs dynamically only when requested. No long-running background VM resource fees!
