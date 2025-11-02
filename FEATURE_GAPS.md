# AllyFix - Feature Gap Analysis

**Last Updated**: November 1, 2025  
**Comparison Target**: YourWebsiteScore.com  
**Purpose**: Document competitive feature gaps for future roadmap consideration

---

## 📊 Overview

This document outlines feature gaps between AllyFix and competitor YourWebsiteScore.com. These features are documented separately from the current MVP plan and can be considered for future development phases.

**Note**: Not all features from YourWebsiteScore are necessary for AllyFix, as our focus is accessibility (not general website health). However, many patterns could enhance user experience and retention.

---

## 🔴 High Priority Features

### 1. Automated Monitoring & Scheduled Scans

**What YourWebsiteScore Offers:**
- Daily automated scans for monitored domains
- Scheduled scans (daily/weekly/monthly)
- Continuous monitoring without manual intervention

**Current AllyFix Status:**
- ❌ Manual scans only
- ✅ One-time scan functionality working

**Impact:** ⭐⭐⭐⭐⭐ **Very High**
- Drives repeat usage and engagement
- Critical for retention
- Shows clear value proposition (ongoing monitoring vs one-time check)

**Implementation Considerations:**
- Background job system (cron jobs or queue system)
- Scheduled scan endpoint
- Database tracking for scheduled scans
- Handling scan failures and retries
- Resource management (Puppeteer instances)
- Cost considerations (Pro feature?)

**Estimated Time:** 8-12 hours

---

### 2. Historical Trends & Visualization

**What YourWebsiteScore Offers:**
- Score history table with dates
- Visual trend charts showing improvement over time
- Historical comparison (last scan vs current)
- Timeline showing when issues were fixed

**Current AllyFix Status:**
- ⏳ Scan history planned but not implemented
- ❌ No trend visualization
- ❌ No historical comparison

**Impact:** ⭐⭐⭐⭐⭐ **Very High**
- Shows clear value (see your improvements)
- Useful for client reports
- Helps track compliance over time

**Implementation Considerations:**
- Chart library (Recharts, Chart.js, or similar)
- Score trend line graphs
- Violation count over time charts
- Accessibility level progression visualization
- Historical scan comparison view
- Date range filters

**Estimated Time:** 6-8 hours

---

### 3. Email Notifications & Alerts

**What YourWebsiteScore Offers:**
- Email alerts when scores change significantly
- Critical issue notifications
- Weekly/monthly digest emails
- Score drop alerts

**Current AllyFix Status:**
- ❌ No notification system
- ❌ No email functionality

**Impact:** ⭐⭐⭐⭐ **High**
- Keeps users engaged without active site visits
- Critical for monitoring feature
- Improves retention

**Implementation Considerations:**
- Email service (Resend, SendGrid, Postmark, etc.)
- Email templates for different notification types
- User preferences (email frequency, alert thresholds)
- Digest emails (weekly/monthly summaries)
- Critical alert emails (immediate notifications)
- Unsubscribe handling

**Estimated Time:** 6-8 hours

---

### 4. Change Detection & Alerts

**What YourWebsiteScore Offers:**
- Automatic comparison between scans
- Alerts when new issues appear
- Alerts when issues are fixed
- Score change notifications

**Current AllyFix Status:**
- ❌ No change tracking
- ❌ No before/after comparisons

**Impact:** ⭐⭐⭐⭐ **High**
- Helps users catch regressions quickly
- Shows positive changes
- Validates improvements

**Implementation Considerations:**
- Compare two scan results
- Detect new violations
- Detect fixed violations
- Score change calculations
- Violation severity changes
- Visual diff view

**Estimated Time:** 4-6 hours

---

## 🟡 Medium Priority Features

### 5. Embedded Badges/Widgets

**What YourWebsiteScore Offers:**
- Live badges showing current score
- Embeddable on websites
- Auto-updating scores
- Multiple badge styles

**Current AllyFix Status:**
- ❌ Not currently planned

**Impact:** ⭐⭐⭐ **Medium-High**
- Social proof and trust signals
- Free marketing (badges on sites drive traffic)
- Visibility boost
- Professional credibility

**Implementation Considerations:**
- Lightweight badge component (<1KB)
- Embeddable iframe or script tag
- Auto-updates from API
- Multiple badge styles/designs
- Customizable colors
- Badge API endpoint for scores
- CDN for badge delivery

**Estimated Time:** 6-8 hours

