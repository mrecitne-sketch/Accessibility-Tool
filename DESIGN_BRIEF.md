# AllyFix - Design Consultant Brief

**Project Name**: AllyFix  
**Type**: Web Accessibility Auditing SaaS Platform  
**Status**: ~50% Complete (MVP in progress)  
**Date**: November 2025

---

## 🎯 Project Overview

**AllyFix** is a fast, affordable web accessibility auditor for indie developers and small teams. The platform allows users to scan any public website URL, receive WCAG compliance scores, and get exact code fixes they can copy-paste into their projects.

### Core Value Proposition
- ⚡ **Fast**: Get compliance scores in under 30 seconds
- 🔧 **Actionable**: Exact before/after code fixes (not just reports)
- 📊 **Compliant**: Ensure sites meet WCAG A, AA, or AAA standards
- 💰 **Affordable**: $15/month for unlimited scans vs. expensive enterprise tools

### Target Audience
- **Primary**: Indie developers and small development teams
- **Secondary**: Freelancers, small agencies, designers working on client sites
- **User Persona**: Developers who need quick accessibility checks but can't afford enterprise tools

---

## 🎨 Current Design System

### Tech Stack
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Design Philosophy**: Clean, modern, developer-focused

### Existing Design Patterns
1. **Navigation Bar** (`components/nav.tsx`)
   - Clean, minimal design
   - Shows user email when logged in
   - Sign In / Sign Out buttons
   - Logo + brand name

2. **Landing Page** (`app/page.tsx`)
   - Hero section with value proposition
   - Features section
   - Pricing section
   - Call-to-action buttons

3. **Scan Results Page** (`app/scan/[id]/page.tsx`)
   - Compliance score display (circular gauge)
   - Violation list grouped by severity
   - Code diff components showing before/after fixes
   - WCAG level indicator

### Color Scheme
- Primary: Blue (likely `blue-600`, `blue-700` based on Tailwind usage)
- Background: White/dark mode support
- Status Colors: Green (success), Red (errors), Yellow/Orange (warnings)

### Typography
- Using Geist Sans and Geist Mono fonts
- Clean, readable, developer-friendly

---

## 🚀 Current Status & Completed Features

### ✅ What's Built & Working
1. **Core Scanning Engine**
   - URL input form
   - Scanning functionality (5-10 second scans)
   - Compliance score calculation (0-100)
   - WCAG level determination (A/AA/AAA/Fail)

2. **Fix Generation System**
   - 7 types of accessibility fix rules
   - Before/after code snippets
   - Copy-to-clipboard functionality

3. **Authentication System**
   - Magic link email authentication
   - Sign in/sign up modal
   - Protected routes

4. **Payment Infrastructure**
   - Stripe checkout integration
   - Subscription management APIs
   - Webhook handling

5. **Database**
   - User accounts with subscription tiers
   - Scan history storage
   - Quota tracking

