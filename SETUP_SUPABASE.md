# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: AllyFix
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Settings** → **API** (in left sidebar)
2. You'll see several keys. Copy these values:

### For `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=         # Copy "Project URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Copy "anon public" key
SUPABASE_SERVICE_ROLE_KEY=        # Copy "service_role" key (keep this secret!)
```

**⚠️ Important**: The `service_role` key bypasses Row Level Security. Never commit it to Git or expose it in client-side code!

## Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open `supabase/schema.sql` from your project
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run" or press Cmd/Ctrl + Enter
7. You should see "Success" message

This creates:
- `users` table
- `scans` table  
- Row Level Security policies
- Database functions

## Step 4: Enable Email Auth

1. Go to **Authentication** → **Providers** (left sidebar)
2. Enable "Email" provider if not already enabled
3. Configure email templates if desired (optional)

## Step 5: Add Keys to `.env.local`

Edit `.env.local` file and replace the placeholder values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Step 6: Restart Dev Server

After adding keys, restart your dev server:

```bash
# Kill current server (Ctrl+C in terminal)
# Then restart:
source "$HOME/.nvm/nvm.sh"
npm run dev -- --webpack
```

## Verify Setup

Visit http://localhost:3000 in your browser. The landing page should load without errors (check browser console for any issues).

## Quick Test (Optional)

You can test the database connection by:
1. Going to **Table Editor** in Supabase dashboard
2. You should see `users` and `scans` tables
3. Try inserting a test user manually to verify RLS policies work

---

## Troubleshooting

**"Module not found" errors**: Make sure `.env.local` exists in project root

**Database connection errors**: 
- Verify all 3 keys are copied correctly
- Check that URL starts with `https://`
- Ensure project is active (not paused)

**RLS policy errors**: Re-run `schema.sql` migration

**Still stuck?**: Check browser console and terminal logs for specific error messages

---

## Next Steps

After Supabase is set up:
1. Test the scanning flow with a real URL
2. 📖 Set up Stripe for payments (see `STRIPE_SETUP.md`)
3. Implement authentication

See `TOMORROW.md` for full roadmap.

