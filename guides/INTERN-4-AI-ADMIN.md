# Intern 4 — AI + Admin Dashboard Person Guide

> **Your Role**: You build the AI brain (scoring, matching, fake detection) and the admin panel where the platform is managed.
> **Your Tools**: Google Gemini API, Antigravity IDE, Vercel, ChatGPT/Claude, GitHub
> **Your Stack**: Google Gemini (free), Next.js + Tailwind + Chart.js on Vercel

---

## What You Own

Two distinct areas:

**Area 1 — AI Features:**
- Lead/urgency scoring (classify how urgent a job request is)
- Smart worker matching (rank workers by fit)
- Fake review detection (flag suspicious reviews)
- Auto-reply suggestions (draft messages for workers)
- Job description enhancement (clean up customer input)

**Area 2 — Admin Panel:**
- Admin dashboard (stats, charts, overview)
- Worker verification queue (approve/reject profiles)
- User management (search, view, suspend)
- Booking management (all bookings, filterable)
- Dispute management (review, resolve disputes)
- Reports page

You do NOT build:
- Customer/worker facing pages (that's Intern 1)
- API endpoints (that's Intern 2, but you'll tell them what data you need)
- n8n workflows (that's Intern 3, but you'll coordinate on AI integration)

---

## How Your Work Connects

```
Intern 2's API ──calls──→ YOUR AI scoring functions
Intern 3's n8n ──calls──→ YOUR AI scoring functions (via API or directly to Gemini)
YOUR Admin Panel ──calls──→ Intern 2's API ──reads/writes──→ Database
```

**AI features** are called by Intern 2 (from the API) and Intern 3 (from n8n).
**Admin panel** calls Intern 2's admin API endpoints.

---

## Your Dependencies

| You need from | What | When |
|---------------|------|------|
| **Intern 2** | Admin API endpoints (GET /api/admin/*) | Before building admin pages |
| **Intern 2** | API for ratings data (to build fake detection) | Before Phase 3 |
| **Intern 3** | Nothing — they call YOUR AI functions | — |
| **Intern 1** | Nothing — you work independently | — |

**While waiting for Intern 2**: Build all AI functions first. Build admin pages with fake data.

---

## Setup (Day 1)

### Step 1: Accounts
1. **Google AI Studio**: Go to aistudio.google.com → Sign in with Google → Click "Get API Key" → Create key → Save it somewhere safe
2. **Vercel**: Go to vercel.com → Sign in with GitHub
3. Install **Node.js** from nodejs.org
4. Install **Google Antigravity IDE**

### Step 2: Test the Gemini API

Ask Antigravity:
> Create a simple Node.js script at ai/test-gemini.js that:
> 1. Reads GEMINI_API_KEY from a .env file
> 2. Sends this prompt to the Google Gemini API (use the free gemini-2.0-flash model):
>    "You are a helpful assistant. Say hello in Hindi and English."
> 3. Prints the response
>
> Use the @google/generative-ai npm package.
> Show me the .env.example and package.json too.

Run it:
```
cd ai
npm install
echo "GEMINI_API_KEY=your-key-here" > .env
node test-gemini.js
```

If you see a response, your AI setup works. If not, paste the error into Antigravity.

### Step 3: Create the admin Next.js app

The admin panel is a SEPARATE Next.js app (or a section of Intern 1's app — decide with the team).

**Option A — Separate app (recommended for learning)**:

Ask Antigravity:
> Create a new Next.js 14 app in the `admin/` folder with:
> - App Router
> - Tailwind CSS
> - TypeScript
> - src/ directory
>
> Just the scaffold. Give me the terminal commands.

**Option B — Inside Intern 1's app**:
Build your pages at `frontend/src/app/admin/` inside Intern 1's Next.js app.
Coordinate with Intern 1 so you don't step on each other's code.

---

## PART 1: AI FEATURES

---

## Phase 1: Urgency Scoring (Epic 8)

### Task 1.1: Build the urgency classifier

Ask Antigravity:
> Create a Node.js module at ai/src/urgency-scorer.js that:
>
> 1. Exports a function: scoreUrgency(description, preferredDate)
> 2. Sends this prompt to Gemini:
>
> "You are a job urgency classifier for a blue-collar service platform in India.
>
> Based on the job description and requested date, classify the urgency:
> - URGENT: Emergency situations, same-day/next-day needs, words like 'leaking', 'broken', 'not working', 'emergency', 'urgent', 'ASAP'
> - NORMAL: Needs to be done this week, standard maintenance, scheduled work
> - FLEXIBLE: No rush, exploring options, future planning, words like 'whenever', 'no hurry', 'when available'
>
> Job description: {description}
> Requested date: {preferredDate}
>
> Reply with ONLY one word: URGENT, NORMAL, or FLEXIBLE."
>
> 3. Returns the classification as a lowercase string
> 4. If the AI returns something unexpected, default to "normal"
> 5. Handle errors gracefully — if the API fails, return "normal" (don't crash)
>
> Include a test at the bottom that runs 3 test cases:
> - "Kitchen sink is flooding water everywhere, need help NOW" → should be urgent
> - "Need to get my AC serviced before summer" → should be normal
> - "Thinking about repainting the house sometime" → should be flexible

**Test it**: Run the file, check the classifications make sense.

### Task 1.2: Build the urgency API endpoint

This endpoint will be called by Intern 2's API (or Intern 3's n8n workflow).

Ask Antigravity:
> Create a simple Express server at ai/src/server.js that:
>
> 1. Has a POST /api/ai/score-urgency endpoint
>    - Body: { description: "...", preferred_date: "2026-03-25" }
>    - Calls the scoreUrgency function
>    - Returns: { urgency: "urgent" | "normal" | "flexible" }
>
> 2. Has a GET /health endpoint
>    - Returns: { status: "ok" }
>
> 3. Uses CORS, reads port from .env
>
> This is a separate microservice that other parts of the platform call.

Tell Intern 2 and Intern 3:
> "My urgency scoring API is at: POST http://localhost:4000/api/ai/score-urgency
> Send: { description, preferred_date }
> Get back: { urgency: 'urgent' | 'normal' | 'flexible' }"

---

## Phase 2: Smart Worker Matching (Epic 8)

### Task 2.1: Build the matching ranker

Ask Antigravity:
> Create a Node.js module at ai/src/worker-matcher.js that:
>
> 1. Exports a function: rankWorkers(job, workers)
>    - job: { category, description, location, pin_code, budget, urgency }
>    - workers: array of { id, name, skills, hourly_rate, avg_rating, total_jobs, response_rate, service_areas }
>
> 2. Scores each worker on a 0-100 scale using these weights:
>    - Rating score (40%): (avg_rating / 5) × 40
>    - Area match (25%): if worker's service_areas includes the job's pin_code → 25, else 0
>    - Price match (20%): if worker's hourly_rate <= budget → 20, if within 20% over → 10, else 0. If no budget specified → 15 for everyone.
>    - Reliability (15%): response_rate × 15
>
> 3. For URGENT jobs, boost workers with higher response_rate by an extra 10 points
>
> 4. Returns workers sorted by score (highest first), with the score included
>
> 5. Include test data with 5 fake workers and a test job, print the ranked results

### Task 2.2: AI-enhanced matching (optional, for bonus learning)

Ask Antigravity:
> Create a function at ai/src/ai-matcher.js that uses Gemini to do smarter matching:
>
> 1. Takes a job description and top 5 worker profiles
> 2. Sends to Gemini:
>
> "You are a job matching assistant. A customer needs: {description}.
>
> Here are available workers:
> 1. {name}: {skills}, {experience}, ₹{rate}/hr, ★{rating}, {total_jobs} jobs done
> 2. ...
>
> Rank them from best fit to worst fit for this specific job. Consider skill relevance, experience, and pricing.
> Reply with ONLY the numbers in order, comma separated. Example: 3,1,5,2,4"
>
> 3. Returns the re-ranked worker list

### Task 2.3: Add matching endpoint

Ask Antigravity:
> Add to my ai/src/server.js:
>
> POST /api/ai/match-workers
> - Body: { job: { category, description, location, pin_code, budget, urgency }, workers: [...] }
> - Calls rankWorkers (and optionally aiMatcher)
> - Returns: { ranked_workers: [{ id, name, score, ... }] }

---

## Phase 3: Fake Review Detection (Epic 8)

### Task 3.1: Build the fake review detector

Ask Antigravity:
> Create a Node.js module at ai/src/fake-review-detector.js that:
>
> 1. Exports a function: detectFakeReview(review)
>    - review: { score, review_text, time_since_booking_completed (in minutes), reviewer_total_reviews }
>
> 2. Uses a combination of rules + AI:
>
>    Rule-based flags (instant, no AI needed):
>    - Review submitted within 1 minute of booking completion → suspicious
>    - Review text is less than 3 characters but score is 5 → suspicious
>    - Reviewer has submitted 5+ reviews today → suspicious
>
>    AI-based flag (call Gemini):
>    - Send the review text to Gemini:
>    "You are a fake review detector. Analyze this review for a blue-collar service worker:
>     Review: '{review_text}'
>     Rating: {score}/5
>
>     Is this review likely GENUINE or FAKE? Consider:
>     - Generic text like 'good', 'nice', 'excellent' with no specifics → likely fake
>     - Mentions specific details about the work done → likely genuine
>     - Extreme negativity with no substance → possibly fake
>     - Natural language with typos/Hindi-English mix → likely genuine
>
>     Reply with ONLY one word: GENUINE or FAKE"
>
> 3. Returns: { is_suspicious: true/false, reasons: ["submitted too fast", "AI flagged as fake"] }

### Task 3.2: Add fake detection endpoint

Ask Antigravity:
> Add to ai/src/server.js:
>
> POST /api/ai/detect-fake-review
> - Body: { score, review_text, time_since_completion, reviewer_total_reviews }
> - Returns: { is_suspicious: true/false, reasons: [...] }

Tell Intern 2:
> "After a rating is submitted, call my API to check if it's fake. If is_suspicious is true, set is_flagged=true on the rating."

---

## Phase 4: Auto-Reply Suggestions (Epic 8)

### Task 4.1: Build reply generator

Ask Antigravity:
> Create a Node.js module at ai/src/reply-generator.js that:
>
> 1. Exports a function: generateReply(workerName, workerSkills, customerName, jobDescription, jobCategory)
>
> 2. Sends to Gemini:
> "You are helping a blue-collar worker in India respond to a customer's job request professionally.
>
> Worker: {workerName} (skills: {workerSkills})
> Customer: {customerName}
> Job request: {jobDescription}
> Category: {jobCategory}
>
> Write a short, friendly, professional reply (2-3 sentences max) in simple English.
> The worker is confirming their interest and availability.
> Include a greeting and mention the specific work needed.
> Keep it warm and professional — these workers want to make a good impression."
>
> 3. Returns the generated reply text

### Task 4.2: Add reply suggestion endpoint

Ask Antigravity:
> Add to ai/src/server.js:
>
> POST /api/ai/suggest-reply
> - Body: { worker_name, worker_skills, customer_name, job_description, job_category }
> - Returns: { reply: "..." }

---

## Phase 5: Job Description Enhancement (Epic 8)

### Task 5.1: Build description enhancer

Ask Antigravity:
> Create a Node.js module at ai/src/description-enhancer.js that:
>
> 1. Exports a function: enhanceDescription(rawDescription, category)
>
> 2. Sends to Gemini:
> "You help improve service request descriptions on a blue-collar job platform in India.
>
> Original request: '{rawDescription}'
> Category: {category}
>
> Rewrite this in clear, structured English (keep it short — 2-3 sentences max).
> If the original is in Hindi or Hinglish, translate to English but keep it natural.
> Add any implied details (e.g., if they say 'tap leak', clarify it's a plumbing repair).
> DO NOT make up information. Only clarify what's already implied.
> Keep the tone as a customer describing their problem."
>
> 3. Returns the enhanced description

---

## Phase 6: Deploy AI Service (Epic 10)

Deploy your AI microservice on Railway:
1. Go to railway.app → New Service → Connect GitHub repo
2. Set root directory to `ai/`
3. Set start command: `node src/server.js`
4. Add environment variable: GEMINI_API_KEY
5. Deploy
6. Share the live URL with Intern 2 and Intern 3

---

## PART 2: ADMIN PANEL

---

## Phase 7: Admin Dashboard (Epic 9)

### Task 7.1: Admin Layout

Ask Antigravity:
> Build an admin layout for my Next.js app (admin panel for KaamChalu):
>
> Create src/app/layout.tsx and src/components/AdminSidebar.tsx:
>
> - Left sidebar (collapsible on mobile) with navigation links:
>   - Dashboard (icon: chart)
>   - Verification Queue (icon: checkmark, show pending count badge)
>   - Users (icon: people)
>   - Bookings (icon: calendar)
>   - Disputes (icon: warning, show open count badge)
>   - Reports (icon: document)
>
> - Top bar with:
>   - "KaamChalu Admin" title
>   - Admin name/avatar on the right
>   - Logout button
>
> - Main content area on the right
>
> Dark theme (dark gray sidebar, white/light content area). Professional look.
> Tailwind CSS. Responsive — sidebar becomes hamburger menu on mobile.

### Task 7.2: Dashboard Page

Ask Antigravity:
> Build the admin dashboard at src/app/admin/page.tsx (or src/app/page.tsx if separate app):
>
> Top row — 6 stat cards:
> - Total Workers (show active / pending / suspended breakdown)
> - Total Customers
> - Bookings Today
> - Bookings This Week
> - Completion Rate (as percentage with color: green if >70%, yellow if 50-70%, red if <50%)
> - Open Disputes (red badge if >0)
>
> Second row — 2 charts (use Chart.js from CDN or recharts):
> - Left: Line chart — "Bookings per day" (last 30 days)
> - Right: Pie chart — "Bookings by category" (plumbing, electrical, etc.)
>
> Third row — 2 charts:
> - Left: Bar chart — "New signups per day" (workers vs customers, stacked, last 14 days)
> - Right: Bar chart — "Ratings distribution" (1-star to 5-star counts)
>
> Bottom — Recent Activity table:
> - Last 10 bookings: ID, Customer, Worker, Category, Date, Status (with color-coded badge)
>
> For now, use realistic fake data. Later connect to GET /api/admin/dashboard.
>
> Use Tailwind CSS. Make the cards interactive (hover effects).
> Auto-refresh every 60 seconds.

### Task 7.3: Worker Verification Queue

Ask Antigravity:
> Build the verification queue page at src/app/admin/verify/page.tsx:
>
> - Heading: "Worker Verification Queue" with count badge
> - List of pending workers, each showing:
>   - Profile photo (large enough to see face)
>   - Full name, phone
>   - Skills (as tags/badges)
>   - Experience, hourly rate
>   - Service areas
>   - Aadhaar number (partially masked: XXXX-XXXX-1234)
>   - About text
>   - Registration date
>   - Two action buttons:
>     - "Approve" (green) — calls PATCH /api/workers/:id/status { status: "active" }
>     - "Reject" (red) — shows a dropdown: reason (Fake info, Inappropriate photo, Duplicate account, Other with text input)
>       → calls PATCH /api/workers/:id/status { status: "rejected", reason: "..." }
>
> - After approve/reject: card animates out, count updates
> - Empty state: "No workers pending verification 🎉"
>
> Fake data for now. Mobile-friendly.

### Task 7.4: User Management Page

Ask Antigravity:
> Build the user management page at src/app/admin/users/page.tsx:
>
> - Search bar: search by name or phone number
> - Filter tabs: All, Workers, Customers
> - Filter dropdown: Status (Active, Pending, Suspended)
>
> - User table:
>   - Avatar, Name, Phone, Role (badge), Status (color-coded badge), Joined date, Rating, Jobs count
>   - Click a row to see full profile in a side panel or modal:
>     - All profile info
>     - Booking history
>     - Ratings given and received
>     - "Suspend Account" / "Unsuspend Account" button
>
> - Pagination: 20 users per page
>
> Fake data with 25-30 realistic Indian names and profiles.

### Task 7.5: Bookings Management Page

Ask Antigravity:
> Build the bookings page at src/app/admin/bookings/page.tsx:
>
> - Filter bar: Status dropdown (all statuses), Category dropdown, Date range picker
> - Bookings table:
>   - Booking ID, Customer name, Worker name, Category, Scheduled date, Status (color-coded), Amount
>   - Click to expand: full details, timeline (posted → matched → confirmed → etc.), ratings
>
> - Stats row at top: Total bookings, Completed today, Cancelled today, Active now
> - Pagination
>
> Fake data.

### Task 7.6: Dispute Management Page

Ask Antigravity:
> Build the disputes page at src/app/admin/disputes/page.tsx:
>
> - Filter tabs: Open, Investigating, Resolved
> - Each dispute card shows:
>   - Booking details (category, date, customer, worker)
>   - Who raised it + their statement/reason
>   - Timeline of the booking
>   - Both parties' ratings (if they rated)
>
> - Admin actions:
>   - "Start Investigation" button (changes status to investigating)
>   - Admin notes textarea (saved to the dispute)
>   - Resolution form:
>     - Resolution type dropdown: "Refund recommended", "Worker warned", "Worker suspended", "Customer warned", "No action needed"
>     - Resolution notes textarea
>     - "Resolve Dispute" button
>
> - After resolving: triggers notification to both parties (via API which triggers n8n)
>
> Fake data.

### Task 7.7: Reports Page

Ask Antigravity:
> Build a reports page at src/app/admin/reports/page.tsx:
>
> - "Generate Report" section with:
>   - Report type dropdown: Daily Summary, Weekly Summary, Monthly Summary, Worker Performance, Category Analysis
>   - Date range picker
>   - "Generate" button
>
> - Report displays in a table/card format below
> - "Download CSV" button for each generated report
>
> For now, generate fake report data. Later connect to admin API.

---

## Phase 8: Connect Admin Panel to Real API (Epic 10)

Same pattern as Intern 1. For each page:

Ask Antigravity:
> I have an admin page that uses fake data. Connect it to the real API.
>
> API base URL: [INTERN 2's URL]
> Current page code: [paste]
> Replace fake data with: GET [endpoint] (paste from API docs)
>
> Add:
> - Loading skeleton while fetching
> - Error state if API fails
> - Auth: send the admin's Bearer token in headers
>
> Page should auto-refresh every 60 seconds.

---

## Phase 9: Deploy Admin Panel (Epic 10)

1. Go to vercel.com → New Project → Connect GitHub repo
2. Set root directory to `admin/` (or use the same project as Intern 1 if sharing)
3. Add environment variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy
5. Share the admin URL with the team
6. **Important**: Admin panel should only be accessible to admin users. Add auth check on every page.

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---------|-------------------|
| Calling Gemini API without error handling | ALWAYS wrap in try/catch. If AI fails, return a safe default. |
| Expensive AI calls on every request | Cache results when possible. Don't call Gemini for the same data twice. |
| Building admin pages without thinking about data | Look at Intern 2's API docs first. Know what data you have before designing the UI. |
| Not testing AI outputs | AI is unpredictable. Test with 10+ different inputs. Handle edge cases. |
| Making admin panel look bad | This is the control center. Make it look professional — it's what Meer sees. |
| Forgetting auth on admin pages | Every admin page must check that the user is an admin. No exceptions. |
| Not coordinating with Intern 3 on AI integration | Intern 3's n8n workflows need to call your AI endpoints. Talk to them. |

---

## Daily Checklist

Before you end each day:
- [ ] Did I test my AI functions with multiple inputs?
- [ ] Did I commit and push to GitHub?
- [ ] Does my Vercel deployment work?
- [ ] Did I tell Intern 2 and 3 about any new AI endpoints?
- [ ] Did I test admin pages on mobile?
- [ ] Did I update API documentation for my AI endpoints?
