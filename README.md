# AllyFix - Web Accessibility Auditor

**Make your website accessible in minutes.** 

A fast, affordable web accessibility auditor for indie developers and small teams. Scan any public URL, get WCAG compliance scores, and receive exact code fixes you can copy-paste into your project.

Built with Next.js 14, TypeScript, Tailwind CSS, Puppeteer, axe-core, and intelligent rule-based fix generation.

---

## ✨ Features

- ⚡ **Lightning Fast Scans** - Get compliance scores in under 30 seconds
- 🔧 **Exact Code Fixes** - Before/after code snippets you can copy-paste
- 📊 **WCAG Compliant** - Ensure your site meets WCAG A, AA, or AAA standards
- 🎯 **7 Fix Rule Types** - Color contrast, alt text, labels, headings, links, buttons, ARIA
- 💾 **Anonymous Scans** - No account required to start scanning
- 📈 **Scan History** - Track your accessibility improvements (coming soon)
- 📄 **PDF Reports** - Export professional compliance reports (coming soon)

---

## 🚀 Current Status

**MVP Progress**: ~50% Complete (⬆️ +10% with Stripe!)  
**Core Scanning Flow**: ✅ Fully Working  
**Recurring Payments**: ✅ APIs Complete!

### What's Working Now:
- ✅ Full scan flow (URL input → scan → results)
- ✅ Puppeteer + axe-core accessibility testing
- ✅ Rule-based fix generation for 7 violation types
- ✅ Beautiful results page with compliance scores
- ✅ WCAG level determination (A/AA/AAA)
- ✅ Anonymous scans (no login required)
- ✅ Supabase database integration
- ✅ Stripe Checkout API for subscriptions
- ✅ Stripe Webhooks for subscription management
- ✅ Stripe Customer Portal integration

### Coming Soon:
- ⏳ User authentication (Supabase magic links)
- ⏳ User dashboard with scan history
- ⏳ PDF export functionality
- ⏳ Connect Stripe UI to dashboard

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Scanning**: Puppeteer + axe-core
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (coming soon)
- **Payments**: Stripe (✅ APIs ready, needs account setup)
- **PDF Generation**: react-pdf (coming soon)

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ (using nvm recommended)
- npm or yarn
- Supabase account (free tier works)
- Stripe account (for payments, optional for development)

### Installation

1. Clone the repository:
```bash
cd /Users/kylethompson/Documents/GitHub/AllyFix
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your keys:
- Supabase setup: [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)
- Stripe setup: [STRIPE_SETUP.md](./STRIPE_SETUP.md) (Test Mode available - no business info needed!)

4. Start the development server:
```bash
# Load nvm (if using it)
source "$HOME/.nvm/nvm.sh"

# Start dev server (use --webpack flag for compatibility)
npm run dev -- --webpack
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing the Scan Flow

1. Visit the landing page
2. Enter a public URL (e.g., `https://example.com`)
3. Click "Scan" and wait 5-10 seconds
4. View your compliance score and code fixes!

---

## 📁 Project Structure

```
AllyFix/
├── app/
│   ├── api/
│   │   ├── scan/route.ts           # Scan endpoint
│   │   └── scans/[id]/route.ts     # Fetch scan results
│   ├── scan/[id]/page.tsx          # Results page
│   └── page.tsx                    # Landing page
├── components/
│   ├── code-diff.tsx               # Before/after code display
│   ├── compliance-score.tsx        # Score gauge
│   ├── nav.tsx                     # Navigation
│   └── scan-form.tsx               # URL input form
├── lib/
│   ├── scanner.ts                  # Puppeteer + axe-core
│   ├── fix-engine.ts               # Fix generation orchestrator
│   ├── fix-rules/                  # Individual fix generators
│   │   ├── color-contrast.ts
│   │   ├── image-alt.ts
│   │   ├── label.ts
│   │   ├── heading-order.ts
│   │   ├── link-name.ts
│   │   ├── button-name.ts
│   │   └── aria.ts
│   ├── quota.ts                    # User quota management
│   ├── stripe.ts                   # Stripe client
│   └── supabase/
│       ├── client.ts               # Client-side Supabase
│       └── server.ts               # Server-side Supabase
├── supabase/
│   └── schema.sql                  # Database schema
└── types/
    └── scan.ts                     # TypeScript types
```

---

## 🗄️ Database Schema

### `users` table
- `id` - UUID (primary key)
- `email` - Text (unique)
- `subscription_tier` - Text (free/pro)
- `scans_used_this_month` - Integer
- `created_at` - Timestamp

### `scans` table
- `id` - UUID (primary key)
- `user_id` - UUID (foreign key, nullable for anonymous)
- `url` - Text
- `status` - Text (pending/completed/failed)
- `score` - Integer (0-100)
- `level` - Text (A/AA/AAA/fail)
- `violations_data` - JSONB
- `created_at` - Timestamp
- `expires_at` - Timestamp (for anonymous scans)

See [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) for setup instructions.

---

## 📊 Fix Generation Rules

AllyFix uses a rule-based engine to generate code fixes for common accessibility violations:

1. **Color Contrast** - Calculates and suggests WCAG-compliant colors
2. **Image Alt Text** - Suggests descriptive alt text based on context
3. **Form Labels** - Associates labels with form inputs
4. **Heading Order** - Fixes heading hierarchy (h1 → h2 → h3)
5. **Link Names** - Ensures links have descriptive text
6. **Button Names** - Ensures buttons have accessible names
7. **ARIA** - Fixes common ARIA attribute issues

---

## 🔐 Environment Variables

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (optional for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.local.example` for a template.

---

## 🧪 Testing

```bash
# Run development server
npm run dev -- --webpack

# Build for production
npm run build

# Start production server
npm start
```

---

## 🚢 Deployment

This project is designed to deploy on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

**Note**: Puppeteer may require additional configuration for Vercel. Consider using a serverless Puppeteer service or Vercel's built-in Chrome support.

---

## 📈 Roadmap

- [x] Core scanning engine
- [x] Landing page & results page
- [x] Rule-based fix generation
- [x] Supabase integration
- [ ] User authentication
- [ ] User dashboard
- [ ] PDF export
- [ ] Stripe integration
- [ ] Mobile optimization
- [ ] Production deployment

See [PROJECT_TRACKER.md](./PROJECT_TRACKER.md) for detailed progress.

---

## 🤝 Contributing

This is currently a solo project, but contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT License](LICENSE) (or specify your license)

---

## 🙏 Acknowledgments

- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing engine
- [Puppeteer](https://pptr.dev/) - Headless Chrome
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📧 Contact

Questions? Issues? Feel free to open a GitHub issue!

---

**Built with ❤️ for a more accessible web**
