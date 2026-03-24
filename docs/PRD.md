# KaamChalu — Product Requirements Document (PRD)

> **Version**: 1.0
> **Author**: Meer Sheikh
> **Date**: 2026-03-24
> **Status**: Draft — Ready for intern review

---

## 1. Overview

### 1.1 What is KaamChalu?

KaamChalu is a web-based SaaS platform that connects blue-collar workers (plumbers, electricians, maids, drivers, cooks, painters, carpenters, etc.) with customers who need their services in Indian cities.

The name "KaamChalu" means "Work Started" in Hindi — signaling that the platform is about getting work going, fast.

### 1.2 The Problem

**For Workers:**
- 80%+ of India's blue-collar workforce finds work through word of mouth, standing at road junctions, or through middlemen who take a cut
- They have no online presence — no profile, no reviews, no way for new customers to find them
- Income is unpredictable — they don't know where tomorrow's work is coming from
- They have no proof of their skills or track record to show new customers
- Middlemen (contractors, agents) take 20-40% commission

**For Customers:**
- Finding a trusted plumber or electrician is a WhatsApp-group-and-prayer situation
- No way to verify if the worker is skilled, honest, or reliable before hiring
- Pricing is completely opaque — every worker quotes differently, customers don't know if they're being overcharged
- No accountability — if the work is bad, the worker disappears
- Existing apps (Urban Company) are expensive and only serve metro cities, only cover certain categories

**For the Market:**
- India has 450 million+ blue-collar workers
- Urban Company serves <1% of this market and only in top 10 cities
- Tier 2 and Tier 3 cities are completely unserved
- The market is massive, fragmented, and offline

### 1.3 The Solution

A simple, phone-first platform where:
1. Workers create a profile (name, skills, area, rate, availability) and get discovered by customers
2. Customers post a job need and get matched with verified, rated workers nearby
3. The platform handles matching, notifications, reminders, and follow-ups automatically
4. Both sides rate each other, building trust over time
5. An admin panel manages the platform, verifies workers, and handles disputes

### 1.4 Who is this NOT for?

