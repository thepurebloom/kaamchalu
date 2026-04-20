# EXECUTION PLAN — INTERN 2 (Backend + Database)
**Project:** KaamChalu — Blue Collar Job Platform
**Role:** Backend + Database Person
**My Job:** Build the database and API. Everyone depends on me.

---

## My Simple Rule
> Build one thing → Test it → Tell the team → Then build next thing

---

## Big Picture — 10 Days

| Day | What I Do |
|-----|-----------|
| Day 1 | Create accounts (Supabase, Railway, GitHub) |
| Day 2 | Build the database (tables + security) |
| Day 3 | Setup laptop and create backend project |
| Day 4 | Build login system (most important!) |
| Day 5 | Build worker and job features |
| Day 6 | Build booking and rating features |
| Day 7 | Build admin features |
| Day 8 | Connect to Intern 3's automation |
| Day 9 | Test everything and write docs |
| Day 10 | Put it live on internet (Railway) |

---

## DAY 1 — Create Accounts

### Supabase (my database)
- Go to supabase.com
- Sign up with GitHub
- Create new project called Kaamchalu
- Choose Asia Pacific region
- Set a strong password and SAVE IT in notepad
- After project is ready go to Settings then API Keys
- Save these 4 things in notepad:
  - Project URL
  - Anon Key (share with team)
  - Service Role Key (NEVER share — only for my backend)
  - Database Password

### Railway (where my server will live)
- Go to railway.app
- Sign up with GitHub
- Just create account — do nothing else yet

### GitHub (saves my code)
- Go to github.com
- Create account
- use main repository called kaamchalu
- Make it Public
- Save the repository link

---

## DAY 2 — Build the Database

Go to Supabase SQL Editor and do these 4 things one by one:

### Thing 1 — Create the 8 Tables
- Go to SQL Editor in Supabase (the >_ icon in left sidebar)
- Paste the tables SQL code and click Run
- You should see "Success" message
- Check Table Editor — all 8 tables should appear:
  - profiles
  - worker_profiles
  - jobs
  - job_applications
  - bookings
  - ratings
  - notifications
  - disputes

### Thing 2 — Add RLS Security
- Same SQL Editor
- Paste the RLS code and click Run
- This stops people from seeing each other's private data
- Very important — do not skip this

### Thing 3 — Turn On Phone Login
- Go to Authentication in left sidebar
- Click Providers
- Find Phone and toggle it ON
- Click Save

### Thing 4 — Create Storage Buckets
- Go to Storage in left sidebar
- Click New Bucket
- Name: avatars — make it Public — click Create
- Click New Bucket again
- Name: job-photos — make it Public — click Create
- These buckets store photos uploaded by users

### After Day 2 — Tell the Team
Post in group chat:
> "Supabase is ready. Here is the Project URL and Anon Key for everyone to use. Service Role Key is only on my backend."

---

## DAY 3 — Setup Laptop and Backend Project

### Install on Laptop
- Download Node.js from nodejs.org (download the LTS version)
- Install it like a normal app
- Open Command Prompt and type: node --version
- You should see a version number like v20.11.0

- Download VS Code from code.visualstudio.com
- Install it like a normal app
- This is where you write your code

### Create Backend Project
- Open Command Prompt
- Create a new folder called kaamchalu-backend
- Go into that folder
- Install the required packages (express, cors, dotenv, supabase, helmet)
- Create the folder structure:
  - src folder
  - src/routes folder (for all API endpoints)
  - src/middleware folder (for auth checking)
  - src/utils folder (for helper functions)
  - src/index.js (main server file)
  - .env file (your secret keys — NEVER share or upload this)
  - .gitignore file (tells GitHub to ignore node_modules and .env)

### Create the .env File
Put these 4 things in your .env file:
- PORT = 3000
- SUPABASE_URL = your project url from supabase
- SUPABASE_SERVICE_KEY = your service role key from supabase
- N8N_WEBHOOK_URL = get this from Intern 3 later

