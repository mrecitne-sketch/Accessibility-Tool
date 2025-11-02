# Dashboard Testing Checklist

Before moving on to the next MVP features, please test the following functionality:

## ✅ Authentication & Access

### Login/Signup Flow
- [ ] **Magic Link Signup**: Request a new account via magic link
  - [ ] Email is received with magic link
  - [ ] Clicking link redirects to `/dashboard`
  - [ ] User is successfully authenticated
  - [ ] Session persists on page refresh

- [ ] **Magic Link Sign-in**: Sign in with existing account
  - [ ] Email is received with magic link
  - [ ] Clicking link redirects to `/dashboard`
  - [ ] User is successfully authenticated

- [ ] **Protected Routes**: Try accessing dashboard without authentication
  - [ ] `/dashboard` redirects to home page with redirect param
  - [ ] After login, user is redirected to `/dashboard`

- [ ] **Session Persistence**: 
  - [ ] Refresh dashboard page - user stays logged in
  - [ ] Close browser and reopen - session persists
  - [ ] Sign out works correctly

---

## 📊 Dashboard Display

### Stats Overview Cards
- [ ] **Subscription Tier Display**:
  - [ ] Free tier shows "Free" badge
  - [ ] Pro tier shows "Pro" badge with crown icon
  - [ ] Unlimited indicator appears for Pro users

- [ ] **Scans This Month**:
  - [ ] Displays correct count (e.g., "2 / 3" for free users)
  - [ ] Shows "Unlimited" for Pro users
  - [ ] Count matches actual scans used

- [ ] **Total Scans**:
  - [ ] Displays total scan count correctly
  - [ ] Updates after new scans

### Recent Scans Table
- [ ] **Empty State**: 
  - [ ] Shows friendly message when no scans exist
  - [ ] "Start Your First Scan" button links to home page