### ⏳ What's Next (Needs Design)
1. **User Dashboard** (Priority #1 - Next to build)
2. **PDF Export Feature**
3. **Mobile optimization polish**

---

## 📋 Design Requirements: User Dashboard

This is the **primary focus** for design assistance. The dashboard needs to be designed before development begins.

### Dashboard Purpose
- Show user's scan history
- Display usage statistics (scans used vs. remaining)
- Provide quick access to previous scan results
- Show subscription status and upgrade prompts
- Enable new scan creation

### Required Dashboard Sections

#### 1. **Header / Stats Overview**
**Purpose**: Quick glance at user's account status

**Content Needed**:
- Subscription tier indicator (Free / Pro badge)
- Scans used this month (e.g., "2 of 3 scans" for free users)
- Unlimited indicator for Pro users
- Upgrade CTA button (if free tier)

**Design Considerations**:
- Visual distinction between Free and Pro tiers
- Progress bar or visual indicator for scan usage
- Clear, prominent upgrade button for free users

---

#### 2. **Recent Scans Table/List**
**Purpose**: Show user's scan history

**Required Information Per Scan**:
- URL scanned
- Date/time of scan
- Compliance score (0-100)
- WCAG level (A/AA/AAA/Fail badge)
- Status (completed/failed)
- Quick action: "View Results" button

**Design Requirements**:
- Sortable columns (by date, score, URL)
- Responsive table (mobile-friendly)
- Visual score indicators (color coding?)
- Link to full scan results page

**Data Available**:
- Scan ID
- URL
- Score (integer 0-100)
- Level (A/AA/AAA/fail)
- Created timestamp
- Status (pending/completed/failed)

---

#### 3. **Usage Statistics Card**
**Purpose**: Show scan usage trends

**Content**:
- Current month scans used
- Scans remaining (for free tier)
- Monthly limit indicator
- Optionally: Visual chart showing usage over time

**Design Considerations**:
- Progress visualization (bar, donut chart?)
- Clear messaging about limits
- Friendly reminder when approaching limit

---

#### 4. **Quick Actions Section**
**Purpose**: Enable common tasks

**Actions Needed**:
- "New Scan" button (prominent, primary action)
- "Upgrade to Pro" button (if free tier)
- "Manage Subscription" link (if Pro tier)

**Design Considerations**:
- Clear hierarchy (New Scan should be most prominent)
- Secondary actions appropriately styled

---

#### 5. **Subscription Management Section**
**Purpose**: Show billing info and subscription controls

**Content**:
- Current subscription tier
- Next billing date (for Pro users)
- Billing amount
- "Manage Subscription" button (opens Stripe Customer Portal)
- Upgrade/downgrade options

**Design Requirements**:
- Clear subscription status
- Easy access to billing management
- Visual distinction for Pro benefits

---

### Dashboard Layout Options

**Option A: Single Page Dashboard**
- All sections on one scrollable page
- Header stats at top
- Recent scans table as main content
- Sidebar or bottom section for actions/subscription

**Option B: Tabbed Dashboard**
- Tabs: Overview, Scans, Settings
- Overview: Stats + recent scans summary
- Scans: Full scan history table
- Settings: Subscription management

**Option C: Card-Based Layout**
- Stats cards at top
- Scan history as main card
- Action cards on the side

### Design Constraints

1. **Existing Patterns**: Should match current design language
   - Same color scheme (blue primary)
   - Consistent typography (Geist Sans)
   - Similar component styles

2. **Responsive Design**: Must work on mobile
   - Table should adapt to mobile view
   - Stats cards should stack vertically
   - Touch-friendly buttons

3. **Accessibility**: Dashboard itself must be accessible
   - Proper heading hierarchy
   - Keyboard navigation
   - Screen reader friendly
   - WCAG AA compliant

4. **Technical Constraints**:
   - Built with Tailwind CSS
   - React components (Next.js)
   - Server-side data fetching
   - Real-time data updates (when user completes new scan)

---

## 🎨 Design Deliverables Needed

### 1. Dashboard Mockups/Wireframes
- Desktop layout (1440px+)
- Tablet layout (768px - 1024px)
- Mobile layout (375px - 767px)

### 2. Component Specifications
- Scan history table design
- Stats cards design
- Subscription status indicator
- Usage progress indicator
- Button styles (for actions)

### 3. Design System Updates
- Color palette expansion (if needed)
- Typography scales for dashboard
- Spacing system
- Icon usage (lucide-react icon library)

### 4. User Flow Diagrams
- How users navigate to dashboard
- Flow from dashboard to scan results
- Flow from dashboard to new scan
- Upgrade flow from dashboard

---

## 📊 Data Model Overview

### User Information Available
```typescript
{
  id: UUID
  email: string
  subscription_tier: "free" | "pro"
  scans_used_this_month: number (0-3 for free, unlimited for pro)
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: timestamp
}
```

### Scan Information Available
```typescript
{
  id: UUID
  user_id: UUID
  url: string
  status: "pending" | "completed" | "failed"
  score: number (0-100)
  level: "A" | "AA" | "AAA" | "fail"
  violations_data: JSONB (array of violations)
  created_at: timestamp
  expires_at?: timestamp (for anonymous scans)
}
```

### Quota Limits
- **Free Tier**: 3 scans per month
- **Pro Tier**: Unlimited scans
- Monthly reset (first of month)

---

## 🔄 User Flows to Consider

### Flow 1: Returning User
1. User signs in → Redirected to dashboard
2. Dashboard shows recent scans + usage stats
3. User clicks "New Scan" → Goes to landing page or scan form
4. User clicks "View Results" on old scan → Goes to scan results page

### Flow 2: Free User Approaching Limit
1. Free user has used 2/3 scans
2. Dashboard shows: "1 scan remaining this month"
3. Visual indicator (progress bar, warning color?)
4. Prominent "Upgrade to Pro" CTA

### Flow 3: Upgrade Flow
1. Free user clicks "Upgrade to Pro"
2. Redirect to Stripe Checkout
3. After payment → Webhook updates account
4. Dashboard refreshes showing Pro status

### Flow 4: Pro User Management
1. Pro user sees "Unlimited" scans indicator
2. Can access "Manage Subscription" link
3. Opens Stripe Customer Portal (cancel, update payment, etc.)

---

## 🎯 Design Priorities

### Must-Have (P0)
1. ✅ Clear scan history display
2. ✅ Usage statistics visibility
3. ✅ Subscription status indicator
4. ✅ "New Scan" primary action
5. ✅ Mobile responsive design

### Should-Have (P1)
1. Visual scan usage progress
2. Quick filters/search for scans
3. Sortable scan table
4. Subscription management access

### Nice-to-Have (P2)
1. Scan trends/charts (future feature)
2. Scan comparison view (future feature)
3. Export scan history (future feature)

---

## 🖼️ Visual References

### Existing Components to Match
- **Compliance Score Display**: Circular progress indicator (`components/compliance-score.tsx`)
- **Code Diff Component**: Before/after code blocks (`components/code-diff.tsx`)
- **Navigation**: Minimal, clean navigation bar (`components/nav.tsx`)

### Design Inspiration Areas
- **Developer Tools**: GitHub, Vercel, Netlify dashboards
- **SaaS Dashboards**: Stripe Dashboard, Linear, Notion
- **Analytics Tools**: Simple, data-focused layouts

---

## 🚨 Special Considerations

### 1. **Empty State**
- What does dashboard look like when user has no scans yet?
- First-time user experience
- Helpful onboarding message?

### 2. **Error States**
- What if scan failed?
- What if database query fails?
- How to show loading states?

### 3. **Accessibility**
- Dashboard must be accessible itself
- Proper ARIA labels
- Keyboard navigation
- Screen reader friendly
- Color contrast compliance

### 4. **Performance**
- Large scan lists need pagination
- Lazy loading for scan history
- Efficient data fetching

---

## 📱 Mobile Design Considerations

Dashboard must work seamlessly on mobile:
- Scan table becomes card list or stack
- Stats cards stack vertically
- Touch targets at least 44x44px
- Swipeable actions?
- Bottom navigation for mobile?

---

## 🎨 Brand Guidelines

### Current Brand Identity
- **Name**: AllyFix (accessibility + fix)
- **Tone**: Professional but approachable
- **Audience**: Developers (technical, practical)
- **Color**: Blue primary (trust, technology)
- **Style**: Clean, minimal, functional

### Design Language
- **Avoid**: Overly decorative, marketing-heavy designs
- **Prefer**: Clean data visualization, functional layouts
- **Think**: Developer tools, not consumer apps

---

## 📋 Next Steps for Design Consultant

1. **Review existing design patterns** in codebase
   - Look at `components/` folder
   - Review `app/page.tsx` (landing page)
   - Review `app/scan/[id]/page.tsx` (results page)

2. **Create dashboard mockups**
   - Start with desktop layout
   - Create mobile responsive version
   - Consider different states (empty, loading, error)

3. **Design component specifications**
   - Scan history table/cards
   - Stats cards
   - Subscription indicator
   - Usage progress indicator

4. **Provide design system updates**
   - Any new colors needed?
   - Typography scales for dashboard
   - Spacing system
   - Component library additions

5. **Create user flow diagrams**
   - Dashboard navigation flows
   - Interaction patterns
   - State transitions

---

## 📞 Questions for Design Consultant

Please consider and provide guidance on:

1. **Layout Preference**: Single-page scroll vs. tabbed interface?
2. **Scan Display**: Table vs. cards vs. list for scan history?
3. **Stats Visualization**: Progress bars, donut charts, or simple numbers?
4. **Mobile Strategy**: Bottom nav, hamburger menu, or adapted layout?
5. **Empty States**: How to welcome first-time users?
6. **Upgrade CTA**: How prominent should upgrade prompts be?
7. **Color Coding**: How to visually distinguish scan statuses, tiers?
8. **Typography**: Dashboard-specific type scale or use existing?

---

## 🔗 Technical Context

### Framework Details
- **Next.js 14** with App Router
- **React Server Components** for data fetching
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Development Approach
- Dashboard page: `app/dashboard/page.tsx`
- Server-side data fetching (secure, fast)
- Client-side interactivity where needed
- Real-time updates possible (via refresh or polling)

### Integration Points
- Supabase database (user data, scan history)
- Stripe API (subscription status, billing)
- Existing scan results pages (navigation target)

---

## 📈 Future Enhancements (Not in Current Scope)

These features are planned for post-MVP but not needed for initial dashboard:

1. **Trend Visualization**: Charts showing score over time
2. **Change Detection**: Compare scans side-by-side
3. **Scheduled Scans**: Automated recurring scans
4. **Email Notifications**: Alerts and digests
5. **Multi-Domain Management**: Manage multiple websites

---

## ✨ Design Success Criteria

The dashboard design will be successful if:

1. ✅ Users can quickly see their scan history
2. ✅ Usage limits are immediately clear
3. ✅ Subscription status is obvious
4. ✅ "New Scan" action is prominent and easy
5. ✅ Design matches existing application style
6. ✅ Mobile experience is excellent
7. ✅ Dashboard itself is accessible (WCAG compliant)
8. ✅ Upgrade prompts are clear but not pushy

---

## 📚 Additional Resources

### Project Documentation
- `README.md` - Project overview
- `PROJECT_TRACKER.md` - Development progress
- `TOMORROW.md` - Current development plan
- `FEATURE_GAPS.md` - Future feature ideas

### Code Locations
- Components: `/components/`
- Pages: `/app/`
- Database schema: `/supabase/schema.sql`

---

**Contact**: For questions about technical constraints or data availability, please reference the codebase or ask the development team.

**Deliverable**: Dashboard mockups/wireframes in Figma, Sketch, or similar, with design specifications ready for implementation.

---

*This brief represents the current state of the project. Design should support the MVP goals while considering future scalability.*