### Test Your Server Works
- Run: node src/index.js
- Open browser and go to: http://localhost:3000/health
- You should see: {"status": "ok"}
- If you see this — your server is working!

### Push to GitHub
- Connect your folder to your GitHub repository
- Push your code
- From now on push to GitHub every single day

---

## DAY 4 — Build Login System

This is the most important day. Intern 1 cannot build login pages without these.

Build these 5 things one by one. Test each one before moving to the next:

### 1. Send OTP to Phone
- Customer enters their phone number
- System sends a 6 digit OTP to their phone
- Endpoint: POST /api/auth/send-otp

### 2. Verify OTP and Login
- Customer enters the OTP they received
- System verifies it and gives them an access token
- This token is used for all future requests
- Endpoint: POST /api/auth/verify-otp

### 3. Create Worker Account
- After OTP is verified, worker fills in their details
- Name, skills, hourly rate, area etc
- Profile is created with status "pending_verification"
- Endpoint: POST /api/auth/signup-worker

### 4. Create Customer Account
- After OTP is verified, customer fills in basic details
- Name, area, pin code
- No verification needed for customers
- Endpoint: POST /api/auth/signup-customer

### 5. Get My Own Profile
- Logged in user can see their own profile
- Workers also see their worker_profile details
- Endpoint: GET /api/auth/me

### After Day 4 — Tell Intern 1
Post in group chat:
> "Auth endpoints are ready on localhost:3000. You can start building login and signup pages now."

---

## DAY 5 — Build Worker and Job Features

### Worker Endpoints (build these first)

**Show list of all workers**
- Anyone can see this — no login needed
- Can filter by skill, area, rating, price
- Only shows workers with status "active"
- Endpoint: GET /api/workers

**Show one worker's full profile**
- Anyone can see this — no login needed
- Shows their skills, rating, reviews, availability
- Endpoint: GET /api/workers/:id

**Worker updates their own profile**
- Only the worker themselves can do this
- Can change their rate, availability, skills etc
- Cannot change status or rating (system does that)
- Endpoint: PATCH /api/workers/:id

**Admin approves or rejects a worker**
- Only admin can do this
- Changes worker status to active, suspended, or rejected
- Automatically notifies the worker
- Endpoint: PATCH /api/workers/:id/status

### Job Endpoints (build these second)

**Customer posts a new job**
- Only customers can post jobs
- After posting, system automatically finds matching workers
- Endpoint: POST /api/jobs

**See list of jobs**
- Customer sees their own jobs
- Worker sees jobs they applied to
- Admin sees all jobs
- Endpoint: GET /api/jobs

**See one job's full details**
- Shows all info about a job
- Customer can see who applied
- Endpoint: GET /api/jobs/:id

**Worker applies to a job**
- Worker clicks Accept on a job alert
- Customer gets notified automatically
- Endpoint: POST /api/jobs/:id/apply

**Customer confirms a worker**
- Customer picks one worker from those who applied
- Booking is automatically created
- Worker gets notified automatically
- Endpoint: POST /api/jobs/:id/confirm

### After Day 5 — Tell the Team
Post in group chat:
> "Worker and Job endpoints are ready. Intern 1 can build worker pages. Intern 3 can start building n8n workflows."

---

## DAY 6 — Build Booking and Rating Features

### Booking Endpoints

**See list of my bookings**
- Shows all bookings where I am the customer or worker
- Endpoint: GET /api/bookings

**See one booking's full details**
- Shows job info, both people's details, ratings
- Endpoint: GET /api/bookings/:id

**Update booking status**
- Worker marks job as started
- Worker marks job as completed
- Either person cancels the booking
- Either person raises a dispute
- Each action automatically notifies the other person
- Endpoint: PATCH /api/bookings/:id

### Rating Endpoints

**Submit a star rating**
- Can only rate after job is completed
- Give 1 to 5 stars and write a review
- Worker's average rating updates automatically
- Endpoint: POST /api/ratings

