# Intern 2 — Backend + Database Person Guide

> **Your Role**: You build the database, the API, and the auth system. You are the FOUNDATION. Everyone depends on you.
> **Your Tools**: Supabase, Railway, Antigravity IDE, GitHub, ChatGPT/Claude
> **Your Stack**: Supabase (Postgres + Auth), Node.js (Express), hosted on Railway

---

## STOP — Do This Before Writing ANY Code (Day 1-3)

**DO NOT skip this. DO NOT create any Supabase tables yet. Design first.**

### Day 1: Read + Understand
1. Read the entire PRD (`docs/PRD.md`) — every section, especially the booking state machine
2. Write down 5 questions about anything you don't understand
3. Discuss as a team. Use ChatGPT/Claude to research answers.

### Day 2: System Design (Team)
Work with the team to create these documents (see `docs/SYSTEM-DESIGN-TEMPLATE.md` for exact format):

**Your contribution to the team design (YOU LEAD MOST OF THIS):**
- Write the **Database Schema** section of `docs/PRODUCT-SPEC.md` — every table, every column, every relationship, every RLS rule
- Write the **API Contract** section — every endpoint with exact request/response JSON examples
- For each endpoint, note WHO calls it (Intern 1's frontend? Intern 3's n8n? Intern 4's admin?) and what SIDE EFFECTS it has (webhook calls, database updates)
- Review Intern 1's page specs — do your endpoints provide all the data their pages need?
- Review Intern 3's workflow specs — does your webhook data format match what they expect?
- Review Intern 4's AI feature specs — can your API call their AI service correctly?
- Help create the **Architecture Diagram** — draw the backend + database boxes, show all connections

**Ask AI to help you design the schema:**
> "I'm building a Postgres database for a blue-collar job platform. Here are my tables: [list from PRD]. Help me:
> 1. Identify any missing tables or columns
> 2. Design proper foreign key relationships
> 3. Suggest indexes for common query patterns
> 4. Write RLS policies for these roles: worker, customer, admin
> 5. Draw an entity-relationship diagram in text format"

**Ask AI to help you design the API:**
> "I have these database tables: [paste schema]. I need REST API endpoints for: user auth (phone OTP), worker CRUD, job posting + matching, booking lifecycle, ratings, admin dashboard. For each endpoint, give me: HTTP method, URL, request body, response body, auth requirement, and error cases."

### Day 3: Personal Execution Plan
Create your file: `docs/EXECUTION-PLAN-INTERN-2.md`

Break down YOUR work day by day:
- Which tables/endpoints are you building each day?
- Which endpoints should you build FIRST? (Hint: whatever Intern 1 and 3 need first)
- When will you share API docs with the team?
- When will you deploy to Railway?
- What are your risks? (schema changes mid-project, auth issues, RLS problems)

Use the template in `docs/SYSTEM-DESIGN-TEMPLATE.md` Part 4.

**CRITICAL**: You are the bottleneck. Your plan must prioritize what UNBLOCKS others.

Suggested priority order:
1. Database tables + auth (everyone needs credentials Day 1)
2. POST /api/jobs + GET /api/workers (Intern 3 needs these for n8n)
3. Auth routes (Intern 1 needs these for login/signup)
4. Worker routes (Intern 1 needs these for directory/profiles)
5. Booking + rating routes (needed for Week 2 integration)
6. Admin routes (Intern 4 needs these last)

### Checklist: You can start coding when:
- [ ] You've read the full PRD
- [ ] `docs/PRODUCT-SPEC.md` has your schema + API contract
- [ ] Architecture diagram is done
- [ ] `docs/EXECUTION-PLAN.md` (team plan) is done
- [ ] `docs/EXECUTION-PLAN-INTERN-2.md` (your personal plan) is done
- [ ] All 3 other interns have reviewed your API contract and confirmed it works for them
- [ ] Meer has reviewed and approved

---

## What You Own

- Supabase project: database tables, Row-Level Security policies, auth configuration, file storage
- API server: every endpoint that the frontend, n8n, and admin dashboard call
- Documentation: `docs/API.md` and `docs/DATABASE.md` — everyone reads these

You do NOT build:
- Web pages (that's Intern 1 and 4)
- n8n workflows (that's Intern 3, but you call their webhooks)
- AI features (that's Intern 4, but you may expose their results via API)

---

## Why You Matter Most

```
Intern 1 (Frontend) ──calls──→ YOUR API ──reads/writes──→ YOUR DATABASE
Intern 3 (n8n)      ──calls──→ YOUR API ──reads/writes──→ YOUR DATABASE
Intern 4 (Dashboard) ──calls──→ YOUR API ──reads/writes──→ YOUR DATABASE
YOUR API ──triggers──→ Intern 3's n8n webhooks
```

**If you are slow, everyone is stuck.** Prioritize getting basic endpoints working fast, even if imperfect. Ship early, fix later.

---

## Your Dependencies

| You need from | What | When |
|---------------|------|------|
| **Intern 3** | n8n webhook URLs (to call when events happen) | Before Epic 5 |
| **Intern 4** | AI scoring function/endpoint (to call during matching) | Before Epic 6 |

You are mostly independent. Start immediately.

---

## Setup (Day 1)

### Step 1: Accounts
1. **Supabase**: Go to supabase.com → Sign in with GitHub → New Project → Name: "kaamchalu" → Set a strong database password (save it!) → Choose Mumbai region → Create
2. **Railway**: Go to railway.app → Sign in with GitHub
3. Install **Node.js** from nodejs.org
4. Install **Google Antigravity IDE**

### Step 2: Share Supabase credentials with the team

Once your Supabase project is ready:
1. Go to **Settings → API**
2. Copy: Project URL and anon/public key
3. Share these in the team group chat
4. **NEVER share the service_role key** — that's only for your backend server

### Step 3: Create the API project

Ask Antigravity:
> Create a Node.js Express API project in the `backend/` folder:
>
> - package.json with these dependencies: express, cors, dotenv, @supabase/supabase-js, helmet
> - src/index.js as the entry point
> - src/routes/ folder for route files
> - src/middleware/ folder for middleware
> - .env.example with: PORT, SUPABASE_URL, SUPABASE_SERVICE_KEY, N8N_WEBHOOK_URL
> - .gitignore (node_modules, .env)
>
> The server should:
> - Use express.json() for parsing
> - Use cors() to allow requests from any origin (for now)
> - Use helmet() for security headers
> - Listen on PORT from .env (default 3000)
> - Have a GET /health endpoint that returns { status: "ok" }
>
> Create the file structure only, no routes yet.

Run:
```
cd backend
npm install
```

Create a `.env` file with your real Supabase URL and **service_role key** (not anon key — server needs full access).

Test:
```
node src/index.js
# Open browser: http://localhost:3000/health → should see {"status":"ok"}
```

---

## Phase 1: Database Schema (Epic 2)

### Task 1.1: Create the tables

Go to Supabase → SQL Editor.

Ask ChatGPT or Claude:
> I'm building a blue-collar job platform called KaamChalu. Write me the SQL to create these tables in Supabase (PostgreSQL). Include proper constraints, foreign keys, indexes, and defaults.
>
> **Table: profiles**
> Extends Supabase auth.users. Created automatically when a user signs up.
> - id (uuid, references auth.users, primary key)
> - role (text, not null: 'worker', 'customer', 'admin')
> - full_name (text, not null)
> - phone (text, not null, unique)
> - email (text, nullable)
> - avatar_url (text, nullable)
> - area (text, nullable)
> - pin_code (text, nullable)
> - created_at (timestamptz, default now)
> - updated_at (timestamptz, default now)
>
> **Table: worker_profiles**
> Extra info for workers only.
> - id (uuid, primary key, references profiles)
> - skills (text array, not null) — e.g., ['plumbing', 'electrical']
> - experience (text) — '<1', '1-3', '3-5', '5-10', '10+'
> - hourly_rate (integer, not null) — in rupees
> - service_areas (text array) — pin codes or area names
> - availability (jsonb) — { "monday": ["morning", "afternoon"], "tuesday": ["evening"] }
> - languages (text array) — ['hindi', 'english']
> - about (text, nullable)
> - aadhaar_number (text, nullable) — encrypted
> - status (text, default 'pending_verification') — 'pending_verification', 'active', 'suspended', 'rejected', 'inactive'
> - total_jobs (integer, default 0)
> - avg_rating (numeric(2,1), default 0)
> - response_rate (numeric(3,2), default 0) — percentage
> - verified_at (timestamptz, nullable)
> - created_at (timestamptz, default now)
> - updated_at (timestamptz, default now)
>
> **Table: jobs**
> A service request posted by a customer.
> - id (uuid, primary key, auto-generated)
> - customer_id (uuid, references profiles, not null)
> - category (text, not null) — 'plumbing', 'electrical', etc.
> - description (text, not null)
> - location (text, not null)
> - pin_code (text, nullable)
> - preferred_date (date, not null)
> - preferred_time (text, not null) — 'morning', 'afternoon', 'evening', 'flexible'
> - budget (integer, nullable) — in rupees
> - urgency (text, default 'normal') — 'urgent', 'normal', 'flexible' (set by AI)
> - status (text, default 'posted') — 'posted', 'matching', 'worker_accepted', 'confirmed', 'in_progress', 'completed', 'expired', 'cancelled_by_customer', 'cancelled_by_worker', 'disputed'
> - matched_worker_id (uuid, nullable, references profiles) — the worker who got the job
> - photo_urls (text array, nullable)
> - created_at (timestamptz, default now)
> - updated_at (timestamptz, default now)
>
> **Table: job_applications**
> Workers who accepted/skipped a job alert.
> - id (uuid, primary key, auto-generated)
> - job_id (uuid, references jobs, not null)
> - worker_id (uuid, references profiles, not null)
> - status (text, default 'notified') — 'notified', 'accepted', 'skipped', 'expired'
> - notified_at (timestamptz, default now)
> - responded_at (timestamptz, nullable)
> - unique constraint on (job_id, worker_id)
>
> **Table: bookings**
> A confirmed match between a customer and worker.
> - id (uuid, primary key, auto-generated)
> - job_id (uuid, references jobs, not null, unique)
> - customer_id (uuid, references profiles, not null)
> - worker_id (uuid, references profiles, not null)
> - status (text, default 'confirmed') — 'confirmed', 'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_worker', 'disputed'
> - scheduled_date (date, not null)
> - scheduled_time (text, not null)
> - actual_start (timestamptz, nullable)
> - actual_end (timestamptz, nullable)
> - amount_paid (integer, nullable) — self-reported by worker
> - created_at (timestamptz, default now)
> - updated_at (timestamptz, default now)
>
> **Table: ratings**
> Ratings and reviews after a booking is complete.
> - id (uuid, primary key, auto-generated)
> - booking_id (uuid, references bookings, not null)
> - rated_by (uuid, references profiles, not null) — who gave the rating
> - rated_user (uuid, references profiles, not null) — who received the rating
> - score (integer, not null, check 1-5)
> - review_text (text, nullable)
> - is_flagged (boolean, default false) — flagged by AI for fake review
> - created_at (timestamptz, default now)
> - unique constraint on (booking_id, rated_by)
>
> **Table: notifications**
> In-app notifications.
> - id (uuid, primary key, auto-generated)
> - user_id (uuid, references profiles, not null)
> - type (text, not null) — 'job_alert', 'booking_confirmed', 'booking_cancelled', 'rating_received', 'profile_approved', 'profile_rejected', 'reminder'
> - title (text, not null)
> - body (text, not null)
> - data (jsonb, nullable) — extra data like job_id, booking_id
> - is_read (boolean, default false)
> - created_at (timestamptz, default now)
>
> **Table: disputes**
> - id (uuid, primary key, auto-generated)
> - booking_id (uuid, references bookings, not null)
> - raised_by (uuid, references profiles, not null)
> - reason (text, not null)
> - status (text, default 'open') — 'open', 'investigating', 'resolved'
> - resolution (text, nullable)
> - admin_notes (text, nullable)
> - resolved_by (uuid, nullable, references profiles)
> - created_at (timestamptz, default now)
> - resolved_at (timestamptz, nullable)
>
> Also create indexes on:
> - jobs.customer_id, jobs.status, jobs.category, jobs.pin_code
> - job_applications.job_id, job_applications.worker_id
> - bookings.customer_id, bookings.worker_id, bookings.status
> - ratings.rated_user, ratings.booking_id
> - notifications.user_id, notifications.is_read
> - worker_profiles.status, worker_profiles.skills (GIN index for array)
>
> Also create a function + trigger that auto-creates a profile row when a new user signs up in auth.users.
> Also create a function + trigger that auto-updates worker_profiles.avg_rating when a new rating is inserted.

**Paste the SQL into Supabase SQL Editor → Run.**

Go to Table Editor → Verify all tables exist with correct columns.

### Task 1.2: Row-Level Security (RLS)

This is CRITICAL for security. RLS controls who can see/edit what data.

Ask ChatGPT:
> Write Supabase RLS policies for these tables. Rules:
>
> **profiles**: Users can read any profile. Users can update only their own profile. Insert is done by trigger.
>
> **worker_profiles**: Anyone can read worker profiles with status 'active'. Workers can update their own profile. Insert allowed by the worker themselves.
>
> **jobs**: Customers can insert jobs (customer_id = auth.uid). Customers can read their own jobs. Workers can read jobs where they have a job_application. Admin can read all.
>
> **job_applications**: Workers can read/update their own applications. System (service role) can insert.
>
> **bookings**: Customer and worker of the booking can read it. Only system can insert/update.
>
> **ratings**: Anyone can read ratings. Users can insert a rating only for bookings they're part of. No updates or deletes.
>
> **notifications**: Users can read only their own. Users can update is_read on their own. System inserts.
>
> **disputes**: Involved parties can read. Either party can insert. Admin can read all and update.
>
> Use auth.uid() for current user and auth.jwt()->>'role' for admin checks.

Run this SQL in Supabase.

**Test RLS**: Go to Table Editor → Try inserting a row manually. Then use the API with anon key — you should NOT be able to see other users' data.

### Task 1.3: Auth Setup

Go to Supabase → Authentication → Providers:
1. Enable Phone provider
2. For testing: enable "Confirm phone" in Auth settings (allows test OTP without real SMS)
3. Later: connect Twilio for real SMS (free trial has enough credits for testing)

Ask ChatGPT:
> How do I set up phone OTP authentication in Supabase? I want users to sign in with their phone number. They enter their number, get an OTP, enter the OTP, and they're logged in. If it's a new user, create their profile. If existing, just log them in.

### Task 1.4: Storage Setup

For profile photos and job photos.

1. Go to Supabase → Storage → Create bucket: "avatars" (public)
2. Create bucket: "job-photos" (public)
3. Set up storage policies:
   - avatars: anyone can read, authenticated users can upload to their own folder
   - job-photos: anyone can read, authenticated users can upload

Ask ChatGPT:
> Write Supabase storage policies for two buckets: "avatars" and "job-photos". Anyone can read. Authenticated users can upload files to a folder matching their user ID. Max file size 5MB. Only allow image types (jpg, png, webp).

### Task 1.5: Write DATABASE.md

Document everything you built. Ask ChatGPT:
> I have these database tables [paste your schema]. Write a DATABASE.md that explains:
> - Each table and its purpose
> - Each column and what it stores
> - Relationships between tables (which foreign keys point where)
> - The booking status flow diagram (text-based)
> - RLS rules in plain English

Save as `docs/DATABASE.md`. Share with the team.

---

## Phase 2: Core API Endpoints (Epic 3)

Build each group of endpoints one at a time. Test each one before moving on.

### Task 2.1: Auth Routes

Ask Antigravity:
> Create an auth route file at src/routes/auth.js for my Express API:
>
> POST /api/auth/send-otp
> - Body: { phone: "+919876543210" }
> - Calls supabase.auth.signInWithOtp({ phone })
> - Returns: { success: true, message: "OTP sent" }
>
> POST /api/auth/verify-otp
> - Body: { phone: "+919876543210", otp: "123456" }
> - Calls supabase.auth.verifyOtp({ phone, token, type: 'sms' })
> - Returns: { success: true, session: { access_token, user } }
>
> POST /api/auth/signup-worker
> - Requires auth (Bearer token in header)
> - Body: { full_name, skills, experience, hourly_rate, service_areas, availability, languages, about, aadhaar_number }
> - Creates row in profiles (role: 'worker') + row in worker_profiles (status: 'pending_verification')
> - Returns: the created profile
>
> POST /api/auth/signup-customer
> - Requires auth
> - Body: { full_name, area, pin_code, email }
> - Creates row in profiles (role: 'customer')
> - Returns: the created profile
>
> GET /api/auth/me
> - Requires auth
> - Returns: current user's profile + worker_profile if they're a worker
>
> Use the Supabase service role client for database operations.
> Create an auth middleware at src/middleware/auth.js that:
> - Reads the Bearer token from Authorization header
> - Verifies it with supabase.auth.getUser(token)
> - Attaches user to req.user
> - Returns 401 if no token or invalid

**Test each endpoint with curl.** Ask ChatGPT:
> Give me curl commands to test these auth endpoints: [paste endpoints]

### Task 2.2: Worker Routes

Ask Antigravity:
> Create a worker route file at src/routes/workers.js:
>
> GET /api/workers
> - Public (no auth needed)
> - Query params: category, area, min_rating, max_rate, sort_by (rating, rate, experience), page, limit
> - Only returns workers with status 'active'
> - Returns: array of worker profiles joined with profiles table (name, avatar, skills, rating, rate, jobs_completed)
> - Pagination: default 20 per page
>
> GET /api/workers/:id
> - Public
> - Returns: full worker profile + their ratings/reviews
> - Only if status is 'active' (or if requester is the worker themselves or admin)
>
> PATCH /api/workers/:id
> - Requires auth, must be the worker themselves
> - Body: any worker_profile fields to update (skills, rate, availability, etc.)
> - Cannot update: status, avg_rating, total_jobs (system-managed)
> - Returns: updated worker profile
>
> PATCH /api/workers/:id/status
> - Requires auth, must be admin
> - Body: { status: "active" | "suspended" | "rejected", reason: "..." }
> - If approving: set verified_at to now()
> - Trigger: call n8n webhook to notify the worker
> - Returns: updated worker profile

### Task 2.3: Job Routes

Ask Antigravity:
> Create a job route file at src/routes/jobs.js:
>
> POST /api/jobs
> - Requires auth (customer only)
> - Body: { category, description, location, pin_code, preferred_date, preferred_time, budget, photo_urls }
> - Creates job with status 'posted'
> - Trigger: call n8n webhook with job data (Intern 3 will handle matching + notifications)
> - Returns: created job
>
> GET /api/jobs
> - Requires auth
> - If customer: returns their own jobs
> - If worker: returns jobs where they have a job_application
> - If admin: returns all jobs
> - Query params: status, page, limit
> - Returns: array of jobs with customer name
>
> GET /api/jobs/:id
> - Requires auth (must be the customer, a matched worker, or admin)
> - Returns: full job details + applications (if customer or admin) + booking (if exists)
>
> PATCH /api/jobs/:id
> - Requires auth
> - Customer can: cancel (if status allows), update description
> - System/admin can: update status, set matched_worker_id
> - Returns: updated job
>
> POST /api/jobs/:id/apply
> - Requires auth (worker only)
> - Creates job_application with status 'accepted'
> - Trigger: call n8n webhook (notify customer that a worker accepted)
> - Returns: created application
>
> POST /api/jobs/:id/confirm
> - Requires auth (customer only)
> - Body: { worker_id } — the worker they chose
> - Updates job status to 'confirmed', sets matched_worker_id
> - Creates a booking
> - Trigger: call n8n webhook (notify worker of confirmation)
> - Returns: created booking

### Task 2.4: Booking Routes

Ask Antigravity:
> Create a booking route file at src/routes/bookings.js:
>
> GET /api/bookings
> - Requires auth
> - Returns bookings where user is customer or worker
> - Query params: status, page, limit
> - Includes: job details, other party's name and phone (phone only if confirmed)
>
> GET /api/bookings/:id
> - Requires auth (must be customer, worker, or admin)
> - Returns: full booking with job details, both parties' info, ratings
>
> PATCH /api/bookings/:id
> - Requires auth
> - Actions based on body.action:
>   - "start": worker marks as in_progress (sets actual_start)
>   - "complete": worker marks as completed (sets actual_end)
>   - "cancel": either party cancels (with consequences per PRD rules)
>   - "dispute": either party raises a dispute
> - Trigger: call n8n webhook for each action
> - Returns: updated booking

### Task 2.5: Rating Routes

Ask Antigravity:
> Create a rating route file at src/routes/ratings.js:
>
> POST /api/ratings
> - Requires auth
> - Body: { booking_id, score (1-5), review_text }
> - Validates: booking must be 'completed', user must be part of the booking, user hasn't already rated
> - Creates rating
> - Updates worker_profiles.avg_rating (recalculate average)
> - Trigger: call n8n webhook (notify the rated person)
> - Returns: created rating
>
> GET /api/ratings
> - Query params: user_id (get ratings for a specific user), page, limit
> - Returns: ratings with reviewer name
>
> PATCH /api/ratings/:id/flag
> - Admin only
> - Body: { is_flagged: true/false }
> - Returns: updated rating

### Task 2.6: Admin Routes

Ask Antigravity:
> Create an admin route file at src/routes/admin.js:
>
> All routes require auth + admin role.
>
> GET /api/admin/dashboard
> - Returns: {
>     total_workers: { active, pending, suspended },
>     total_customers,
>     bookings: { today, this_week, this_month },
>     completion_rate,
>     avg_rating,
>     open_disputes
>   }
>
> GET /api/admin/verification-queue
> - Returns: worker profiles with status 'pending_verification'
> - Ordered by created_at ascending (oldest first)
>
> GET /api/admin/users
> - Query params: role, search (name or phone), status, page, limit
> - Returns: paginated user list
>
> GET /api/admin/disputes
> - Query params: status, page, limit
> - Returns: disputes with booking details and both parties' info
>
> PATCH /api/admin/disputes/:id
> - Body: { status, resolution, admin_notes }
> - If resolving: set resolved_at, resolved_by
> - Trigger: call n8n webhook (notify both parties)
> - Returns: updated dispute

### Task 2.7: Notification Routes

Ask Antigravity:
> Create a notification route file at src/routes/notifications.js:
>
> GET /api/notifications
> - Requires auth
> - Returns current user's notifications, newest first
> - Query params: is_read (true/false), page, limit
> - Also returns unread_count
>
> PATCH /api/notifications/:id/read
> - Requires auth (must be notification owner)
> - Sets is_read = true
>
> POST /api/notifications/read-all
> - Requires auth
> - Marks all user's notifications as read

---

## Phase 3: n8n Integration (Epic 5-6)

### Task 3.1: Create webhook caller utility

Ask Antigravity:
> Create a utility file at src/utils/webhooks.js that:
>
> - Has a function callWebhook(event, data) that:
>   - Sends a POST request to the N8N_WEBHOOK_URL from .env
>   - Body: { event: "job_posted" | "worker_accepted" | "booking_confirmed" | "booking_completed" | "worker_approved" | etc., data: { ...relevant data } }
>   - Does NOT wait for the response (fire and forget)
>   - Logs errors but doesn't crash the API if webhook fails
>
> - Used throughout the route files wherever I noted "Trigger: call n8n webhook"

Get the webhook URL from Intern 3 and add it to your .env.

### Task 3.2: Add webhook calls to all routes

Go through each route file and add `callWebhook()` at the appropriate points. Ask Antigravity to add them one file at a time.

---

## Phase 4: Write API Documentation (Epic 3)

Ask ChatGPT:
> I have these API endpoints [paste all routes]. For each one, write documentation in this format:
>
> ### ENDPOINT_NAME
> **Method**: GET/POST/PATCH
> **URL**: /api/...
> **Auth**: Required / Not required / Admin only
> **Request Body**:
> ```json
> { example }
> ```
> **Response**:
> ```json
> { example }
> ```
> **Error Responses**:
> - 400: { error: "reason" }
> - 401: { error: "Unauthorized" }
> - 404: { error: "Not found" }

Save as `docs/API.md`. **Send to team group chat. Everyone must read this.**

---

## Phase 5: Deploy to Railway (Epic 10)

1. Go to railway.app → New Project → Deploy from GitHub repo
2. Set root directory to `backend/`
3. Set start command: `node src/index.js`
4. Add environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY, N8N_WEBHOOK_URL, PORT
5. Deploy
6. Get your public URL (e.g., https://kaamchalu-api.up.railway.app)
7. Share with the team
8. Test: `curl https://kaamchalu-api.up.railway.app/health`

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---------|-------------------|
| Building all endpoints at once | Build one, test with curl, then next |
| Forgetting RLS | Test that users can't see each other's data |
| Not writing API docs | Everyone is stuck without your docs. Write them ASAP. |
| Hardcoding Supabase keys in code | Always use .env |
| Not handling errors | Every endpoint needs try/catch + proper error responses |
| Committing .env to git | Double check .gitignore |
| Not telling the team when endpoints are ready | Post in group chat: "GET /api/workers is live" |

---

## Daily Checklist

Before you end each day:
- [ ] Did I test every new endpoint with curl?
- [ ] Did I update docs/API.md?
- [ ] Did I commit and push to GitHub?
- [ ] Did I tell the team what's ready?
- [ ] Does my Railway deployment work?