---

### 6. Public Certified Pages

**What YourWebsiteScore Offers:**
- Public report pages (`yourwebsitescore.com/certified/domain.com`)
- Shareable URLs
- SEO benefits (dofollow backlinks)
- Showcase accessibility compliance

**Current AllyFix Status:**
- ❌ Private scan results only
- ✅ PDF export planned

**Impact:** ⭐⭐⭐ **Medium**
- SEO value (backlinks)
- Showcase compliance
- Shareable reports
- Professional credibility

**Implementation Considerations:**
- Public routes: `/certified/[domain]` or `/public/[scan-id]`
- SEO-friendly pages with meta tags
- Shareable social media cards
- Optional dofollow backlinks
- Privacy controls (opt-in public pages)
- Branded report pages

**Estimated Time:** 4-6 hours

---

### 7. Multi-Domain Management

**What YourWebsiteScore Offers:**
- Manage multiple domains per account
- Separate monitoring per domain
- Domain-specific dashboards
- Bulk operations

**Current AllyFix Status:**
- ❌ Single-domain scanning only
- ❌ No domain management

**Impact:** ⭐⭐⭐ **Medium**
- Important for agencies
- Better for multi-site developers
- Scales better for power users

**Implementation Considerations:**
- Domain management UI
- Domain-specific dashboards
- Domain grouping/organization
- Bulk scan operations
- Domain aliases/subdomains
- Domain settings per domain

**Estimated Time:** 8-10 hours

---

### 8. Advanced Reporting Features

**What YourWebsiteScore Offers:**
- Executive summaries
- Issue categorization by severity
- Fix priority recommendations
- Detailed breakdowns

**Current AllyFix Status:**
- ✅ Basic violation lists
- ⏳ PDF export planned
- ❌ No executive summaries
- ❌ No prioritization

**Implementation Considerations:**
- Executive summary generation
- Issue severity categorization
- Fix priority recommendations
- Compliance roadmap suggestions
- Violation grouping by type
- Export formats (CSV, JSON, PDF)
- Report templates

**Estimated Time:** 6-8 hours

---

## 🟢 Low Priority Features

### 9. Leaderboard/Social Proof

**What YourWebsiteScore Offers:**
- Public leaderboard of top-performing sites
- Rankings by score
- Industry/category filters
- Social proof ("Trusted by 350+ developers")

**Current AllyFix Status:**
- ❌ No social features
- ❌ No public rankings

**Impact:** ⭐⭐ **Low-Medium**
- Gamification can drive engagement
- Social proof helps trust
- May not fit accessibility-focused brand

**Implementation Considerations:**
- Leaderboard page
- Rankings by accessibility score
- Opt-in participation
- Filter by industry/type
- Privacy controls
- Anonymous leaderboard option

**Estimated Time:** 4-6 hours

---

### 10. SEO Features (Dofollow Backlinks)

**What YourWebsiteScore Offers:**
- Dofollow backlinks from certified pages
- SEO value proposition
- Backlink quality assurance

**Current AllyFix Status:**
- ❌ Not planned
- ❌ No SEO features

**Impact:** ⭐⭐ **Low-Medium**
- SEO benefit for users
- May not be core to accessibility mission
- Can be add-on feature

**Implementation Considerations:**
- Optional dofollow backlinks on certified pages
- Backlink quality controls
- Link placement optimization
- SEO value messaging

**Estimated Time:** 2-3 hours (if certified pages exist)

---

## 📋 Quick Wins (High Impact, Low Effort)

### 1. Trend Visualization ⭐⭐⭐⭐⭐
**Time:** 2-3 hours  
**Impact:** Very High  
**Effort:** Low-Medium

- Add chart library (Recharts)
- Show score over time in history
- Huge visual impact
- Easy to implement

---

### 2. Email Notifications ⭐⭐⭐⭐
**Time:** 3-4 hours  
**Impact:** High  
**Effort:** Low

- Use Resend/SendGrid
- Weekly digest emails
- Immediate retention impact
- Relatively straightforward

---

### 3. Change Detection ⭐⭐⭐⭐
**Time:** 2 hours  
**Impact:** High  
**Effort:** Low

- Compare previous vs current scan
- Highlight new/fixed violations
- Shows clear value
- Can reuse existing data

---

## 🎯 Recommended Priority Order

