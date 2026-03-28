# Authentication Setup Complete ✅

## Backend API (Port 3001)

**Database:** Neon PostgreSQL connected and migrated

**Auth Providers:**
- ✅ GitHub OAuth (configured)
- ✅ Google OAuth (empty - add credentials when ready)
- ✅ Email + Password

**Test the API:**

1. Start the API server:
```bash
cd apps/api
bun run dev
```

2. Test health endpoint:
```bash
curl http://localhost:3001/api/health
```

3. Better Auth provides these endpoints:
- `POST /api/auth/sign-in/social` - Social login (GitHub/Google)
- `POST /api/auth/sign-in/email` - Email/password login
- `POST /api/auth/sign-up/email` - Email signup
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

## Frontend (Port 3000)

**Start the frontend:**
```bash
cd apps/web
bun run dev
```

**Auth Features:**
- Login page at `/login`
- React Query hooks for auth
- Auth state in sidebar (Login button → User dropdown)

## File Structure

```
apps/api/
├── src/
│   ├── app.ts          # Hono app with routes
│   ├── index.ts        # Server entry (port 3001)
│   ├── auth/
│   │   └── index.ts    # Better Auth config
│   └── db/
│       ├── index.ts    # Neon connection
│       └── schema.ts   # Auth tables
├── .env                # Your credentials
└── drizzle/            # Migrations (applied)

apps/web/
├── src/
│   ├── lib/
│   │   ├── auth-client.ts    # Better Auth client
│   │   ├── api/client.ts     # API client
│   │   ├── queries/auth.ts   # React Query hooks
│   │   └── types/auth.ts     # TypeScript types
│   ├── components/auth/
│   │   └── login-page.tsx    # Login UI
│   └── routes/login.tsx      # Login route
```

## GitHub OAuth Test Checklist

1. ✅ API running on http://localhost:3001
2. ✅ Frontend running on http://localhost:3000
3. ✅ Click "Continue with GitHub" on login page
4. ✅ Should redirect to GitHub authorization
5. ✅ After auth, redirects back to homepage
6. ✅ Sidebar shows user avatar + name

## Environment Variables (.env)

```env
# API .env
DATABASE_URL="postgresql://neondb_owner:npg_x95yrZzfAlvi@ep-muddy-tooth-alet76x6-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
BETTER_AUTH_SECRET="3SHaheO8wT6kdCvEP1jH1c1ZWyVrCVgIgHV0gZOPKFY="
BETTER_AUTH_URL="http://localhost:3001"
GITHUB_CLIENT_ID="Iv23liOznqk3s7zPtNqo"
GITHUB_CLIENT_SECRET="c4c66c5e389d49829555ecad5c089da30527e97c"
```

## Quick Test

1. Start both servers in separate terminals:
```bash
# Terminal 1
cd apps/api && bun run dev

# Terminal 2
cd apps/web && bun run dev
```

2. Visit: http://localhost:3000/login
3. Click "Continue with GitHub"
4. Authorize the app
5. You should be logged in!

## Troubleshooting

**If GitHub OAuth fails:**
- Check GitHub OAuth app settings
- Ensure callback URL is: `http://localhost:3001/api/auth/callback/github`
- Verify client ID and secret in .env

**If database fails:**
- Check DATABASE_URL is correct
- Run `bun drizzle-kit migrate` again