- Not for white-collar/IT jobs (that's Naukri/LinkedIn)
- Not for gig delivery (that's Zomato/Swiggy/Dunzo)
- Not for full-time permanent employment
- Not a marketplace with upfront payments (workers and customers settle payment directly — we don't handle money in v1)

---

## 2. Users & Roles

### 2.1 Worker

A person who provides a service. Examples: plumber, electrician, maid, cook, driver, carpenter, painter, AC repair technician, pest control, home tutor.

**Demographics:**
- Age: 20-55
- Phone: Android (budget, ₹8000-15000 range), mostly 4G
- Language: Hindi primary, some English, regional languages
- Tech comfort: Can use WhatsApp, YouTube, Google Maps. May struggle with complex UIs.
- Education: 8th-12th pass typically

**What they want:**
- More customers without depending on middlemen
- Steady income
- A way to show their work quality (ratings, reviews)
- Job notifications they can respond to quickly
- To be treated with respect and professionalism

### 2.2 Customer

A person or household that needs a service done.

**Demographics:**
- Age: 25-55
- Phone: Android or iPhone, 4G/5G
- Language: Hindi + English
- Tech comfort: Uses food delivery apps, payment apps, e-commerce
- Location: Urban and semi-urban India

**What they want:**
- Find a trusted worker fast (within hours, not days)
- Know the price upfront (or at least a range)
- See ratings and reviews before hiring
- Easy booking — don't make them fill 10 forms
- Accountability — if the work is bad, there's a trail

### 2.3 Admin

The platform operators (your intern team initially).

**What they need:**
- See everything happening on the platform
- Verify worker profiles before they go live (prevent fake accounts)
- Handle disputes between workers and customers
- Monitor platform health (how many bookings, completion rate, etc.)
- Flag and remove bad actors

---

## 3. Feature Requirements

### 3.1 Worker Features

#### 3.1.1 Registration & Profile

Workers must be able to register and create a profile.

**Registration fields:**
| Field | Required? | Notes |
|-------|-----------|-------|
| Full Name | Yes | |
| Phone Number | Yes | Used for login (OTP-based) |
| Profile Photo | Yes | Face photo, helps build trust |
| Skills | Yes | Select from predefined list (can select multiple). Examples: Plumbing, Electrical, House Cleaning, Cooking, Driving, Carpentry, Painting, AC Repair, Pest Control, Gardening, Home Tutoring, Other |
| Experience | Yes | In years (dropdown: <1, 1-3, 3-5, 5-10, 10+) |
| Service Areas | Yes | Pin codes or area names where they work (multi-select) |
| Hourly Rate (₹) | Yes | Worker sets their own rate. Can be different per skill. |
| Availability | Yes | Days of the week + time slots (Morning/Afternoon/Evening) |
| Aadhaar Number | Optional | For identity verification (not shown publicly) |
| About Me | Optional | Short description of their experience, specialties |
| Languages Spoken | Optional | Multi-select: Hindi, English, Marathi, Tamil, Telugu, Bengali, etc. |

**After registration:**
- Profile goes into "Pending Verification" status
- Admin reviews and approves/rejects (see Admin section)
- Until approved, the worker does NOT appear in search results
- Worker gets notified when approved/rejected

**Profile states:**
| State | Meaning |
|-------|---------|
| pending_verification | Just registered, waiting for admin review |
| active | Approved, visible to customers |
| suspended | Temporarily disabled by admin (policy violation) |
| rejected | Admin rejected the profile (fake info, etc.) |
| inactive | Worker chose to pause their profile |

#### 3.1.2 Job Notifications

When a customer posts a job that matches a worker's skills + area:
- The worker receives a notification (via the platform + optionally email)
- The notification shows: job description, customer area, preferred date/time, budget (if provided)
- Worker can **Accept** (they're interested) or **Skip** (not interested)
- If the worker accepts, the customer is notified and can confirm the booking
- Workers have **30 minutes** to respond. After 30 minutes, the system moves to the next best match.

#### 3.1.3 Worker Dashboard

Workers see:
- **My Jobs**: Upcoming confirmed bookings, past completed jobs
- **Earnings**: Total earned this week/month (self-reported for v1, since we don't handle payments)
- **My Ratings**: Average rating, individual reviews from customers
- **My Profile**: Edit their info, change availability, update rate
- **Job Alerts**: Pending job notifications they haven't responded to yet

#### 3.1.4 Job Lifecycle (Worker View)

| Status | What the worker sees |
|--------|---------------------|
| new_alert | "New job near you! Plumbing needed in Andheri. ₹500 budget. Accept?" |
| accepted | "You accepted this job. Waiting for customer confirmation." |
| confirmed | "Booking confirmed! Customer: Rahul, Address: [shown]. Tomorrow 10 AM." |
| in_progress | "Job started. Tap 'Complete' when done." |
| completed | "Job complete. Your payment: ₹500. Rate the customer." |
| cancelled | "This job was cancelled." |

---

### 3.2 Customer Features

#### 3.2.1 Registration

Simpler than worker registration.

**Fields:**
| Field | Required? |
|-------|-----------|
| Full Name | Yes |
| Phone Number | Yes (OTP login) |
| Area / Pin Code | Yes (to match nearby workers) |
| Email | Optional |

No verification needed — customers can post jobs immediately after registration.

#### 3.2.2 Post a Job

The core customer action. Keep it dead simple.

**Job posting form:**
| Field | Required? | Notes |
|-------|-----------|-------|
| Service Category | Yes | Dropdown: Plumber, Electrician, Maid, Cook, Driver, etc. |
| Description | Yes | Free text: "Kitchen sink is leaking", "Need house cleaning for 2BHK" |
| Location / Area | Yes | Pre-filled from profile, can change |
| Preferred Date | Yes | Calendar picker, minimum today |
| Preferred Time | Yes | Morning (8-12) / Afternoon (12-4) / Evening (4-8) / Flexible |
| Budget (₹) | Optional | If left blank, workers see "Budget: Not specified" |
| Photos | Optional | Upload up to 3 photos of the problem (leaking pipe, broken switch, etc.) |

**After posting:**
- Platform finds matching workers (by skill + area + availability)
- AI ranks them by: rating, distance, price match, response history
- Top 5 workers get notified
- Customer sees: "Finding workers for you..." → then a list of workers who accepted
- Customer picks a worker → booking is confirmed

#### 3.2.3 Browse Workers

Customers can also directly browse worker profiles:
- Search by: skill category, area, rating, price range
- Each worker card shows: name, photo, skills, rating (stars), rate (₹/hr), number of jobs completed
- Click to see full profile: about, reviews, availability
- "Book Now" button → creates a direct booking request

#### 3.2.4 Booking Management

Customer can see:
- **Active Bookings**: Upcoming confirmed jobs
- **Past Bookings**: History with ratings
- **Posted Jobs**: Jobs they posted and their status (matching, confirmed, completed)

#### 3.2.5 Rating & Reviews

After a job is completed:
- Customer rates the worker: 1-5 stars
- Customer can write a text review (optional)
- Worker also rates the customer: 1-5 stars (were they respectful? did they pay on time?)

Both ratings are visible on profiles.

**Review rules:**
- Reviews can only be submitted for completed bookings
- Reviews cannot be edited after submission
- Admin can hide reviews that violate policy (abuse, fake, etc.)

---

### 3.3 Matching & Booking System

This is the brain of the platform.

#### 3.3.1 How Matching Works

When a customer posts a job:

1. **Filter**: Find workers where:
   - Worker has the required skill
   - Worker serves the customer's area
   - Worker is available on the requested date/time
   - Worker profile status is "active"

2. **Rank** (AI-assisted): Score each matching worker by:
   - **Rating** (higher is better) — weight: 40%
   - **Distance/Area match** (closer is better) — weight: 25%
   - **Price match** (closer to budget is better) — weight: 20%
   - **Response rate** (workers who accept more jobs rank higher) — weight: 15%

3. **Notify**: Send job alert to top 5 ranked workers

4. **Wait**: Workers have 30 minutes to accept. As workers accept, show them to the customer.

5. **Customer chooses**: Customer picks from workers who accepted → booking confirmed

6. **Fallback**: If <2 workers accept in 30 minutes, notify the next 5. If no one accepts in 2 hours, notify customer: "We couldn't find a worker. Try changing the date or expanding your area."

#### 3.3.2 Booking States

```
job_posted → matching → worker_accepted → customer_confirmed → in_progress → completed → rated
                                        → customer_rejected (customer didn't like any worker)
                          → expired (no worker responded)
            → cancelled_by_customer
                                                            → cancelled_by_worker
                                                            → disputed
```

| State | Description |
|-------|-------------|
| job_posted | Customer submitted the job |
| matching | System is finding and notifying workers |
| worker_accepted | One or more workers have accepted, waiting for customer to pick |
| customer_confirmed | Customer chose a worker, booking is confirmed |
| customer_rejected | Customer didn't want any of the available workers |
| expired | No workers responded within 2 hours |
| in_progress | Worker has started the job |
| completed | Worker marked the job as done |
| rated | Both parties have submitted ratings |
| cancelled_by_customer | Customer cancelled before the job started |
| cancelled_by_worker | Worker cancelled (this hurts their rating) |
| disputed | Either party raised a dispute — admin handles |

#### 3.3.3 Cancellation Rules

| Who cancels | When | Consequence |
|-------------|------|-------------|
| Customer | >2 hours before job | No penalty |
| Customer | <2 hours before job | Warning. 3 late cancellations → account review |
| Worker | Any time before job | Their "reliability score" drops. Shown on profile. |
| Worker | No-show (doesn't mark in-progress) | Automatic 1-star penalty + admin alert |

---

### 3.4 Notification & Automation Requirements

These are the automated workflows the platform must run. This is where n8n is used.

#### 3.4.1 Notification Triggers

| Event | Who gets notified | Channel | Timing |
|-------|------------------|---------|--------|
| New job posted matching their skills | Workers (top 5) | In-app + Email | Immediate |
| Worker accepts their job | Customer | In-app + Email | Immediate |
| Customer confirms booking | Worker | In-app + Email | Immediate |
| Booking is tomorrow | Both worker + customer | Email | 1 day before, at 8 PM |
| Booking is in 1 hour | Both worker + customer | Email | 1 hour before |
| Job marked complete | Customer (rate prompt) | In-app + Email | Immediate |
| Job marked complete | Worker (rate prompt) | In-app + Email | Immediate |
| Rating received | The rated person | In-app | Immediate |
| Worker didn't respond in 30 min | Next batch of workers | In-app + Email | After 30 min |
| No worker found in 2 hours | Customer | In-app + Email | After 2 hours |
| Worker profile approved | Worker | Email | Immediate |
| Worker profile rejected | Worker | Email + reason | Immediate |
| Worker cancelled a booking | Customer | In-app + Email | Immediate |
| Customer cancelled a booking | Worker | In-app + Email | Immediate |
| Dispute raised | Admin | In-app + Email | Immediate |

#### 3.4.2 Scheduled Automations

| Automation | Schedule | What it does |
|------------|----------|-------------|
| Daily Worker Summary | Every day, 8 PM | Email each active worker: jobs completed today, earnings, upcoming bookings |
| Daily Admin Report | Every day, 9 AM | Email admin: new signups, bookings yesterday, completion rate, open disputes |
| Weekly Platform Report | Every Monday, 9 AM | Email admin: weekly stats, top workers, growth metrics |
| Stale Job Cleanup | Every hour | Jobs in "matching" for >2 hours → mark as "expired", notify customer |
| Inactive Worker Ping | Every 7 days | Workers who haven't logged in for 7 days → "We miss you! Update your availability" |
| Review Reminder | 24 hours after completion | If customer hasn't rated → "How was your experience with [worker]?" |

#### 3.4.3 AI Automations

| Feature | Input | AI Does | Output |
|---------|-------|---------|--------|
| Lead Scoring | Job description text | Classify urgency: Urgent (today/tomorrow), Normal (this week), Flexible (no rush) | urgency tag on the job |
| Smart Matching | Worker profiles + job requirements | Rank workers by fit score | Ordered list of workers |
| Fake Review Detection | Review text + patterns | Flag reviews that look fake (too generic, submitted too fast, suspicious patterns) | Flag for admin review |
| Auto-Reply Suggestions | Customer inquiry + worker profile | Draft a professional response for the worker to send | Suggested message text |
| Job Description Enhancement | Raw customer input | Clean up and standardize the description | Enhanced description |

---

### 3.5 Admin Features

#### 3.5.1 Admin Dashboard

The admin panel is a separate web interface showing:

**Overview Cards (top of page):**
- Total Workers (active / pending / suspended)
- Total Customers
- Bookings Today / This Week / This Month
- Completion Rate (completed ÷ total bookings, as %)
- Average Rating (platform-wide)
- Open Disputes

**Charts:**
- Bookings per day (line chart, last 30 days)
- New signups per day (workers + customers, stacked bar)
- Bookings by category (which services are most popular — pie chart)
- Earnings distribution (what workers are charging — histogram)
- Ratings distribution (bar chart: 1-star to 5-star counts)

**Tables:**
- Recent bookings (sortable, filterable)
- Recent signups
- Open disputes

#### 3.5.2 Worker Verification Queue

Admin sees a list of workers with status "pending_verification":
- Worker's submitted info: name, photo, skills, experience, area, rate
- Aadhaar number (if provided)
- Admin actions: **Approve** / **Reject** (with reason dropdown: fake info, inappropriate photo, duplicate account, other)
- Approved workers become "active" and appear in search
- Rejected workers get an email with the reason

#### 3.5.3 Dispute Management

When a customer or worker raises a dispute:
- Admin sees: who raised it, the booking details, both parties' statements
- Admin can: contact either party, add notes, resolve with a decision
- Resolution options: refund recommended, worker warned, worker suspended, customer warned, no action
- Both parties are notified of the resolution

#### 3.5.4 User Management

- Search users by name, phone, role
- View any user's profile, booking history, ratings
- Suspend/unsuspend accounts
- See flagged reviews (from AI fake detection)

---

### 3.6 Non-Functional Requirements

#### 3.6.1 Performance
- Pages must load in <3 seconds on 4G connections
- API responses in <500ms for standard queries
- Platform should handle 1000 concurrent users (target for v1)

#### 3.6.2 Mobile-First
- All pages must work on mobile screens (360px width minimum)
- Touch-friendly: buttons at least 44px tall, no tiny links
- Minimal data usage: compress images, lazy load, no unnecessary JavaScript
- Works on Chrome for Android (80%+ of Indian mobile users)

#### 3.6.3 Language
- v1: English + Hindi (UI labels in both, user-generated content stays as-is)
- AI can translate job descriptions between Hindi and English

#### 3.6.4 Security
- Phone OTP authentication (no passwords)
- Aadhaar numbers encrypted at rest, never shown in full to anyone except admin
- Row-Level Security: workers can only see/edit their own data, customers only their own, admin sees all
- Rate limiting on all API endpoints
- No PII in URL parameters

#### 3.6.5 Data Privacy
- Workers can delete their account and all data
- Customer phone numbers are hidden from workers until booking is confirmed
- Aadhaar data is only used for verification, stored encrypted

---

## 4. Tech Stack (Mandatory)

These tools must be used. This is a learning exercise.

| Layer | Tool | Why |
|-------|------|-----|
| Database + Auth | **Supabase** (free tier) | Postgres database, phone OTP auth, Row-Level Security, storage for photos |
| Frontend (Customer + Worker) | **Next.js on Vercel** (free tier) | Server-side rendering, fast, good for SEO, deploys in 1 click |
| Backend API | **Node.js (Express) on Railway** (free tier) | API server, business logic, connects to Supabase and n8n |
| Automations | **n8n** (free cloud or self-hosted) | All notification workflows, scheduled jobs, webhook handling |
| AI Features | **Google Gemini API** (free tier via AI Studio) | Matching, scoring, fake detection, translations |
| Code Collaboration | **GitHub** | Branches, pull requests, code review |
| AI Coding Assistants | **ChatGPT, Claude, Google Antigravity IDE** | For building — interns use AI agents to generate code |

---

## 5. Pages / Screens

### 5.1 Public Pages (no login required)
| Page | URL | Purpose |
|------|-----|---------|
| Landing Page | / | Explains KaamChalu, has "Find a Worker" and "Register as Worker" CTAs |
| Worker Directory | /workers | Browse workers by category and area |
| Worker Profile | /workers/[id] | Public profile: name, photo, skills, rating, reviews |

### 5.2 Customer Pages (login required)
| Page | URL | Purpose |
|------|-----|---------|
| Customer Dashboard | /dashboard | Active bookings, past bookings, post a job |
| Post a Job | /jobs/new | The job posting form |
| My Jobs | /jobs | List of all posted jobs with status |
| Job Detail | /jobs/[id] | See matched workers, pick one, track status |
| Rate Worker | /bookings/[id]/rate | Submit rating + review after completion |

### 5.3 Worker Pages (login required)
| Page | URL | Purpose |
|------|-----|---------|
| Worker Dashboard | /worker/dashboard | Earnings, upcoming jobs, alerts |
| Job Alerts | /worker/alerts | List of available jobs to accept/skip |
| My Bookings | /worker/bookings | Confirmed and past bookings |
| My Profile | /worker/profile | Edit profile, change availability, update rate |
| Rate Customer | /bookings/[id]/rate | Submit rating after completion |

### 5.4 Admin Pages (admin login required)
| Page | URL | Purpose |
|------|-----|---------|
| Admin Dashboard | /admin | Stats overview, charts, recent activity |
| Verification Queue | /admin/verify | Pending worker profiles to approve/reject |
| All Users | /admin/users | Search, view, suspend users |
| All Bookings | /admin/bookings | All bookings, filterable |
| Disputes | /admin/disputes | Open disputes, resolve them |
| Reports | /admin/reports | Downloadable reports |

---

## 6. Success Metrics (How we know it's working)

| Metric | Target (v1) | How to measure |
|--------|------------|----------------|
| Workers registered | 50+ | Supabase count |
| Customers registered | 100+ | Supabase count |
| Jobs posted | 200+ | Supabase count |
| Booking completion rate | >70% | completed ÷ confirmed bookings |
| Average worker rating | >4.0 stars | Supabase average |
| Worker response time | <30 minutes | Time between notification and accept |
| Customer time-to-book | <2 hours | Time between job post and booking confirmed |

---

## 7. What's NOT in v1 (Future)

These are intentionally excluded from the first version:
- **Payments**: No in-app payments. Workers and customers settle directly (cash/UPI). Payment integration comes in v2.
- **Mobile App**: Web only in v1. React Native app in v2.
- **Chat**: No in-app messaging. Communication happens via phone after booking confirmation. Chat in v2.
- **Worker Location Tracking**: No live GPS tracking. In v2.
- **Subscription/Premium Plans**: All features free in v1. Monetization model in v2.
- **Multi-city Automation**: v1 targets one city. Scaling logic in v2.

---

## 8. Intern Assignment Instructions

**READ THIS CAREFULLY.**

You have received this PRD. Now your job is to:

### Step 1: Understand the Product (Day 1)
- Read this entire document. Every section.
- Each intern writes down 5 questions about anything they don't understand.
- Discuss as a team. Use ChatGPT/Claude to research answers.
- If still unclear, ask Meer.

### Step 2: Create the Product Spec (Day 2)
As a team, produce a document called `PRODUCT-SPEC.md` that breaks down:
- Every database table with exact column names, types, and relationships
- Every API endpoint with request/response format
- Every n8n workflow with trigger → steps → output
- Every AI feature with input → prompt → output
- Every page with what data it shows and what actions it supports

Use AI to help you draft this, but YOU must decide what goes in it. This is your blueprint.

### Step 3: Create the Architecture Diagram (Day 2-3)
Create a visual diagram showing:
- How the frontend, backend, database, n8n, and AI connect
- Which direction data flows (arrows)
- What each tool is responsible for
- Where things are hosted

Use any tool: draw.io (free), Excalidraw (free), pen and paper + photo. Put it in `docs/architecture.png`

### Step 4: Create the Execution Plan (Day 3)
Break the project into epics (big chunks) and tasks (small steps within each epic).
Put this in `EXECUTION-PLAN.md`.

Suggested epic structure (you can modify):
- Epic 1: Project setup (repo, accounts, tools, skeleton code)
- Epic 2: Database schema + Auth (Supabase setup, RLS, OTP login)
- Epic 3: Core API (all CRUD endpoints on Railway)
- Epic 4: Worker registration + profile pages
- Epic 5: Customer job posting + worker browsing
- Epic 6: Matching & booking system
- Epic 7: n8n automations (notifications, reminders, scheduled jobs)
- Epic 8: AI features (matching, scoring, fake detection)
- Epic 9: Admin dashboard + verification
- Epic 10: Integration testing + deployment
- Epic 11: Real user testing

Each task within an epic should be:
- Small enough to finish in 1 day
- Assigned to one person
- Have a clear "done" definition

### Step 5: Pick Roles (Day 3)
Decide among yourselves who takes which role:
- **Frontend Person** — builds all the web pages
- **Backend Person** — builds the API and database
- **Automation Person** — builds all n8n workflows
- **AI + Admin Person** — builds AI features and admin dashboard

Choose based on what interests you, not what's easiest. You'll learn the most from what challenges you.

### Step 6: Start Building (Day 4 onwards)
Follow your execution plan. Use the daily standup format:
1. What did I finish yesterday?
2. What am I doing today?
3. Am I blocked by anyone?

---

## 9. Glossary

| Term | Meaning |
|------|---------|
| Worker | A person who provides a service (plumber, maid, etc.) |
| Customer | A person who needs a service done |
| Job | A service request posted by a customer |
| Booking | A confirmed match between a worker and a job |
| Matching | The process of finding suitable workers for a job |
| RLS | Row-Level Security — database rules that control who can see what data |
| OTP | One-Time Password — sent to phone for login |
| n8n | Automation tool for building workflows (pronounced "n-eight-n") |
| Webhook | A URL that receives data when something happens (like a notification endpoint) |
| API | Application Programming Interface — how the frontend talks to the backend |
| CRUD | Create, Read, Update, Delete — the basic operations on data |
| Epic | A large chunk of work containing multiple related tasks |
| Aadhaar | Indian government ID number (12 digits) |
| UPI | Unified Payments Interface — India's instant payment system |
