# Stripe Recurring Subscriptions Setup Guide

This guide will walk you through setting up Stripe recurring payments for AllyFix's $15/month Pro subscription.

## 🎯 TL;DR - Can I Start Now?

**Yes!** You can start testing Stripe right now without any business information:

✅ **Test Mode** (Development): Just need email + password  
❌ **Live Mode** (Real Payments): Need business info, website, bank account

**For now**: Set up in Test Mode → Start building → Switch to Live Mode later when ready

## ⚠️ Common Mistake: Price ID vs Product ID

**You only have a Product ID?** You need to add a **Price** to that product!

- ❌ Product ID = `prod_...` (what you're selling)
- ✅ Price ID = `price_...` (how much it costs - **this is what you need!**)

When creating a product in Stripe, make sure you set a **specific price** ($15, Monthly). This creates the Price ID that our code needs. See step 2 below for details.

## ✅ What's Already Implemented

The following endpoints are already built and ready to use:

1. **Checkout API** (`/app/api/checkout/route.ts`): Creates Stripe Checkout Sessions for subscriptions
2. **Webhooks API** (`/app/api/webhooks/stripe/route.ts`): Handles subscription events
3. **Customer Portal API** (`/app/api/portal/route.ts`): Manages customer subscriptions
4. **Database Schema**: Updated with Stripe fields

## 📋 Setup Steps

### ⚡ Quick Start (Test Mode Only)

**Good news!** For development and testing, you can skip all the business information and just set up Stripe in Test Mode. You only need the business details when you're ready to accept real payments.

### 1. Create Stripe Account (Test Mode)

1. Go to https://dashboard.stripe.com
2. Sign up for a free account with just:
   - Your email address
   - A password
   - Your name
3. **Important**: You'll be in "Test Mode" automatically (see the toggle in the top right)
   - Test Mode = No real payments, no business info needed
   - Can switch to Live Mode later when ready

### 2. Create Subscription Product

1. Navigate to **Products** in the Stripe Dashboard
2. Click **Add product**
3. Fill in the details:
   - **Name**: `AllyFix Pro`
   - **Description**: `Unlimited accessibility scans with PDF reports and priority support`
   - **Pricing model**: Recurring
   - **Price**: `$15.00 USD`
   - **Billing period**: `Monthly`
4. Click **Save product**

5. **Important**: You need the **Price ID**, not the Product ID!
   - After saving, you'll see your product page
   - You'll see a section with pricing details
   - Look for the **Price ID** (starts with `price_test_...` or `price_...`)
   - This is different from the Product ID (starts with `prod_...`)
   - Copy the **Price ID** - you'll need this for your `.env.local`

**Can't find the Price ID?**

Option 1: Add a price to your existing product
- On the product page, click "Add another price" button
- Set: $15.00 USD, Monthly
- Save - this creates the Price ID you need

Option 2: The Price ID should appear automatically
- After creating the product with recurring pricing, refresh the page
- Look for a section showing the pricing details
- The Price ID appears near the price amount
- It looks like: `price_1234567890abcd` (in test mode) or `price_1ABC...`

**Important**: 
- ✅ Product ID = `prod_...` (what you're selling - NOT what you need)
- ✅ Price ID = `price_...` (how much it costs - THIS is what you need!)

### 3. Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_...`)
3. Click **Reveal test key token** and copy your **Secret key** (starts with `sk_test_...`)

### 4. Set Up Webhooks (for Local Development)

For local testing, you'll use Stripe CLI to forward webhook events to your local server. This allows you to test webhook handling without deploying your application.

**Prerequisites**: Make sure Stripe CLI is installed (you just installed it with Homebrew!)

#### Step 1: Login to Stripe CLI

1. Run the login command:
   ```bash
   stripe login
   ```

2. This will:
   - Open your browser to authorize the CLI
   - Ask you to allow the CLI access to your Stripe account
   - Authenticate the CLI with your Stripe account

3. Once authenticated, you'll see a confirmation message like:
   ```
   Done! The Stripe CLI is configured for [account-name] with account id [acct_xxx]
   ```

#### Step 2: Forward Webhooks to Your Local Server

1. **Start your Next.js development server** (in a separate terminal):
   ```bash
   npm run dev
   ```
   Your server should be running on `http://localhost:3000`

2. **In a NEW terminal window**, run the Stripe CLI listen command:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. You'll see output like this:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
   ```

4. **IMPORTANT**: Copy the webhook signing secret (starts with `whsec_...`) - you'll need this for your `.env.local` file
   - ⚠️ **Note**: This secret is unique each time you run `stripe listen`
   - If you restart the `stripe listen` command, you'll get a new secret
   - Make sure to update `.env.local` if the secret changes

#### Step 3: Understanding What Happens

When you run `stripe listen`:
- The CLI creates a temporary webhook endpoint in your Stripe account
- All webhook events (like `checkout.session.completed`) are forwarded to your local server
- You'll see real-time logs of events being received and forwarded
- The CLI verifies webhook signatures automatically

#### Optional: Filter Specific Events

If you want to only receive specific webhook events (to reduce noise), you can filter them:
```bash
stripe listen --events checkout.session.completed,customer.subscription.deleted,invoice.payment_failed --forward-to localhost:3000/api/webhooks/stripe
```

This is useful if you're getting many events and only want to test specific ones.

### 5. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # From Stripe API keys
STRIPE_SECRET_KEY=sk_test_...  # From Stripe API keys
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe CLI
STRIPE_PRICE_ID=price_...  # IMPORTANT: Price ID, NOT Product ID!

# App URL (should already be set)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Update Database Schema

You need to add the Stripe fields to your existing database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this migration:

```sql
-- Add Stripe fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for lookup by customer ID
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id 
ON users(stripe_customer_id);
```

## 🧪 Testing the Integration

### 1. Test Checkout Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Make a POST request to `/api/checkout`:
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-user-id"}'
   ```

4. Use the returned `url` to complete a test checkout with Stripe's test card: `4242 4242 4242 4242`

### 2. Verify Webhook Processing

Check your terminal running `stripe listen` for webhook events. You should see:
- `checkout.session.completed` when checkout is finished
- The webhook should update your user's subscription tier to `pro`

### 3. Test Customer Portal

1. Make a POST request to `/api/portal`:
   ```bash
   curl -X POST http://localhost:3000/api/portal \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-user-id"}'
   ```

2. Use the returned `url` to access the customer portal
3. Verify you can manage subscription (update payment method, cancel, etc.)

## 🚀 Production Setup (When Ready for Real Payments)

### ⚠️ What You'll Need for Live Mode

When you're ready to accept real payments, Stripe requires:

**Business Information:**
- Legal business name (or your personal name if sole proprietor)
- Business type (LLC, Corp, Sole Proprietorship, etc.)
- Business address (physical address, not P.O. Box)
- Business phone number
- Website URL (your domain)

**Owner/Representative Info:**
- Full legal name
- Date of birth
- Home address
- SSN or Tax ID (last 4 digits)
- Government-issued ID (for verification)

**Banking:**
- Bank account number
- Routing number

**Website Requirements:**
- Privacy Policy page
- Terms of Service page
- Refund/Return policy
- Product descriptions
- Contact information

**Don't have all this yet?** No problem! Stay in Test Mode and continue building your product. You can switch to Live Mode anytime when you're ready.

### 1. Switch to Live Mode

1. In Stripe Dashboard, toggle **Test mode** to **Live mode**
2. Complete the account setup wizard with your business information
3. Create the same product in live mode
4. Get your live API keys from **Developers** → **API keys**

### 2. Set Up Production Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add it to your production environment variables

### 3. Update Environment Variables (Production)

Add to your Vercel/deployment environment:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🔒 Security Best Practices

1. **Never expose secret keys**: Always use `.env.local` for local development
2. **Use RLS policies**: Your database already has Row Level Security enabled
3. **Webhook signatures**: Always verify webhook signatures (already implemented)
4. **HTTPS in production**: Ensure your production domain uses HTTPS

## 📚 Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Billing Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

## 🐛 Troubleshooting

### "I only have a Product ID, not a Price ID"

**This is the most common issue!** Here's how to fix it:

1. Go to your product in Stripe Dashboard
2. Look for an "Add another price" or "Add price" button
3. Create a new recurring price: $15/month
4. The Price ID will be generated automatically
5. Copy that Price ID (starts with `price_...`) to your `.env.local`

**Why?** In Stripe:
- A **Product** = What you sell (e.g., "AllyFix Pro")
- A **Price** = How much it costs (e.g., "$15/month")

Our code needs the Price ID to know how much to charge!

### Checkout Session Creation Fails

- Verify `STRIPE_SECRET_KEY` is correct
- Check that `STRIPE_PRICE_ID` exists in your Stripe account (not Product ID!)
- Ensure user exists in your database before creating checkout
- Make sure you're using a Price ID that starts with `price_`, not `prod_`

### Webhook Not Working

- Make sure `stripe listen` is running for local development
- Check that `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen`
- Verify webhook endpoint is accessible: `/api/webhooks/stripe`

### Subscription Not Updating

- Check webhook logs in Stripe Dashboard: **Developers** → **Webhooks** → **Recent events**
- Verify database update query in webhook handler
- Check Supabase logs for errors

## ✅ Next Steps

After Stripe is set up:
1. Implement authentication (Supabase Auth)
2. Build user dashboard with subscription status
3. Add "Upgrade" buttons that call `/api/checkout`
4. Add "Manage Subscription" button that calls `/api/portal`
5. Test end-to-end flow with real users