### Phase 1: Foundation (Post-MVP)
1. **Historical Trends & Visualization** (6-8 hours)
   - Build on scan history feature
   - High visual impact
   - Shows clear value

2. **Change Detection** (2-4 hours)
   - Quick to implement
   - High user value
   - Works with existing scans

3. **Email Notifications** (6-8 hours)
   - Weekly digest emails
   - Critical for retention
   - Foundation for monitoring

### Phase 2: Engagement (Retention)
4. **Automated Monitoring** (8-12 hours)
   - Daily/weekly scans
   - Pro feature candidate
   - Drives repeat usage

5. **Email Alerts** (4-6 hours)
   - Score drop notifications
   - Critical issue alerts
   - Build on notification foundation

6. **Embedded Badges** (6-8 hours)
   - Social proof
   - Free marketing
   - Visibility boost

### Phase 3: Advanced Features
7. **Public Certified Pages** (4-6 hours)
   - SEO value
   - Shareable reports
   - Professional credibility

8. **Multi-Domain Management** (8-10 hours)
   - Agency-friendly
   - Scales for power users
   - Better organization

9. **Advanced Reporting** (6-8 hours)
   - Executive summaries
   - Prioritization
   - Better insights

### Phase 4: Nice-to-Have
10. **Leaderboard** (4-6 hours)
    - Gamification
    - Social proof
    - Optional feature

11. **SEO Backlinks** (2-3 hours)
    - If certified pages exist
    - SEO value
    - Low effort

---

## 📊 Feature Comparison Matrix

| Feature | YourWebsiteScore | AllyFix Status | Priority | Effort | Impact |
|---------|------------------|----------------|----------|--------|--------|
| **Automated Monitoring** | ✅ Daily scans | ❌ Manual only | 🔴 High | High | ⭐⭐⭐⭐⭐ |
| **Historical Trends** | ✅ Charts & timeline | ⏳ Planned | 🔴 High | Medium | ⭐⭐⭐⭐⭐ |
| **Email Notifications** | ✅ Alerts & digests | ❌ None | 🔴 High | Medium | ⭐⭐⭐⭐ |
| **Change Detection** | ✅ Auto comparison | ❌ None | 🔴 High | Low | ⭐⭐⭐⭐ |
| **Embedded Badges** | ✅ Live badges | ❌ None | 🟡 Medium | Medium | ⭐⭐⭐ |
| **Public Certified Pages** | ✅ Shareable pages | ❌ Private only | 🟡 Medium | Medium | ⭐⭐⭐ |
| **Multi-Domain Management** | ✅ Multiple domains | ❌ Single only | 🟡 Medium | High | ⭐⭐⭐ |
| **Advanced Reporting** | ✅ Executive summaries | ⏳ PDF planned | 🟡 Medium | Medium | ⭐⭐⭐ |
| **Leaderboard** | ✅ Rankings | ❌ None | 🟢 Low | Medium | ⭐⭐ |
| **SEO Backlinks** | ✅ Dofollow links | ❌ None | 🟢 Low | Low | ⭐⭐ |

---

## 💡 Strategic Considerations

### Features That DON'T Fit AllyFix's Mission

Some YourWebsiteScore features don't align with accessibility focus:
- **Performance metrics** (PageSpeed) - Not core to accessibility
- **Security checks** - Important but separate concern
- **General website quality** - Too broad for specialized tool

### Features That ENHANCE AllyFix's Mission

These features align perfectly with accessibility focus:
- ✅ Automated monitoring (catch regressions)
- ✅ Historical trends (show improvement)
- ✅ Email alerts (stay compliant)
- ✅ Change detection (track fixes)
- ✅ Badges (showcase compliance)
- ✅ Certified pages (compliance proof)

---

## 🚀 Next Steps

1. **Complete current MVP** (Phases 4-7 in PROJECT_TRACKER.md)
2. **Evaluate user feedback** after launch
3. **Prioritize feature gaps** based on user needs
4. **Implement Quick Wins** first (trends, notifications)
5. **Build monitoring foundation** for long-term engagement

---

## 📝 Notes

- These features are documented for **future consideration**, not current MVP
- Priority order may change based on user feedback
- Not all features need to be implemented
- Focus should remain on **accessibility specialization** vs general website health
- Many features can be **Pro tier** upgrades to justify subscription

---

**Last Analysis Date**: November 1, 2025  
**Comparison Source**: https://yourwebsitescore.com  
**Status**: Documented for future roadmap planning