**See ratings for a worker**
- Anyone can see worker ratings
- Endpoint: GET /api/ratings

### Notification Endpoints

**See my notifications**
- Only see your own notifications
- Shows unread count
- Endpoint: GET /api/notifications

**Mark one notification as read**
- Endpoint: PATCH /api/notifications/:id/read

**Mark all notifications as read**
- Endpoint: POST /api/notifications/read-all

---

## DAY 7 — Build Admin Features

Build these 5 things for Intern 4's admin dashboard.

**Platform stats dashboard**
- Total workers (active, pending, suspended)
- Total customers
- Bookings today, this week, this month
- Completion rate and average rating
- Number of open disputes
- Endpoint: GET /api/admin/dashboard

**Worker verification queue**
- List of workers waiting to be approved
- Oldest first
- Admin uses this to approve or reject new workers
- Endpoint: GET /api/admin/verification-queue

**All users list**
- Search users by name or phone
- Filter by role (worker or customer) and status
- Endpoint: GET /api/admin/users

**All disputes list**
- Shows open disputes with full booking details
- Endpoint: GET /api/admin/disputes

**Resolve a dispute**
- Admin writes their decision and resolution
- Both worker and customer get notified
- Endpoint: PATCH /api/admin/disputes/:id

### After Day 7 — Tell Intern 4
Post in group chat:
> "Admin endpoints are ready. You can start building the admin dashboard now."

---

## DAY 8 — Connect to Intern 3's Automation (Webhooks)

First message Intern 3 in the group chat:
> "Hey Intern 3, can you share your n8n webhook URL? I need it to connect the API automations."

Add the webhook URL to your .env file.

Then add automatic triggers so that when something happens in the API, it automatically tells Intern 3's n8n workflow.

### Events to Connect

| When this happens | Automatically do this |
|-------------------|-----------------------|
| Customer posts a job | Tell n8n to find matching workers |
| Worker applies to a job | Tell n8n to notify the customer |
| Customer confirms a worker | Tell n8n to notify the worker |
| Booking is completed | Tell n8n to send rating reminders |
| Admin approves a worker | Tell n8n to send welcome email to worker |
| Admin rejects a worker | Tell n8n to send rejection email to worker |
| Dispute is raised | Tell n8n to alert the admin |
| Dispute is resolved | Tell n8n to notify both people |

---

## DAY 9 — Test Everything and Write Docs

### Test All 27 Endpoints
Go through every single endpoint and test it works correctly.
Fix any bugs you find.

### Write API.md
This document tells your teammates how to use your API.
For every endpoint write:
- What is the URL
- What method (GET, POST, PATCH)
- What to send in the request
- What you get back in the response
- What errors can happen

Save as docs/API.md and share in group chat.

### Write DATABASE.md
This document explains your database to the team.
Write in simple words:
- What each table is for
- What each column stores
- How tables are connected to each other

Save as docs/DATABASE.md and share in group chat.

### Get Approval
Send Meer your API.md and DATABASE.md and ask for review.

---

## DAY 10 — Put It Live on Railway

- Make sure all code is pushed to GitHub
- Go to railway.app
- Click New Project
- Click Deploy from GitHub Repo
- Select your kaamchalu repository
- Set the start command: node src/index.js
- Add your environment variables (same as your .env file):
  - SUPABASE_URL
  - SUPABASE_SERVICE_KEY
  - N8N_WEBHOOK_URL
  - PORT
