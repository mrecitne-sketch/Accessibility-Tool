# AllyFix - Tomorrow's Plan

## ✅ What's Done Today

### Core Infrastructure (100%)
- ✅ Next.js 14 with TypeScript & Tailwind setup
- ✅ All dependencies installed
- ✅ Supabase client & server utilities
- ✅ Database schema designed (SQL migration ready)
- ✅ Stripe client setup
- ✅ Quota management system

### Scanning Engine (100%)
- ✅ Puppeteer + axe-core integration
- ✅ URL validation & accessibility scanning
- ✅ Compliance score & WCAG level calculation
- ✅ Violation processing by impact

### Fix Generation (100%)
- ✅ Rule-based fix engine framework
- ✅ 7 fix generators:
  - color-contrast (with tinycolor2)
  - image-alt
  - label
  - heading-order
  - link-name
  - button-name
  - aria

### UI Components (100%)
- ✅ Landing page with hero, features, pricing
- ✅ Navigation bar
- ✅ Scan form
- ✅ Compliance score display
- ✅ Code diff component
- ✅ Scan results page (basic structure)

### API Endpoints (50%)
- ✅ `/api/scan` - Scan endpoint created
- ⏳ Needs testing with real Supabase/URLs

---

## 📋 Tomorrow's Priority Tasks

### High Priority (Get Working)

1. **Set up Supabase Project** (30 min)
   - Go to https://supabase.com
   - Create new project
   - Run SQL from `supabase/schema.sql`
   - Copy API keys to `.env.local`
   - Test database connection

2. **Test Scanning Flow** (1 hour)
   - Create `.env.local` with test values
   - Implement basic scan flow on landing page
   - Test with a real public URL (e.g., example.com)
   - Verify scan results display

3. **Stripe Setup** (30 min)
   - Create Stripe test account
   - Create Pro subscription product ($15/month)
   - Copy API keys to `.env.local`
   - Test API connection

### Medium Priority (Core Features)

4. **Auth Integration** (2 hours)
   - Implement Supabase Auth with magic links
   - Create auth callback route
   - Add middleware for protected routes
   - Build sign-in/sign-up modals

5. **Scan Results Page** (2 hours)
   - Display scan data properly
   - Show violations grouped by impact
   - Add expandable fix suggestions
   - Wire up CodeDiff component

6. **PDF Generation** (2 hours)
   - Build PDF document component with react-pdf
   - Create professional report layout
   - Add export button to results page
   - Test PDF download

### Lower Priority (Polish)

7. **Dashboard** (1 hour)
   - Scan history table
   - Usage stats
   - Upgrade prompts

8. **Stripe Integration** (2 hours)
   - Checkout flow
   - Webhook handlers
   - Subscription management

9. **Testing & Polish** (2 hours)
   - Error handling
   - Mobile responsiveness
   - Performance optimization

10. **Documentation** (1 hour)
    - Generate PRD.md
    - Create launch plan
    - Write setup guide

---

## 🔑 Critical Environment Variables

Add to `.env.local`:
```bash
# Supabase (get from project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (get from dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 How to Start Tomorrow

1. Navigate to project:
   ```bash
   cd /Users/kylethompson/Documents/GitHub/AllyFix
   ```

2. Start dev server:
   ```bash
   source "$HOME/.nvm/nvm.sh"
   npm run dev -- --webpack
   ```

3. View at: http://localhost:3000

4. Set up Supabase first, then test scanning

---

## 📝 Notes

- **Puppeteer**: Needs proper setup on production (currently works locally)
- **Build**: Use `--webpack` flag due to Next.js 16 Turbopack change
- **Type Safety**: All TypeScript types are defined in `types/scan.ts`
- **File Count**: ~1,281 lines of code already written today!

---

## 🎯 MVP Success Criteria

- [x] Project setup & dependencies
- [x] Core scanning engine
- [x] Fix generation system
- [x] Landing page
- [ ] Supabase integration & testing
- [ ] Auth flow working
- [ ] Real scan results displayed
- [ ] PDF export working
- [ ] Stripe checkout working
- [ ] Deployed to production

**Estimated time to MVP**: 6-8 hours of focused work

---

Good luck tomorrow! 🎉

