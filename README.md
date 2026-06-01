# GymFlow Pro

GymFlow Pro is a React + Vite gym operations dashboard backed by Supabase. It uses real authentication, Google OAuth, email/password login, Supabase Postgres, and Row Level Security.

## Local setup

1. Create a Supabase project.
2. Open the Supabase SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In Supabase, open **Authentication > Providers** and enable **Google**. Add your Google OAuth client ID and secret.
4. In Supabase, open **Authentication > URL Configuration**. Set your site URL and add redirect URLs for local development and production:
   - `http://localhost:5173`
   - `https://your-vercel-domain.vercel.app`
5. Copy `.env.example` to `.env` and add your Supabase project URL and anon/public key.
6. Install dependencies and start Vite:

```bash
npm install
npm run dev
```

## Supabase security

The frontend uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never place the Supabase service role key in a Vite environment variable or in browser code.

The SQL setup enables Row Level Security on `public.members` and creates separate `select`, `insert`, `update`, and `delete` policies. Every policy is scoped to `auth.uid() = user_id`, so authenticated users can access only their own rows.

## Google OAuth

The login screen starts Google OAuth with:

```js
supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: window.location.origin,
  },
});
```

After Google redirects back to the app, Supabase restores the authenticated session and the dashboard becomes available. Without a valid session, the app renders only the login screen.

## Deploy to Vercel

1. Push the `gymflow-pro` folder to a Git repository and import it in Vercel.
2. Vercel will use the included `vercel.json` settings to run `npm run build` and publish `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project environment variables.
4. Deploy.
5. Add the final Vercel URL to the Supabase redirect URL allowlist and to the authorized redirect origins in your Google OAuth configuration.

Build locally before deploying:

```bash
npm run build
```

## GitHub Actions deployment

The included [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) workflow deploys the production site to Vercel whenever code is pushed to `main`. It can also be started manually from the GitHub Actions tab.

Add these secrets in **GitHub repository settings > Secrets and variables > Actions**:

- `VERCEL_TOKEN`: create this from your Vercel account settings.
- `VERCEL_ORG_ID`: find this in the linked project's `.vercel/project.json` file after running `vercel link`.
- `VERCEL_PROJECT_ID`: find this in the same `.vercel/project.json` file.

Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured in the Vercel project environment variables. The workflow retrieves them during `vercel pull`. Do not add a Supabase service role key.
