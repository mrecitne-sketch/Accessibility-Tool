# Supabase Auth Setup Guide

This guide will help you enable authentication in your Supabase project.

## Enable Email Authentication

### Step 1: Enable Email Provider

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers** (left sidebar)
4. Find the **Email** provider
5. Make sure it's **enabled** (toggle should be ON)

### Step 2: Enable Sign Ups

1. Still in **Authentication** → **Providers** → **Email**
2. Look for the **Enable sign ups** toggle
3. **Turn it ON** - This allows new users to create accounts via magic links

### Step 3: Configure Email Templates (Optional)

1. Navigate to **Authentication** → **Email Templates** (left sidebar)
2. Update the **Magic Link** template if needed
3. Make sure the template includes the confirmation URL:

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

### Step 4: Configure Redirect URLs

1. Navigate to **Authentication** → **URL Configuration** (left sidebar)
2. Add your redirect URLs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
3. Set **Site URL** to your application URL (e.g., `http://localhost:3000` for local dev)

## Common Issues

### "Signups not allowed for otp"

**Solution**: 
1. Go to **Authentication** → **Providers** → **Email**
2. Enable the **Enable sign ups** toggle
3. Save changes

### Magic links not working

**Solution**:
1. Check that redirect URLs are configured correctly
2. Verify the email provider is enabled
3. Check your email spam folder
4. For local development, check Mailpit if using Supabase CLI

## Testing

Once configured:
1. Click "Sign In" in your app
2. Enter your email address
3. Click "Send Sign In Link"
4. Check your email and click the magic link
5. You should be redirected back and logged in!

