# Deployment Guide for ReelVault

ReelVault is fully prepared for production deployment. This guide walks you through deploying the Frontend (React/Vite) and Backend (Supabase).

## 1. Supabase (Database & Auth) Setup
1. **Create a Production Project**: Go to [Supabase](https://supabase.com) and create a new project.
2. **Run Migrations**: 
   - You can copy the contents of `supabase/migrations/20261008000000_init_reelvault.sql` and run it in the Supabase SQL Editor.
   - Alternatively, if you have the Supabase CLI installed, run:
     ```bash
     supabase link --project-ref <your-project-ref>
     supabase db push
     ```
3. **Configure Auth**: Under Authentication > Providers, ensure Email authentication is enabled (or configure OAuth providers if desired).
4. **Get Credentials**: Go to Project Settings > API and copy your `Project URL` and `anon public` key.

## 2. Frontend Hosting (Vercel / Netlify / Cloudflare Pages)
ReelVault is a standard Vite React application and can be hosted seamlessly on any static hosting provider.

### Vercel (Recommended)
1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. **Environment Variables**: Add the following Environment Variables in Vercel before deploying:
   - `VITE_SUPABASE_URL`: (Your Supabase Project URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click **Deploy**.

## 3. Post-Deployment Checks
- Navigate to your deployed URL.
- Test the authentication flow (Sign up / Login).
- Test saving a new Instagram Reel URL to ensure Row Level Security (RLS) is working correctly for your user.
- Verify the Dark/Light mode toggle functions correctly in production.

*Happy collecting!*
