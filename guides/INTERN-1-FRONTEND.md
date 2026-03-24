# Intern 1 — Frontend Person Guide

> **Your Role**: You build everything the user SEES and TOUCHES.
> **Your Tools**: Antigravity IDE, Vercel, GitHub, ChatGPT/Claude
> **Your Stack**: Next.js (React framework), Tailwind CSS, hosted on Vercel

---

## What You Own

You are responsible for ALL web pages:
- Public pages (landing, worker directory, worker profile)
- Customer pages (dashboard, post job, my jobs, job detail, rate worker)
- Worker pages (dashboard, alerts, bookings, profile, rate customer)
- Login/signup pages

You do NOT build:
- Admin pages (that's Intern 4)
- Backend API (that's Intern 2)
- Automations (that's Intern 3)
- AI features (that's Intern 4)

---

## Your Dependencies (Who you need)

| You need from | What | When |
|---------------|------|------|
| **Intern 2** | Supabase project URL + anon key | Day 1 |
| **Intern 2** | Working API endpoints with docs | Before you connect real data |
| **Intern 4** | Nothing — they depend on you | — |
| **Intern 3** | Nothing — they work with Intern 2 | — |

**You are blocked until Intern 2 gives you the API docs.** While waiting, build all pages with FAKE data. Replace with real API calls later.

---

## Setup (Do this on Day 1 of building)

### Step 1: Accounts
1. Go to **github.com** → Sign up (if you haven't)
2. Go to **vercel.com** → Sign in with GitHub
3. Install **Node.js** from nodejs.org
4. Install **Google Antigravity IDE**

### Step 2: Create the Next.js project

Open your terminal. Navigate to the project repo (Meer will have created it).

Ask Antigravity:
> Create a new Next.js 14 app in the `frontend/` folder with:
> - App Router (not Pages Router)
> - Tailwind CSS for styling
> - TypeScript
> - src/ directory
>
> Just the scaffold, no extra code. Give me the terminal commands to run.

Run the commands it gives you.

### Step 3: Deploy to Vercel immediately

Even with nothing built, deploy now so you know it works:
1. Go to vercel.com → "Add New Project"
2. Import your GitHub repo
3. Set root directory to `frontend/`
4. Deploy
5. You should see the default Next.js page on a .vercel.app URL
6. Share this URL in the team group chat

**From now on, every time you push to `main`, Vercel auto-deploys.**

### Step 4: Set up Supabase client

Get the Supabase URL and anon key from Intern 2.

Ask Antigravity:
> Set up Supabase client in my Next.js app:
> 1. Install @supabase/supabase-js and @supabase/ssr
> 2. Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
> 3. Create a supabase client utility file at src/lib/supabase.ts (for client-side) and src/lib/supabase-server.ts (for server-side)
> 4. Create a .env.example with placeholder values
>
> I'm using Next.js 14 App Router with TypeScript.

---

## Phase 1: Auth Pages (Epic 2)

### Task 1.1: Login Page

Ask Antigravity:
> Build a login page at src/app/login/page.tsx for my Next.js app:
>
> - Phone number input field (Indian format: 10 digits)
> - "Send OTP" button
> - After clicking, show an OTP input (6 digits)
> - "Verify OTP" button
> - Use Supabase Auth phone OTP: supabase.auth.signInWithOtp({ phone })
> - After verification, redirect to /dashboard
> - Clean, mobile-first design with Tailwind CSS
> - Show loading states on buttons
> - Show error messages if OTP fails
> - Add the country code +91 automatically
>
> For now, use the Supabase client from src/lib/supabase.ts
> Don't build the actual Supabase auth yet — I'll connect it when Intern 2 is ready.
> Use a mock function that just console.logs for now.

**Test**: Open localhost:3000/login on your phone browser (use your local IP). Does it look good on a small screen?

### Task 1.2: Signup Page — Worker

Ask Antigravity:
> Build a worker registration page at src/app/signup/worker/page.tsx:
>
> - Step 1: Phone number + OTP verification (same as login)
> - Step 2: Profile form with these fields:
>   - Full Name (text input)
>   - Profile Photo (file upload with preview)
>   - Skills (multi-select checkboxes): Plumbing, Electrical, House Cleaning, Cooking, Driving, Carpentry, Painting, AC Repair, Pest Control, Gardening, Home Tutoring, Other
>   - Experience (dropdown): Less than 1 year, 1-3 years, 3-5 years, 5-10 years, 10+ years
>   - Service Areas (multi-select or text input for pin codes/area names)
>   - Hourly Rate in ₹ (number input)
>   - Availability: checkboxes for days (Mon-Sun) × time slots (Morning/Afternoon/Evening)
>   - Aadhaar Number (optional, text input)
>   - About Me (textarea, optional)
>   - Languages Spoken (multi-select): Hindi, English, Marathi, Tamil, Telugu, Bengali, Kannada, Other
> - Submit button: "Register as Worker"
> - After submit: show "Your profile is under review. We'll notify you once approved!"
>
> Use Tailwind CSS. Mobile-first. Must work on a ₹10,000 Android phone.
> Break the form into steps/sections so it's not overwhelming.
> For now, console.log the form data on submit. We'll connect to the API later.

**Test**: Fill out the entire form on your phone. Is anything confusing? Too small? Hard to tap?

### Task 1.3: Signup Page — Customer

Ask Antigravity:
> Build a customer registration page at src/app/signup/customer/page.tsx:
>
> - Phone number + OTP verification
> - Then: Full Name, Area/Pin Code, Email (optional)
> - Submit → redirect to /dashboard
> - Much simpler than worker signup
> - Mobile-first, Tailwind CSS

### Task 1.4: Role Selection Page

Ask Antigravity:
> Build a role selection page at src/app/signup/page.tsx:
>
> - Heading: "Join KaamChalu"
> - Two big cards:
>   - "I need work" → links to /signup/worker (with an icon of a worker/tools)
>   - "I need a worker" → links to /signup/customer (with an icon of a house/person)
> - Clean, simple, two big tappable cards
> - Mobile-first

### Task 1.5: Auth middleware

Ask Antigravity:
> Create a Next.js middleware at src/middleware.ts that:
> - Checks if the user is logged in (has a Supabase session)
> - If NOT logged in and trying to access /dashboard, /jobs, /worker → redirect to /login
> - If logged in and going to /login or /signup → redirect to /dashboard
> - Public pages (/, /workers, /workers/[id]) don't need login
> - Admin pages (/admin/*) require admin role

---

## Phase 2: Public Pages (Epic 4-5)

### Task 2.1: Landing Page

Ask Antigravity:
> Build the KaamChalu landing page at src/app/page.tsx:
>
> - Hero section:
>   - Headline: "India's Platform for Skilled Workers" (in English and Hindi)
>   - Subheadline: "Find trusted plumbers, electricians, maids, and more near you"
>   - Two CTA buttons: "Find a Worker" (→ /workers) and "Register as Worker" (→ /signup/worker)
>
> - How it works section (3 steps):
>   - Step 1: "Post your need" — describe what you need done
>   - Step 2: "Get matched" — we find skilled workers near you
>   - Step 3: "Get it done" — book, get work done, rate
>
> - Categories section:
>   - Grid of service categories with icons: Plumbing, Electrical, Cleaning, Cooking, Driving, Carpentry, Painting, AC Repair, Pest Control, Gardening, Tutoring
>   - Each one is clickable → /workers?category=plumbing
>
> - Stats section: "500+ Workers | 1000+ Jobs Completed | 4.5★ Average Rating" (hardcoded for now)
>
> - Footer: About, Contact, Terms
>
> Use Tailwind CSS. Modern, clean design. Indian color palette (think warm oranges, whites, grays).
> Must look great on mobile AND desktop.

### Task 2.2: Worker Directory Page

Ask Antigravity:
> Build a worker directory page at src/app/workers/page.tsx:
>
> - Search/filter bar at top:
>   - Category dropdown (Plumber, Electrician, etc.)
>   - Area/location text input
>   - Sort by: Rating, Price (low to high), Price (high to low), Experience
>
> - Worker cards in a grid (2 columns on mobile, 3-4 on desktop):
>   - Profile photo (circular)
>   - Name
>   - Skills (badges/tags)
>   - Rating (★ 4.5 with star icons)
>   - Rate: "₹500/hr"
>   - Jobs completed: "47 jobs"
>   - "View Profile" button
>
> - Pagination or infinite scroll
>
> For now, use an array of 10 fake workers with realistic Indian names and data.
> Later we'll fetch from GET /api/workers.
>
> Use Tailwind CSS, mobile-first.

### Task 2.3: Worker Profile Page

Ask Antigravity:
> Build a worker profile page at src/app/workers/[id]/page.tsx:
>
> - Header: Large profile photo, name, verified badge (if approved)
> - Info: Skills (badges), experience, languages, service areas
> - Rate: "₹500/hr"
> - Availability: visual grid showing which days/times they work
> - Stats: Jobs completed, average rating, member since
> - "Book This Worker" button (if logged in as customer)
> - Reviews section: list of customer reviews with star rating, name, date, text
>
> - Share button: "Share on WhatsApp" (generates a WhatsApp share link with the profile URL)
>
> For now, use fake data. Later fetch from GET /api/workers/[id].
> Mobile-first, Tailwind CSS.

---

## Phase 3: Customer Pages (Epic 5-6)

### Task 3.1: Customer Dashboard

Ask Antigravity:
> Build a customer dashboard at src/app/dashboard/page.tsx:
>
> - Welcome message: "Hi, [name]!"
> - Quick action: "Post a New Job" button (big, prominent)
>
> - Active Bookings section:
>   - Cards showing: worker name, service, date/time, status badge (confirmed/in-progress)
>   - Tap to see details
>
> - Recent Jobs section:
>   - List of past jobs with: service category, worker name, date, status, rating given
>
> - If no bookings: show empty state "You haven't posted any jobs yet. Find a worker!"
>
> Use fake data for now. Mobile-first, Tailwind.

### Task 3.2: Post a Job Page

Ask Antigravity:
> Build a job posting page at src/app/jobs/new/page.tsx:
>
> - Form fields:
>   - Service Category (dropdown): Plumbing, Electrical, House Cleaning, Cooking, etc.
>   - Description (textarea): placeholder "Describe what you need done..."
>   - Location/Area (text input, pre-filled from user profile if available)
>   - Preferred Date (date picker, minimum today)
>   - Preferred Time (radio buttons): Morning (8-12), Afternoon (12-4), Evening (4-8), Flexible
>   - Budget in ₹ (number input, optional): placeholder "Leave blank if flexible"
>   - Photos (file upload, max 3): "Add photos of the problem (optional)"
>
> - Submit button: "Find Workers"
> - After submit: redirect to /jobs/[id] which shows the matching status
>
> For now, console.log the data. Later POST to /api/jobs.
> Mobile-first. Keep it SIMPLE — one screen, no steps.

### Task 3.3: Job Detail Page

Ask Antigravity:
> Build a job detail page at src/app/jobs/[id]/page.tsx:
>
> This page shows different content based on the job status:
>
> **Status: matching**
> - Show: "Finding workers for you..." with a loading animation
> - Below: the job details (service, description, date, budget)
>
> **Status: worker_accepted**
> - Show: list of workers who accepted
> - Each worker card: photo, name, rating, rate, "Confirm This Worker" button
> - Job details below
>
> **Status: customer_confirmed**
> - Show: "Booking Confirmed!" with green checkmark
> - Worker details: name, photo, phone (revealed now), rating
> - Job details: date, time, location
> - "Cancel Booking" button (with confirmation dialog)
>
> **Status: in_progress**
> - Show: "Work in Progress" with worker details
> - "Contact Worker" button (tel: link to call)
>
> **Status: completed**
> - Show: "Job Complete!"
> - If not rated: show rating form (1-5 stars, optional review text)
> - If rated: show the rating you gave
>
> Use a switch/case or if-else to render different UI per status.
> Fake data for now with a dropdown to test each status.
> Mobile-first, Tailwind.

### Task 3.4: Rate Worker Page

Ask Antigravity:
> Build a rating page at src/app/bookings/[id]/rate/page.tsx:
>
> - Show booking summary: worker name, service, date
> - Star rating: 1-5 tappable stars (big, easy to tap on mobile)
> - Review text (textarea, optional): "How was your experience?"
> - Submit button
> - After submit: "Thank you for your review!" → redirect to /dashboard
>
> Stars should be interactive — tap star 4 fills stars 1-4.
> Mobile-first.

---

## Phase 4: Worker Pages (Epic 4)

### Task 4.1: Worker Dashboard

Ask Antigravity:
> Build a worker dashboard at src/app/worker/dashboard/page.tsx:
>
> - Stats cards at top:
>   - "Jobs This Week: 5"
>   - "Earnings This Week: ₹4,500" (self-reported)
>   - "My Rating: ★ 4.6"
>
> - Job Alerts section:
>   - Count badge: "3 new job alerts"
>   - Link to /worker/alerts
>
> - Upcoming Bookings:
>   - Cards: customer name, service, date/time, location, status
>   - "Start Job" button (for confirmed jobs whose time has come)
>   - "Complete Job" button (for in-progress jobs)
>
> - Recent Reviews:
>   - Last 3 reviews from customers
>
> Fake data for now. Mobile-first, Tailwind.

### Task 4.2: Job Alerts Page

Ask Antigravity:
> Build a job alerts page at src/app/worker/alerts/page.tsx:
>
> - List of job notifications:
>   - Each card shows: service category, customer area, date/time, budget (if provided), description preview
>   - Two buttons per card: "Accept" (green) and "Skip" (gray)
>   - Show time remaining: "Respond within 28 minutes" (countdown from 30 min)
>
> - After accepting: card changes to "Accepted — waiting for customer confirmation"
> - After skipping: card disappears
>
> - Empty state: "No new jobs right now. We'll notify you when something matches!"
>
> Fake data for now. Mobile-first, Tailwind.

### Task 4.3: Worker Profile Edit Page

Ask Antigravity:
> Build a worker profile edit page at src/app/worker/profile/page.tsx:
>
> - Pre-filled form with all worker profile fields (same as registration)
> - Editable: name, photo, skills, experience, areas, rate, availability, about, languages
> - NOT editable: phone number, Aadhaar (show grayed out)
> - "Save Changes" button
> - "Pause My Profile" toggle — sets profile to inactive (hidden from search)
> - "Delete My Account" link at the bottom (with scary confirmation dialog)
>
> Fake data for now. Mobile-first.

### Task 4.4: Worker Bookings Page

Ask Antigravity:
> Build a worker bookings page at src/app/worker/bookings/page.tsx:
>
> - Two tabs: "Upcoming" and "Past"
> - Upcoming tab: confirmed bookings with customer name, service, date, time, location
> - Past tab: completed jobs with customer name, date, earnings, rating received
> - Tap any booking to see details
>
> Fake data. Mobile-first.

---

## Phase 5: Connect to Real API (Epic 6)

This is where you replace all fake data with real API calls.

**Get from Intern 2**: The API base URL and the full API documentation (`docs/API.md`).

### How to connect each page:

For each page, ask Antigravity:
> I have a page that currently uses fake data. I need to connect it to a real API.
>
> API base URL: [INTERN 2's URL]
>
> Current page code: [paste your code]
>
> Replace the fake data with:
> - Fetch data from: GET [endpoint] (for loading data)
> - Submit data to: POST/PATCH [endpoint] (for forms)
>
> The API expects/returns this format: [paste from Intern 2's API docs]
>
> Add loading states (show spinner while fetching).
> Add error states (show error message if API fails).
> Use the Supabase auth token in the Authorization header.

Do this one page at a time. Test each page after connecting. Don't move on until it works.

**Connection order** (easiest to hardest):
1. Worker directory (GET /api/workers) — read only
2. Worker profile (GET /api/workers/[id]) — read only
3. Login/signup — auth with Supabase
4. Post a job (POST /api/jobs) — write
5. Customer dashboard (GET /api/bookings) — read
6. Job detail (GET /api/jobs/[id] + PATCH) — read + write
7. Worker dashboard (GET /api/worker/stats) — read
8. Job alerts (GET /api/worker/alerts + PATCH) — read + write
9. Rating (POST /api/ratings) — write

---

## Phase 6: Polish (Epic 10)

### Task 6.1: Navigation

Ask Antigravity:
> Create a shared navigation component for my Next.js app:
>
> - If NOT logged in: show "Login" and "Sign Up" buttons
> - If logged in as CUSTOMER: show links to Dashboard, My Jobs, Find Workers, and a profile menu
> - If logged in as WORKER: show links to Dashboard, Alerts, Bookings, Profile, and a profile menu
> - Mobile: hamburger menu that slides in from the side
> - Desktop: horizontal nav bar
> - KaamChalu logo on the left (text logo is fine)
> - Show the user's name or phone in the profile menu
> - Logout option in profile menu

### Task 6.2: Loading and Error States

Go through EVERY page and make sure:
- While data is loading: show a skeleton loader or spinner (not a blank page)
- If API fails: show a friendly error message with a "Try Again" button
- If no data: show an empty state with a helpful message

Ask Antigravity to add these to each page one by one.

### Task 6.3: Mobile Testing

Open every page on your phone (use your Vercel deployment URL).
Check:
- Can you tap every button easily?
- Do forms work? Can you type in every field?
- Does it scroll properly?
- Is any text too small to read?
- Does it work on slow 4G? (Chrome DevTools → Network → Slow 3G)

Fix every issue you find.

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---------|-------------------|
| Building all pages at once | Build one, test it, then move to the next |
| Making it work on desktop only | Test on your phone FIRST, desktop second |
| Not testing with real data | As soon as Intern 2's API is ready, connect and test |
| Ignoring error states | Every API call can fail. Handle it. |
| Giant prompts to Antigravity | One page at a time. One feature at a time. |
| Not committing to git | Commit after every working feature |
| Waiting silently for Intern 2 | Build with fake data. Tell Intern 2 in standup what you need. |

---

## Daily Checklist

Before you end each day:
- [ ] Did I commit my code to git?
- [ ] Did I push to GitHub?
- [ ] Does my Vercel deployment work?
- [ ] Did I test on mobile?
- [ ] Did I update the team on what's done?