- [ ] **With Scans**:
  - [ ] Table displays all recent scans (up to 10)
  - [ ] URL is truncated properly (doesn't overflow)
  - [ ] Date shows in relative format (e.g., "2 hours ago")
  - [ ] Score displays with correct color:
    - Green for 90+
    - Yellow for 70-89
    - Red for <70
  - [ ] WCAG level badge shows correctly (A/AA/AAA/Fail)
  - [ ] Status indicator shows correct icon:
    - ✅ CheckCircle for completed
    - ❌ XCircle for failed
    - ⏰ Clock for pending
  - [ ] "View Results" link works and goes to `/scan/{id}`

- [ ] **Mobile View**:
  - [ ] Table switches to card layout on mobile
  - [ ] All information is readable and accessible
  - [ ] No horizontal scrolling issues

### Usage Card
- [ ] **Free Tier**:
  - [ ] Shows scans remaining (e.g., "1 of 3")
  - [ ] Progress bar shows correct percentage
  - [ ] Warning appears when 1 scan remaining
  - [ ] Error message when limit reached
  - [ ] Upgrade prompt is visible

- [ ] **Pro Tier**:
  - [ ] Shows "Unlimited" message
  - [ ] Progress bar is green and full
  - [ ] No limit warnings shown

### Quick Actions
- [ ] **New Scan Button**:
  - [ ] Button is prominent and visible
  - [ ] Links to home page (`/`)
  - [ ] Hover state works correctly

- [ ] **Upgrade Button** (Free Users):
  - [ ] Yellow button visible for free users
  - [ ] Clicking opens Stripe checkout
  - [ ] Loading state shows during API call

- [ ] **Manage Subscription Button** (Pro Users):
  - [ ] Button visible for Pro users
  - [ ] Clicking opens Stripe Customer Portal
  - [ ] Loading state shows during API call

### Subscription Card
- [ ] **Free Tier**:
  - [ ] Shows "Free Plan" with "3 scans per month"
  - [ ] Upgrade prompt card is visible
  - [ ] Benefits are clear

- [ ] **Pro Tier**:
  - [ ] Shows "Pro Plan" with "$15/month"
  - [ ] Crown icon and "Pro" badge visible
  - [ ] Pro benefits list shows:
    - ✅ Unlimited scans
    - ✅ Priority support
    - ✅ PDF reports (coming soon)
  - [ ] "Manage Subscription" button works

---

## 🔄 Data Integration

### User Data
- [ ] **New User Creation**:
  - [ ] First-time login creates user record
  - [ ] User record has correct defaults:
    - `subscription_tier: 'free'`
    - `scans_used_this_month: 0`
    - Email matches auth email

- [ ] **Existing User**:
  - [ ] Existing user data loads correctly
  - [ ] No duplicate user creation

### Scan Data
- [ ] **Scan History**:
  - [ ] Recent scans are fetched correctly
  - [ ] Scans are ordered by `created_at DESC`
  - [ ] Only shows user's own scans (RLS working)
  - [ ] Limit of 10 scans enforced

- [ ] **Empty Scans**:
  - [ ] Dashboard works fine with no scan history
  - [ ] No errors when scans table is empty

---

## 💳 Stripe Integration

### Checkout Flow
- [ ] **Upgrade to Pro**:
  - [ ] Clicking "Upgrade to Pro" creates Stripe checkout session
  - [ ] Redirects to Stripe checkout page
  - [ ] After successful payment, user is redirected back
  - [ ] User tier updates to "pro" (check Supabase dashboard)
  - [ ] Dashboard refreshes to show Pro features

- [ ] **Manage Subscription**:
  - [ ] Clicking "Manage Subscription" opens Stripe portal
  - [ ] User can cancel subscription
  - [ ] After cancellation, user tier updates to "free" (via webhook)
  - [ ] Dashboard reflects free tier limits

### Error Handling
- [ ] **Checkout Errors**:
  - [ ] Error message appears if checkout fails
  - [ ] User is not redirected if API call fails
  - [ ] Loading state clears on error

- [ ] **Portal Errors**:
  - [ ] Error message appears if portal fails
  - [ ] Helpful error message for missing Stripe customer

---

## 📱 Responsive Design

### Desktop (1024px+)
- [ ] **Layout**:
  - [ ] Three-column grid displays correctly
  - [ ] Stats cards in row layout
  - [ ] Recent scans table is full width in left column
  - [ ] Sidebar cards stack vertically on right

### Tablet (768px - 1023px)
- [ ] **Layout**:
  - [ ] Stats cards remain in row
  - [ ] Main content and sidebar stack or adjust
  - [ ] Table remains readable

### Mobile (< 768px)
- [ ] **Layout**:
  - [ ] Stats cards stack vertically
  - [ ] Single column layout
  - [ ] Recent scans switch to card view
  - [ ] All buttons are easily tappable (44px+ touch targets)
  - [ ] No horizontal scrolling
  - [ ] Text is readable without zooming

---

## 🐛 Edge Cases & Error Handling

### Empty States
- [ ] **No Scans**: Dashboard displays correctly with empty scan history
- [ ] **No User Data**: Handles gracefully if user data fails to load
- [ ] **Auth Error**: Shows appropriate error if authentication fails

### Loading States
- [ ] **Initial Load**: No flash of incorrect data
- [ ] **API Calls**: Loading states show during Stripe API calls
- [ ] **Button Disabled**: Buttons disable during async operations

### Error Messages
- [ ] **Auth Errors**: Clear error message displayed
- [ ] **Database Errors**: User-friendly error messages
- [ ] **API Errors**: Helpful error messages for failed API calls
- [ ] **Network Errors**: Appropriate handling for network failures

### Data Validation
- [ ] **Missing Email**: Handles null/undefined email gracefully
- [ ] **Invalid Scan Data**: Handles malformed scan records
- [ ] **Null Values**: Dashboard doesn't crash on null values

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
- [ ] **User Isolation**:
  - [ ] Users can only see their own scans
  - [ ] Users can only see their own user data
  - [ ] Cannot access other users' data via direct API calls

### Authentication
- [ ] **Session Validation**:
  - [ ] Middleware correctly validates sessions
  - [ ] Expired sessions redirect to login
  - [ ] Invalid tokens are rejected

---

## 🎨 UI/UX Polish

### Visual Design
- [ ] **Consistent Styling**: Matches existing design system
- [ ] **Dark Mode**: All components support dark mode
- [ ] **Colors**: Color coding is consistent (green/yellow/red for scores)
- [ ] **Icons**: Icons are visible and properly sized
- [ ] **Spacing**: Proper spacing between elements

### Accessibility
- [ ] **Keyboard Navigation**: All interactive elements are keyboard accessible
- [ ] **Focus States**: Visible focus indicators
- [ ] **ARIA Labels**: Screen reader friendly
- [ ] **Color Contrast**: Text meets WCAG contrast requirements

### Performance
- [ ] **Load Time**: Dashboard loads quickly (< 2 seconds)
- [ ] **No Layout Shift**: Smooth page load without jumping
- [ ] **Smooth Transitions**: Hover/transition effects are smooth

---

## 📝 Next Steps After Testing

Once all tests pass:

1. **Document any bugs found** in this checklist
2. **Fix critical issues** before moving forward
3. **Note any UX improvements** for future iteration
4. **Verify data accuracy** - ensure all counts match database
5. **Test in production** if possible (or staging environment)

---

## 🚀 Ready to Move Forward When:

- ✅ All authentication flows work reliably
- ✅ Dashboard displays data correctly for both free and pro users
- ✅ Stripe integration works (checkout and portal)
- ✅ Mobile experience is smooth
- ✅ Error handling is graceful
- ✅ No console errors in browser
- ✅ RLS policies are properly enforced

---

## 📋 Quick Test Scenarios

### Scenario 1: New Free User Journey
1. Sign up with new email → Receive magic link
2. Click magic link → Redirected to dashboard
3. See empty state for scans
4. See "0 / 3" scans remaining
5. Click "New Scan" → Go to home page
6. Run a scan → See scan appear in dashboard
7. See "1 / 3" scans remaining

### Scenario 2: Existing Pro User Journey
1. Sign in with Pro account
2. See "Pro" badge and "Unlimited" scans
3. See scan history
4. Click "Manage Subscription" → Opens Stripe portal
5. Verify can cancel subscription

### Scenario 3: Upgrade Flow
1. Sign in as free user
2. Click "Upgrade to Pro"
3. Complete Stripe checkout
4. Redirect back to dashboard
5. See Pro features activated
6. Verify unlimited scans available

---

**Test Date**: _______________  
**Tester**: _______________  
**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete  
**Notes**: _______________________________________________

