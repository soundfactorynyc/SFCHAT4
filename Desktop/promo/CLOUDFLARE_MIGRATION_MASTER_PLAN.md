# SOUND FACTORY CLOUDFLARE MIGRATION - MASTER PLAN
**Date Created:** October 14, 2025
**Project:** Complete migration to Cloudflare with full promo tracking
**Critical:** ZERO downtime - live payment links MUST stay working

---

## TABLE OF CONTENTS
1. [Current State Analysis](#current-state-analysis)
2. [Complete Architecture Plan](#complete-architecture-plan)
3. [Folder Structure](#folder-structure)
4. [All Domains & Their Purpose](#all-domains--their-purpose)
5. [Promo Tracking Flow](#promo-tracking-flow)
6. [Migration Strategy](#migration-strategy)
7. [Cloudflare Setup](#cloudflare-setup)
8. [Database Schema](#database-schema)
9. [Environment Variables](#environment-variables)
10. [Testing Plan](#testing-plan)
11. [Deployment Checklist](#deployment-checklist)
12. [Rollback Plan](#rollback-plan)

---

## CURRENT STATE ANALYSIS

### What's Currently Live (MUST NOT BREAK):
- **Netlify Hosting:** All sites currently on Netlify
- **Live Payment Links:** tickets.soundfactorynyc.net (Stripe checkout)
- **Table Bookings:** seance.soundfactorynyc.com/tables
- **Promoter System:** promoters.soundfactorynyc.com
- **Supabase Database:** Storing user data, promoters, transactions
- **Stripe Connect:** Processing payments & promoter commissions

### Current Issues:
❌ Promo code tracking not fully connected to commission system
❌ Multiple scattered projects - hard to manage
❌ No centralized analytics for promo performance
❌ Sites hosted across different platforms

### Current Tech Stack:
- **Hosting:** Netlify
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe + Stripe Connect
- **SMS:** Twilio
- **Backend:** Netlify Functions
- **Frontend:** Static HTML/JS

---

## COMPLETE ARCHITECTURE PLAN

### New Tech Stack (Cloudflare):
- **Hosting:** Cloudflare Pages (6 separate sites)
- **Backend API:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQL) for promo analytics
- **Database:** Keep Supabase for user/transaction data (or migrate later)
- **Payments:** Stripe (same keys, no change)
- **Analytics:** Cloudflare Analytics + Custom Dashboard
- **CDN:** Cloudflare global network (automatic)

### Why Cloudflare?
✅ **Faster:** Global edge network
✅ **Cheaper:** Free tier covers your traffic
✅ **Integrated:** Workers + D1 + Pages all in one platform
✅ **Scalable:** Handle traffic spikes automatically
✅ **Analytics:** Built-in traffic analytics
✅ **DDoS Protection:** Automatic security

---

## FOLDER STRUCTURE

```
soundfactory/                          ← ONE VS Code Project
├─ README.md                           ← Master documentation
├─ .gitignore                          ← Ignore node_modules, .env
├─ .vscode/
│  ├─ settings.json                    ← Shared VS Code settings
│  └─ soundfactory.code-workspace      ← Multi-root workspace
│
├─ packages/                           ← SHARED ASSETS (all sites use these)
│  ├─ shared-assets/
│  │  ├─ logos/
│  │  │  ├─ sf-logo.png
│  │  │  └─ sf-logo.svg
│  │  ├─ flyers/
│  │  │  ├─ halloween-2025.jpg
│  │  │  └─ nye-2025.jpg
│  │  └─ fonts/
│  │     └─ sf-font.woff2
│  └─ shared-scripts/
│     ├─ helpers.js                    ← Common JS functions
│     ├─ sf-theme.css                  ← Brand colors/styles
│     └─ promo-tracker.js              ← Universal promo tracking
│
├─ apps/                               ← INDIVIDUAL SITES
│  │
│  ├─ main-site/                       ← soundfactorynyc.com
│  │  ├─ wrangler.toml                 ← Cloudflare config
│  │  ├─ public/
│  │  │  ├─ index.html                 ← Homepage
│  │  │  ├─ about.html
│  │  │  ├─ privacy.html
│  │  │  └─ terms.html
│  │  └─ src/
│  │     ├─ css/
│  │     ├─ js/
│  │     └─ images/
│  │
│  ├─ seance-subsite/                  ← seance.soundfactorynyc.com
│  │  ├─ wrangler.toml
│  │  ├─ public/
│  │  │  ├─ index.html                 ← Admin dashboard
│  │  │  ├─ seance-tables.html         ← PUBLIC TABLE BOOKING (CRITICAL)
│  │  │  └─ tables.html                ← Alternate table link (CRITICAL)
│  │  └─ src/
│  │     ├─ css/
│  │     └─ js/
│  │
│  ├─ promoters-soundfactory/          ← promoters.soundfactorynyc.com
│  │  ├─ wrangler.toml
│  │  ├─ .env.example
│  │  ├─ public/
│  │  │  ├─ index.html                 ← Promoter signup
│  │  │  ├─ dashboard.html             ← Promoter dashboard
│  │  │  ├─ login.html
│  │  │  ├─ team-tickets-tables.html   ← PROMO LINK PAGE (with ?promo=)
│  │  │  └─ success.html
│  │  └─ workers/
│  │     ├─ connect-onboard.js         ← Stripe Connect onboarding
│  │     ├─ connect-webhook.js         ← Stripe webhook handler
│  │     └─ promo-tracker.js           ← Track promo clicks
│  │
│  ├─ tickets-site/                    ← tickets.soundfactorynyc.net
│  │  ├─ wrangler.toml                 ← CRITICAL: Stripe checkout links
│  │  ├─ public/
│  │  │  ├─ index.html                 ← Ticket selection page
│  │  │  └─ checkout.html              ← Stripe embedded checkout
│  │  └─ workers/
│  │     └─ create-checkout.js         ← Create Stripe session with promo
│  │
│  ├─ ticket-links/                    ← links.soundfactorynyc.com
│  │  ├─ wrangler.toml                 ← LinkTree-style link page
│  │  ├─ public/
│  │  │  └─ index.html                 ← All event links
│  │  └─ src/
│  │     └─ css/
│  │
│  └─ social-cron/                     ← poster.soundfactorynyc.com
│     ├─ wrangler.toml
│     ├─ .env.example
│     ├─ queue.json                    ← Social media post queue
│     └─ workers/
│        ├─ hourly-post.js             ← Auto-post to social media
│        └─ health-check.js
│
├─ database/                           ← DATABASE SCHEMAS
│  ├─ d1-schema.sql                    ← Cloudflare D1 (promo analytics)
│  ├─ supabase-schema.sql              ← Supabase (users/transactions)
│  └─ migrations/
│     ├─ 001_initial.sql
│     └─ 002_add_promo_tracking.sql
│
└─ tools/                              ← AUTOMATION & UTILITIES
   ├─ scripts/
   │  ├─ check-envs.mjs                ← Validate environment variables
   │  ├─ deploy-all.sh                 ← Deploy all sites
   │  ├─ deploy-single.sh              ← Deploy one site
   │  └─ test-promo-flow.js            ← Test promo tracking end-to-end
   └─ .husky/
      └─ pre-commit                    ← Git hooks for safety checks
```

---

## ALL DOMAINS & THEIR PURPOSE

| Domain | Purpose | Current Host | New Host | Critical? |
|--------|---------|--------------|----------|-----------|
| **soundfactorynyc.com** | Main website | Netlify | Cloudflare Pages | Medium |
| **seance.soundfactorynyc.com** | Admin dashboard + Public table bookings | Netlify | Cloudflare Pages | **CRITICAL** |
| **promoters.soundfactorynyc.com** | Promoter signup & marketing links | Netlify | Cloudflare Pages | High |
| **tickets.soundfactorynyc.net** | Stripe checkout (actual payment links) | Netlify | Cloudflare Pages | **CRITICAL** |
| **links.soundfactorynyc.com** | LinkTree-style event links | Netlify | Cloudflare Pages | Low |
| **poster.soundfactorynyc.com** | Social media automation | Netlify | Cloudflare Workers | Low |

---

## PROMO TRACKING FLOW

### The Complete Customer Journey:

```
STEP 1: Promoter Shares Link
   Promoter: Jonathan Peters (JP2025)
   Link: https://promoters.soundfactorynyc.com/team-tickets-tables.html?promo=JP2025
   
   ↓

STEP 2: Customer Clicks Link
   - Lands on promoters.soundfactorynyc.com
   - Page displays: "🎉 Shared by Your Promoter: Jonathan Peters"
   - Promo code stored in browser (localStorage + cookie)
   - Cloudflare Worker logs: Visit recorded to D1 database
   
   Database Record Created:
   {
     promo_code: "JP2025",
     timestamp: "2025-10-14T20:30:00Z",
     page_url: "/team-tickets-tables.html",
     referrer: "instagram.com",
     user_agent: "Mobile Safari",
     ip_hash: "abc123" (anonymized)
   }
   
   ↓

STEP 3: Customer Browses Options
   - Sees ticket options
   - Sees table options
   - Promo code: JP2025 stays attached in browser
   
   ↓

STEP 4A: Customer Buys TICKETS
   - Clicks "Buy Tickets" button
   - Redirects to: tickets.soundfactorynyc.net?promo=JP2025
   - Cloudflare Worker creates Stripe checkout session
   - Promo code attached to Stripe metadata
   
   Stripe Session Metadata:
   {
     promo_code: "JP2025",
     promoter_name: "Jonathan Peters",
     source: "promoter_link"
   }
   
   - Customer completes payment on Stripe
   - Webhook fires → Stripe Connect pays JP2025 commission
   
   Database Updated:
   {
     promo_code: "JP2025",
     conversion_type: "ticket",
     amount: "$150",
     commission: "$15",
     status: "completed"
   }
   
   ↓ OR ↓

STEP 4B: Customer Books TABLE
   - Clicks "Book Table" button
   - Redirects to: seance.soundfactorynyc.com/tables?promo=JP2025
   - Shows table options with JP2025 banner
   - Customer selects table → Stripe checkout
   - Promo code attached to Stripe metadata
   
   Stripe Session Metadata:
   {
     promo_code: "JP2025",
     promoter_name: "Jonathan Peters",
     table_type: "12_person",
     source: "promoter_link"
   }
   
   - Customer pays deposit
   - Webhook fires → Stripe Connect pays JP2025 commission
   
   Database Updated:
   {
     promo_code: "JP2025",
     conversion_type: "table",
     amount: "$2400",
     commission: "$240",
     status: "completed"
   }
   
   ↓

STEP 5: Admin Dashboard Updated
   - Admin logs into: seance.soundfactorynyc.com
   - Dashboard shows:
     * JP2025: 15 clicks, 3 conversions, $450 earned
     * Top performer this week: JP2025
   - Real-time analytics visible
```

### Technical Implementation:

**Frontend (promoters.soundfactorynyc.com):**
```javascript
// On page load
const urlParams = new URLSearchParams(window.location.search);
const promoCode = urlParams.get('promo');

if (promoCode) {
  // Store in browser
  localStorage.setItem('sf_promo', promoCode);
  document.cookie = `sf_promo=${promoCode}; path=/; max-age=2592000`; // 30 days
  
  // Show promoter banner
  document.getElementById('promoterBanner').style.display = 'block';
  
  // Track the visit
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      promo_code: promoCode,
      page_url: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    })
  });
}

// When customer clicks "Buy" button
function handlePurchaseClick(type) {
  const promoCode = localStorage.getItem('sf_promo');
  const url = type === 'ticket' 
    ? `https://tickets.soundfactorynyc.net?promo=${promoCode}`
    : `https://seance.soundfactorynyc.com/tables?promo=${promoCode}`;
  
  window.location.href = url;
}
```

**Backend (Cloudflare Worker - /api/track-visit):**
```javascript
export default {
  async fetch(request, env) {
    const { promo_code, page_url, referrer, timestamp } = await request.json();
    
    // Insert into D1 database
    await env.DB.prepare(`
      INSERT INTO promo_visits 
      (promo_code, page_url, referrer, timestamp, ip_hash)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      promo_code,
      page_url,
      referrer,
      timestamp,
      hashIP(request.headers.get('CF-Connecting-IP'))
    ).run();
    
    return new Response('Tracked', { status: 200 });
  }
};
```

**Stripe Checkout Creation:**
```javascript
// Worker: Create Stripe checkout with promo
const session = await stripe.checkout.sessions.create({
  line_items: [{ price: 'price_ticket_ga', quantity: 1 }],
  mode: 'payment',
  success_url: 'https://promoters.soundfactorynyc.com/success',
  metadata: {
    promo_code: promoCode,
    promoter_id: 'JP2025',
    source: 'promoter_link'
  },
  // Stripe Connect - pay commission to promoter
  payment_intent_data: {
    application_fee_amount: 1500, // $15 commission
    transfer_data: {
      destination: 'acct_promoter_jp2025' // JP's Stripe Connect account
    }
  }
});
```

---

## MIGRATION STRATEGY

### Phase 1: PREPARATION (No Changes to Live Sites)
**Timeline:** 2-3 hours

1. **Create New Folder Structure**
   - Build complete monorepo locally
   - Set up VS Code workspace
   - No deployment yet

2. **Migrate Existing Code**
   - Copy current Netlify sites into new structure
   - Update file paths
   - Test locally

3. **Set Up Cloudflare**
   - Create Cloudflare account (if needed)
   - Authenticate Wrangler CLI (DONE ✅)
   - Create D1 database
   - Set up Workers

4. **Configure Environment Variables**
   - Migrate all .env variables to Cloudflare
   - Test database connections
   - Verify Stripe keys work

**✅ Checkpoint:** Everything built locally, nothing deployed yet

---

### Phase 2: PARALLEL DEPLOYMENT (Netlify Still Live)
**Timeline:** 1-2 hours

1. **Deploy to Cloudflare Preview URLs**
   - Each site gets a `*.pages.dev` URL
   - Examples:
     * `soundfactory-main.pages.dev`
     * `soundfactory-seance.pages.dev`
     * `soundfactory-promoters.pages.dev`
     * `soundfactory-tickets.pages.dev`

2. **Test on Preview URLs**
   - Test promo tracking flow end-to-end
   - Verify Stripe checkout works
   - Check table booking pages
   - Test all payment links
   - Verify admin dashboard

3. **Fix Any Issues**
   - Debug on preview URLs
   - Netlify still handling live traffic
   - No customer impact

**✅ Checkpoint:** Cloudflare version fully working on preview URLs

---

### Phase 3: DNS SWITCH (Go Live on Cloudflare)
**Timeline:** 15 minutes downtime max

1. **Prepare DNS Records** (Do this in advance)
   ```
   Type  Name                              Target
   ─────────────────────────────────────────────────────────────
   CNAME soundfactorynyc.com              soundfactory-main.pages.dev
   CNAME seance.soundfactorynyc.com       soundfactory-seance.pages.dev
   CNAME promoters.soundfactorynyc.com    soundfactory-promoters.pages.dev
   CNAME tickets.soundfactorynyc.net      soundfactory-tickets.pages.dev
   CNAME links.soundfactorynyc.com        soundfactory-links.pages.dev
   ```

2. **Switch DNS (ONE SITE AT A TIME)**
   
   **Option A: Test with Non-Critical Site First**
   - Switch `links.soundfactorynyc.com` first (low traffic)
   - Wait 5 minutes, verify it works
   - If good, proceed with others
   
   **Option B: All at Once (Faster)**
   - Update all DNS records simultaneously
   - Wait for propagation (5-15 minutes)
   - Monitor traffic/errors

3. **Verify Everything Works**
   - Test promo link: promoters.soundfactorynyc.com/?promo=JP2025
   - Test table booking: seance.soundfactorynyc.com/tables
   - Make test purchase on tickets.soundfactorynyc.net
   - Check admin dashboard

**✅ Checkpoint:** All sites live on Cloudflare

---

### Phase 4: POST-MIGRATION CLEANUP
**Timeline:** 30 minutes

1. **Monitor for 24 Hours**
   - Watch Cloudflare Analytics
   - Check for errors
   - Monitor Stripe webhooks
   - Verify promo tracking working

2. **Keep Netlify as Backup (7 Days)**
   - Don't delete Netlify sites immediately
   - Keep as rollback option
   - After 7 days of stable Cloudflare, can delete

3. **Update Documentation**
   - Update DNS records in docs
   - Update deployment instructions
   - Document new workflow

**✅ Migration Complete!**

---

## CLOUDFLARE SETUP

### 1. Cloudflare Pages (Static Sites)

**Create 5 Pages Projects:**

```bash
# Main site
cd apps/main-site
wrangler pages deploy public --project-name=soundfactory-main

# Seance (CRITICAL - table bookings)
cd apps/seance-subsite
wrangler pages deploy public --project-name=soundfactory-seance

# Promoters (promo tracking)
cd apps/promoters-soundfactory
wrangler pages deploy public --project-name=soundfactory-promoters

# Tickets (CRITICAL - Stripe checkout)
cd apps/tickets-site
wrangler pages deploy public --project-name=soundfactory-tickets

# Links (LinkTree style)
cd apps/ticket-links
wrangler pages deploy public --project-name=soundfactory-links
```

---

### 2. Cloudflare Workers (Backend APIs)

**Worker 1: Promo Visit Tracker**
```javascript
// apps/promoters-soundfactory/workers/promo-tracker.js

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const { promo_code, page_url, referrer } = await request.json();
    
    // Validate promo code exists
    const promoter = await env.DB.prepare(
      'SELECT id, name FROM promoters WHERE code = ?'
    ).bind(promo_code).first();
    
    if (!promoter) {
      return new Response('Invalid promo code', { status: 400 });
    }
    
    // Log the visit
    await env.DB.prepare(`
      INSERT INTO promo_visits 
      (promo_code, promoter_id, page_url, referrer, timestamp, ip_hash, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      promo_code,
      promoter.id,
      page_url,
      referrer || '',
      new Date().toISOString(),
      await hashIP(request.headers.get('CF-Connecting-IP')),
      request.headers.get('User-Agent')
    ).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      promoter_name: promoter.name 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'SALT_KEY_HERE');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}
```

**Worker 2: Stripe Checkout Creator**
```javascript
// apps/tickets-site/workers/create-checkout.js

import Stripe from 'stripe';

export default {
  async fetch(request, env) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const url = new URL(request.url);
    const promoCode = url.searchParams.get('promo');
    
    // Get promoter details
    let promoterAccount = null;
    if (promoCode) {
      const promoter = await env.DB.prepare(
        'SELECT stripe_account_id, commission_rate FROM promoters WHERE code = ?'
      ).bind(promoCode).first();
      
      if (promoter) {
        promoterAccount = promoter.stripe_account_id;
      }
    }
    
    // Calculate commission (10% of sale)
    const ticketPrice = 15000; // $150 in cents
    const commissionAmount = Math.floor(ticketPrice * 0.10); // $15
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price: env.STRIPE_PRICE_TICKET,
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.BASE_URL}/tickets`,
      metadata: {
        promo_code: promoCode || 'none',
        source: promoCode ? 'promoter_link' : 'direct'
      },
      // Stripe Connect - pay promoter commission
      ...(promoterAccount && {
        payment_intent_data: {
          application_fee_amount: commissionAmount,
          transfer_data: {
            destination: promoterAccount
          }
        }
      })
    });
    
    // Log conversion attempt
    if (promoCode) {
      await env.DB.prepare(`
        INSERT INTO promo_conversions 
        (promo_code, session_id, amount, commission, status)
        VALUES (?, ?, ?, ?, 'pending')
      `).bind(promoCode, session.id, ticketPrice, commissionAmount).run();
    }
    
    return Response.redirect(session.url, 303);
  }
};
```

**Worker 3: Stripe Webhook Handler**
```javascript
// apps/promoters-soundfactory/workers/stripe-webhook.js

import Stripe from 'stripe';

export default {
  async fetch(request, env) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const promoCode = session.metadata.promo_code;
      
      if (promoCode && promoCode !== 'none') {
        // Update conversion status to completed
        await env.DB.prepare(`
          UPDATE promo_conversions 
          SET status = 'completed', completed_at = ?
          WHERE session_id = ?
        `).bind(new Date().toISOString(), session.id).run();
        
        // Update promoter stats
        await env.DB.prepare(`
          UPDATE promoters 
          SET total_sales = total_sales + 1,
              total_revenue = total_revenue + ?,
              total_commission = total_commission + ?
          WHERE code = ?
        `).bind(
          session.amount_total,
          session.amount_total * 0.10,
          promoCode
        ).run();
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

---

### 3. Cloudflare D1 Database

**Create Database:**
```bash
wrangler d1 create sf-promo-analytics
```

**Database ID will be returned - add to wrangler.toml**

**Schema (database/d1-schema.sql):**
```sql
-- Promoters table
CREATE TABLE IF NOT EXISTS promoters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  stripe_account_id TEXT,
  commission_rate REAL DEFAULT 0.10,
  status TEXT DEFAULT 'active',
  total_sales INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  total_commission INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Promo visits (clicks on promo links)
CREATE TABLE IF NOT EXISTS promo_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  promo_code TEXT NOT NULL,
  promoter_id INTEGER,
  page_url TEXT,
  referrer TEXT,
  timestamp TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (promoter_id) REFERENCES promoters(id)
);

-- Promo conversions (actual purchases)
CREATE TABLE IF NOT EXISTS promo_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  promo_code TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  commission INTEGER NOT NULL,
  conversion_type TEXT, -- 'ticket' or 'table'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  created_at TEXT NOT NULL,
  completed_at TEXT
);

-- Indexes for performance
CREATE INDEX idx_visits_promo ON promo_visits(promo_code);
CREATE INDEX idx_visits_timestamp ON promo_visits(timestamp);
CREATE INDEX idx_conversions_promo ON promo_conversions(promo_code);
CREATE INDEX idx_conversions_status ON promo_conversions(status);

-- Insert test promoter
INSERT INTO promoters (code, name, email, commission_rate, created_at, updated_at)
VALUES ('JP2025', 'Jonathan Peters', 'jp@example.com', 0.10, datetime('now'), datetime('now'));
```

**Apply Schema:**
```bash
wrangler d1 execute sf-promo-analytics --file=database/d1-schema.sql
```

---

### 4. Cloudflare Analytics Dashboard

**Create Custom Dashboard Page:**
```html
<!-- apps/seance-subsite/public/analytics.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Promoter Analytics - Sound Factory</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>Promoter Performance Dashboard</h1>
  
  <div id="stats">
    <div class="stat-card">
      <h3>Total Clicks</h3>
      <p id="total-clicks">Loading...</p>
    </div>
    <div class="stat-card">
      <h3>Total Conversions</h3>
      <p id="total-conversions">Loading...</p>
    </div>
    <div class="stat-card">
      <h3>Conversion Rate</h3>
      <p id="conversion-rate">Loading...</p>
    </div>
  </div>
  
  <h2>Top Promoters</h2>
  <table id="promoter-table">
    <thead>
      <tr>
        <th>Promoter</th>
        <th>Code</th>
        <th>Clicks</th>
        <th>Sales</th>
        <th>Revenue</th>
        <th>Commission</th>
      </tr>
    </thead>
    <tbody id="promoter-data"></tbody>
  </table>
  
  <canvas id="chart"></canvas>
  
  <script>
    async function loadAnalytics() {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      // Update stats
      document.getElementById('total-clicks').textContent = data.totalClicks;
      document.getElementById('total-conversions').textContent = data.totalConversions;
      document.getElementById('conversion-rate').textContent = 
        ((data.totalConversions / data.totalClicks) * 100).toFixed(2) + '%';
      
      // Populate table
      const tbody = document.getElementById('promoter-data');
      data.promoters.forEach(p => {
        tbody.innerHTML += `
          <tr>
            <td>${p.name}</td>
            <td>${p.code}</td>
            <td>${p.clicks}</td>
            <td>${p.sales}</td>
            <td>$${(p.revenue / 100).toFixed(2)}</td>
            <td>$${(p.commission / 100).toFixed(2)}</td>
          </tr>
        `;
      });
      
      // Create chart
      const ctx = document.getElementById('chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.promoters.map(p => p.name),
          datasets: [{
            label: 'Commission Earned ($)',
            data: data.promoters.map(p => p.commission / 100),
            backgroundColor: '#ff0066'
          }]
        }
      });
    }
    
    loadAnalytics();
  </script>
</body>
</html>
```

**Analytics API Worker:**
```javascript
// apps/seance-subsite/workers/analytics.js

export default {
  async fetch(request, env) {
    // Get total clicks
    const clicksResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM promo_visits'
    ).first();
    
    // Get total conversions
    const conversionsResult = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM promo_conversions WHERE status = 'completed'"
    ).first();
    
    // Get promoter performance
    const promoters = await env.DB.prepare(`
      SELECT 
        p.name,
        p.code,
        COUNT(DISTINCT v.id) as clicks,
        p.total_sales as sales,
        p.total_revenue as revenue,
        p.total_commission as commission
      FROM promoters p
      LEFT JOIN promo_visits v ON p.code = v.promo_code
      GROUP BY p.id
      ORDER BY p.total_commission DESC
    `).all();
    
    return new Response(JSON.stringify({
      totalClicks: clicksResult.count,
      totalConversions: conversionsResult.count,
      promoters: promoters.results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

---

## DATABASE SCHEMA

### Cloudflare D1 (Promo Analytics)
See section above for full schema.

**Key Tables:**
- `promoters` - Promoter info & stats
- `promo_visits` - Every click on promo links
- `promo_conversions` - Actual purchases with promo codes

---

### Supabase (Keep for User/Transaction Data)

**Option A: Keep Supabase** (Recommended for migration)
- Existing data stays
- Less migration work
- Use for: users, events, bookings

**Option B: Migrate to D1**
- More work upfront
- Everything in Cloudflare
- Better integration

**Recommendation:** Keep Supabase initially, migrate later if needed.

---

## ENVIRONMENT VARIABLES

### All Sites Need These:

**Shared Variables (all apps):**
```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
BASE_URL=https://soundfactorynyc.com
SEANCE_URL=https://seance.soundfactorynyc.com
PROMOTERS_URL=https://promoters.soundfactorynyc.com
TICKETS_URL=https://tickets.soundfactorynyc.net
```

**Promoters Site Specific:**
```bash
STRIPE_CONNECT_CLIENT_ID=ca_...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
```

**Social Cron Specific:**
```bash
FACEBOOK_ACCESS_TOKEN=...
ANTHROPIC_API_KEY=sk-ant-...
```

**Set in Cloudflare:**
```bash
# For Pages projects
wrangler pages secret put STRIPE_SECRET_KEY

# For Workers
wrangler secret put STRIPE_SECRET_KEY
```

---

## TESTING PLAN

### 1. Local Testing (Before Deployment)

**Test Promo Flow Locally:**
```bash
cd apps/promoters-soundfactory
wrangler pages dev public --port 3000

# In another terminal
cd apps/tickets-site
wrangler pages dev public --port 3001

# Visit: http://localhost:3000/team-tickets-tables.html?promo=JP2025
# Click through to tickets
# Verify promo code carries through
```

---

### 2. Preview URL Testing (After Cloudflare Deployment)

**Test Checklist:**

```
✅ Public Pages
  ⬜ soundfactory-main.pages.dev loads
  ⬜ All navigation links work
  ⬜ Images/CSS load correctly

✅ Promo Tracking
  ⬜ Visit: soundfactory-promoters.pages.dev/team-tickets-tables.html?promo=JP2025
  ⬜ Promoter banner displays correctly
  ⬜ Promo code stored in localStorage
  ⬜ Database logs visit (check D1)

✅ Table Bookings (CRITICAL)
  ⬜ Visit: soundfactory-seance.pages.dev/tables
  ⬜ Table options display
  ⬜ Pricing correct
  ⬜ Click "Book Table" redirects correctly

✅ Ticket Purchase Flow
  ⬜ From promo page, click "Buy Tickets"
  ⬜ Redirects to: soundfactory-tickets.pages.dev?promo=JP2025
  ⬜ Stripe checkout opens
  ⬜ Promo code in checkout metadata
  ⬜ Test purchase with Stripe test card: 4242 4242 4242 4242

✅ Stripe Webhooks
  ⬜ Make test purchase
  ⬜ Check D1: promo_conversions table updated
  ⬜ Check promoter stats incremented
  ⬜ Commission calculated correctly

✅ Admin Dashboard
  ⬜ Login to: soundfactory-seance.pages.dev/analytics
  ⬜ Stats display correctly
  ⬜ Promoter table populated
  ⬜ Charts render

✅ Error Handling
  ⬜ Try invalid promo code
  ⬜ Try expired Stripe session
  ⬜ Test with no JavaScript
  ⬜ Test on mobile device
```

---

### 3. Production Testing (After DNS Switch)

**Test Same Checklist on Real Domains:**

**Critical Path Test:**
```
1. Share link in incognito: promoters.soundfactorynyc.com/team-tickets-tables.html?promo=JP2025
2. Click through entire purchase flow
3. Use REAL Stripe card (small $1 test)
4. Verify commission paid to promoter
5. Check admin dashboard updated
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment

```
⬜ 1. Backup current Netlify sites
⬜ 2. Export Supabase database
⬜ 3. Test Stripe keys (test mode first)
⬜ 4. Verify all environment variables set
⬜ 5. Create D1 database and apply schema
⬜ 6. Test locally with wrangler dev
⬜ 7. Notify team: "Migration starting in 1 hour"
```

---

### Deployment Steps

```
⬜ 1. Deploy all Cloudflare Pages projects
     cd apps/main-site && wrangler pages deploy public --project-name=soundfactory-main
     cd apps/seance-subsite && wrangler pages deploy public --project-name=soundfactory-seance
     cd apps/promoters-soundfactory && wrangler pages deploy public --project-name=soundfactory-promoters
     cd apps/tickets-site && wrangler pages deploy public --project-name=soundfactory-tickets
     cd apps/ticket-links && wrangler pages deploy public --project-name=soundfactory-links

⬜ 2. Deploy all Workers
     cd apps/promoters-soundfactory/workers && wrangler deploy promo-tracker.js
     cd apps/tickets-site/workers && wrangler deploy create-checkout.js
     cd apps/seance-subsite/workers && wrangler deploy analytics.js

⬜ 3. Test on .pages.dev URLs
     Run complete testing checklist (see above)

⬜ 4. Update DNS (ONE AT A TIME)
     Start with: links.soundfactorynyc.com (lowest traffic)
     Wait 5 min, verify working
     Then: promoters.soundfactorynyc.com
     Then: soundfactorynyc.com
     Finally: seance.soundfactorynyc.com, tickets.soundfactorynyc.net

⬜ 5. Wait for DNS propagation (15-30 minutes)
     Check: https://dnschecker.org

⬜ 6. Test on real domains
     Run critical path test (see above)

⬜ 7. Update Stripe webhook URLs
     Stripe Dashboard → Webhooks
     Change URL to: https://promoters.soundfactorynyc.com/api/webhook

⬜ 8. Monitor for 1 hour
     Watch Cloudflare Analytics
     Check error logs
     Test a few more transactions

⬜ 9. Notify team: "Migration complete, monitor for issues"

⬜ 10. Keep Netlify running for 7 days as backup
```

---

### Post-Deployment

```
⬜ 1. Monitor Cloudflare Analytics dashboard
⬜ 2. Check error logs daily for 1 week
⬜ 3. Verify Stripe webhooks firing correctly
⬜ 4. Test promo tracking daily
⬜ 5. After 7 days: Delete Netlify sites (if stable)
⬜ 6. Update all documentation
⬜ 7. Train team on new system
```

---

## ROLLBACK PLAN

### If Something Goes Wrong

**Immediate Rollback (5 minutes):**

```bash
# Revert DNS to Netlify
# Change CNAME records back to:
CNAME soundfactorynyc.com → [old-netlify-site].netlify.app
CNAME seance.soundfactorynyc.com → [old-netlify-site].netlify.app
# etc.
```

**What to Save for Rollback:**
- Current Netlify site names
- Current DNS records (screenshot)
- Current environment variables
- Supabase connection still works

**Decision Tree:**

```
Is PAYMENT processing broken?
├─ YES → IMMEDIATE ROLLBACK
└─ NO → Is it just visual/UI issues?
    ├─ YES → Fix on Cloudflare (customers can still buy)
    └─ NO → Assess severity, may need rollback
```

---

## MONITORING & ALERTS

### Cloudflare Analytics
- Page views per site
- Error rates
- Response times
- Geographic distribution

### Custom Alerts (Set Up)
```javascript
// Worker: Email alert if errors spike
if (errorCount > 10) {
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: 'admin@soundfactorynyc.com' }],
        subject: '🚨 Cloudflare Error Spike Alert'
      }],
      from: { email: 'alerts@soundfactorynyc.com' },
      content: [{
        type: 'text/plain',
        value: `Error count exceeded threshold: ${errorCount} errors in last hour`
      }]
    })
  });
}
```

### Stripe Webhook Monitoring
- Check webhook delivery success rate in Stripe Dashboard
- Set up Stripe email alerts for failed webhooks

### Uptime Monitoring
- Use UptimeRobot or similar (free)
- Monitor all 6 domains
- Alert if any site down > 2 minutes

---

## SUCCESS CRITERIA

### Migration is Successful When:

```
✅ All 6 sites live on Cloudflare
✅ Zero customer-facing errors
✅ Promo tracking working (test with real promo code)
✅ Table bookings processing (critical!)
✅ Ticket purchases processing (critical!)
✅ Stripe webhooks firing successfully
✅ Admin dashboard showing real data
✅ DNS fully propagated (all green on dnschecker.org)
✅ Performance same or better than Netlify
✅ 48 hours stable with no issues
```

---

## TIMELINE SUMMARY

### Realistic Timeline:

**Day 1 (4-5 hours):**
- ✅ Authenticate Cloudflare (DONE)
- Build monorepo folder structure
- Migrate code into new structure
- Set up D1 database
- Deploy to Cloudflare preview URLs
- Test on preview URLs

**Day 2 (2-3 hours):**
- Fix any issues found in testing
- Final testing on preview URLs
- Prepare DNS records
- Schedule migration window

**Day 3 (1 hour + monitoring):**
- Update DNS records
- Wait for propagation
- Test on real domains
- Monitor for issues

**Day 4-10:**
- Monitor stability
- Keep Netlify as backup

**Day 11:**
- If stable, delete Netlify sites
- Migration complete! 🎉

---

## CONTACTS & RESOURCES

### Key People
- **Admin:** [Your Name]
- **Stripe Support:** https://support.stripe.com
- **Cloudflare Support:** https://dash.cloudflare.com (chat)

### Documentation Links
- Cloudflare Pages: https://developers.cloudflare.com/pages
- Cloudflare Workers: https://developers.cloudflare.com/workers
- D1 Database: https://developers.cloudflare.com/d1
- Stripe Connect: https://stripe.com/docs/connect
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler

### Emergency Commands
```bash
# View D1 database
wrangler d1 execute sf-promo-analytics --command "SELECT * FROM promoters"

# View Worker logs
wrangler tail promo-tracker

# Rollback deployment
wrangler pages deployment list --project-name=soundfactory-main
wrangler pages deployment rollback <deployment-id>
```

---

## NOTES & CONSIDERATIONS

### Why This Approach?
- **Zero downtime:** Netlify stays live while we build
- **Test everything:** Preview URLs before going live
- **Easy rollback:** Just change DNS back
- **Incremental:** Can migrate one site at a time
- **Safe:** Critical payment links tested thoroughly

### Potential Gotchas
- **DNS propagation:** Can take up to 48 hours globally (usually 15 min)
- **Browser caching:** Users may see old site briefly (clear cache)
- **Stripe webhooks:** Need to update URL after migration
- **SSL certificates:** Cloudflare auto-generates (may take 5-10 min)
- **Cookie domain:** Ensure promo tracking cookies work across subdomains

### Future Enhancements
- Add real-time dashboard with WebSockets
- SMS notifications when promoter makes a sale
- QR codes for promoter links
- A/B testing different promo page designs
- Automated social media posting with promo links
- Mobile app for promoters

---

## VERSION HISTORY

**v1.0 - October 14, 2025**
- Initial migration plan created
- All 6 sites mapped
- Complete promo tracking flow documented
- Cloudflare authentication completed

---

## APPENDIX

### A. Promo Code Format
- Format: `[INITIALS][YEAR]` (e.g., JP2025)
- Must be unique
- Case-insensitive
- Alphanumeric only
- Length: 4-20 characters

### B. Commission Structure
- Default: 10% of sale
- Tickets: $150 ticket = $15 commission
- Tables: $2400 table = $240 commission
- Paid via Stripe Connect (instant)

### C. Browser Compatibility
- Promo tracking works on:
  ✅ Chrome/Edge (Chromium)
  ✅ Safari (iOS/macOS)
  ✅ Firefox
  ⚠️  Degrades gracefully without JavaScript

---

**END OF MASTER PLAN**

Questions? Contact admin or refer to:
- This document: `/CLOUDFLARE_MIGRATION_MASTER_PLAN.md`
- Cloudflare Dashboard: https://dash.cloudflare.com
- Project Repository: `/soundfactory/`