- Click Deploy
- Wait for it to finish
- Copy your live URL (looks like: https://kaamchalu-api.up.railway.app)
- Test it: open browser and go to your-url/health
- Should show {"status": "ok"}

### Tell Everyone
Post in group chat:
> "API is LIVE! URL: https://kaamchalu-api.up.railway.app — Please update your apps to use this URL instead of localhost."

---

## Who Needs What From Me

| Person | What they need from me | When I deliver it |
|--------|------------------------|------------------|
| Intern 1 (Frontend) | Auth endpoints working | End of Day 4 |
| Intern 1 (Frontend) | Worker and Job endpoints | End of Day 5 |
| Intern 3 (n8n) | Job and Booking endpoints | End of Day 5 |
| Intern 4 (Admin Dashboard) | Admin endpoints | End of Day 7 |
| Everyone | Live Railway URL | End of Day 10 |
| Everyone | API.md documentation | Day 9 |

---

## What I Need From Others

| Person | What I need | When I need it |
|--------|------------|----------------|
| Intern 3 | n8n webhook URL | Before Day 8 |
| Intern 4 | AI scoring endpoint URL | Before Day 8 |
| Meer | Review and approve my plan | Day 3 |

---

## My Risks and How I Will Handle Them

| Risk | How I handle it |
|------|-----------------|
| Tables need to change later | Design carefully first, change only if really needed |
| Phone OTP not working | Use test mode in Supabase (no real SMS needed for testing) |
| Intern 3 webhook URL is late | Build API without it first, add webhook calls later |
| RLS blocking my own API | Backend uses service role key which bypasses RLS |
| Railway deployment fails | Test everything locally first before deploying |

---

## Priority Order

```
MOST URGENT — do first, team is blocked without these:
  1. Auth endpoints (Intern 1 needs for login)
  2. Database tables (everything depends on this)

IMPORTANT — do second:
  3. Worker endpoints (Intern 1 needs for worker pages)
  4. Job endpoints (Intern 3 needs for workflows)

NORMAL — do third:
  5. Booking endpoints
  6. Rating endpoints
  7. Notification endpoints

LAST — do after everything above:
  8. Admin endpoints
  9. Webhooks and n8n connection
  10. Deploy to Railway
```

---

## Daily Checklist (Do Every Day Before Stopping)

- Did I test every new endpoint today?
- Did I update API.md with new endpoints?
- Did I push my code to GitHub?
- Did I tell the team what is ready today?
- Does everything still work without errors?

---

## Quick Reference — All 27 Endpoints

| Number | Method | URL | Who Uses It |
|--------|--------|-----|-------------|
| 1 | POST | /api/auth/send-otp | Intern 1 |
| 2 | POST | /api/auth/verify-otp | Intern 1 |
| 3 | POST | /api/auth/signup-worker | Intern 1 |
| 4 | POST | /api/auth/signup-customer | Intern 1 |
| 5 | GET | /api/auth/me | Intern 1 |
| 6 | GET | /api/workers | Intern 1 |
| 7 | GET | /api/workers/:id | Intern 1 |
| 8 | PATCH | /api/workers/:id | Intern 1 |
| 9 | PATCH | /api/workers/:id/status | Intern 4 |
| 10 | POST | /api/jobs | Intern 1 |
| 11 | GET | /api/jobs | Intern 1 |
| 12 | GET | /api/jobs/:id | Intern 1 |
| 13 | POST | /api/jobs/:id/apply | Intern 1 |
| 14 | POST | /api/jobs/:id/confirm | Intern 1 |
| 15 | GET | /api/bookings | Intern 1 |
| 16 | GET | /api/bookings/:id | Intern 1 |
| 17 | PATCH | /api/bookings/:id | Intern 1 |
| 18 | POST | /api/ratings | Intern 1 |
| 19 | GET | /api/ratings | Intern 1 |
| 20 | GET | /api/notifications | Intern 1 |
| 21 | PATCH | /api/notifications/:id/read | Intern 1 |
| 22 | POST | /api/notifications/read-all | Intern 1 |
| 23 | GET | /api/admin/dashboard | Intern 4 |
| 24 | GET | /api/admin/verification-queue | Intern 4 |
| 25 | GET | /api/admin/users | Intern 4 |
| 26 | GET | /api/admin/disputes | Intern 4 |
| 27 | PATCH | /api/admin/disputes/:id | Intern 4 |

---

*This plan was created for Intern 2 of the KaamChalu project.*
*Follow this day by day and the whole team will be unblocked.*
