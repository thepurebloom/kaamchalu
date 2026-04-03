# Intern 3 — Automation Person Guide

> **Your Role**: You build the nervous system of the platform. Every automated notification, reminder, scheduled report, and event reaction goes through you.
> **Your Tools**: n8n (primary), ChatGPT/Claude (for help), GitHub
> **Your Stack**: n8n (cloud or self-hosted), connecting to Intern 2's API

---

## STOP — Do This Before Touching n8n (Day 1-3)

**DO NOT skip this. DO NOT create workflows yet. Design the automations on paper first.**

### Day 1: Read + Understand
1. Read the entire PRD (`docs/PRD.md`) — pay special attention to Section 3.4 (Notification & Automation Requirements)
2. Write down every trigger event, who gets notified, and when
3. Write down 5 questions about anything you don't understand
4. Discuss as a team. Use ChatGPT/Claude to research answers.

### Day 2: System Design (Team)
Work with the team to create these documents (see `docs/SYSTEM-DESIGN-TEMPLATE.md` for exact format):

**Your contribution to the team design:**
- Write the **n8n Workflow Specs** section of `docs/PRODUCT-SPEC.md`
- For EVERY workflow, define: what triggers it, what data it receives, what steps it takes, what it outputs (emails, API calls, database updates)
- Define the **Event Contract with Intern 2**: the exact JSON format for every webhook event. Example:
  ```
  Event: "job_posted"
  Data: { job_id, category, description, location, pin_code, preferred_date, preferred_time, budget, customer_name, customer_email }
  ```
  Both you AND Intern 2 must agree on this format. If you need a field they don't send, tell them NOW.
- Define the **Email Templates**: for every email type, write the subject line and body template with placeholders
- Coordinate with Intern 4: which workflows call their AI service? What data do you send, what do you get back?
- Help create the **Architecture Diagram** — draw the n8n box, show every arrow going in and out

**Ask AI to help you design workflows:**
> "I'm building n8n automations for a blue-collar job platform. Here are all the events that happen: [list from PRD Section 3.4]. For each event, help me design an n8n workflow: what nodes to use, what data flows between them, and what the output is. Also list 5 scheduled automations I need (daily reports, reminders, cleanup jobs)."

**Ask AI to help you design email templates:**
> "I need email templates for a blue-collar job platform called KaamChalu. Write professional but friendly email templates for: new job notification to worker, booking confirmation to both parties, rating request, worker profile approved, worker profile rejected, daily summary for workers, daily report for admin. Use placeholders like {worker_name}, {customer_name}, {job_category}, etc. Keep language simple — recipients may not be fluent in English."

### Day 3: Personal Execution Plan
Create your file: `docs/EXECUTION-PLAN-INTERN-3.md`

Break down YOUR work day by day:
- Day 1-2 while waiting for Intern 2: learn n8n, set up account, test email sending
- Which workflows to build first? (Hint: the ones Intern 2 will trigger first)
- When can you test with real webhook data vs fake data?
- When will you hand Intern 2 your webhook URL?
- What are your risks? (email delivery issues, n8n free tier limits, webhook format mismatches)

Use the template in `docs/SYSTEM-DESIGN-TEMPLATE.md` Part 4.

**Suggested priority order for your workflows:**
1. Event Router (the master webhook) — everyone needs this first
2. Job posted → notify workers (core flow)
3. Worker accepted → notify customer (core flow)
4. Booking confirmed → notify both (core flow)
5. Booking completed → rating requests
6. Worker approved/rejected
7. Cancellations + disputes
8. Scheduled: reminders, daily summary, admin report, cleanup

### Checklist: You can start building when:
- [ ] You've read the full PRD (especially Section 3.4)
- [ ] `docs/PRODUCT-SPEC.md` has your workflow specs
- [ ] Event contract agreed with Intern 2 (exact JSON format)
- [ ] Email templates written
- [ ] Architecture diagram is done
- [ ] `docs/EXECUTION-PLAN.md` (team plan) is done
- [ ] `docs/EXECUTION-PLAN-INTERN-3.md` (your personal plan) is done
- [ ] Meer has reviewed and approved

---

## What You Own

Every automated workflow:
- Job matching notifications (notify workers when jobs match their skills)
- Booking confirmations and updates
- Reminders (before jobs, after jobs, for ratings)
- Scheduled reports (daily worker summary, admin report)
- Escalation logic (no response? expired? cancelled?)
- Stale job cleanup
- Inactive worker pings

You do NOT build:
- Web pages (Intern 1, 4)
- API endpoints (Intern 2)
- AI scoring/classification (Intern 4, but you'll call their logic from n8n)

---

## How Your Work Connects

```
Intern 2's API ──webhook POST──→ YOUR n8n workflows ──API calls back──→ Intern 2's API
                                       ↓
                                 Send emails / notifications
                                       ↓
                                 Call Intern 4's AI scoring
```

1. Something happens in the platform (new job, new booking, etc.)
2. Intern 2's API calls YOUR webhook URL
3. Your n8n workflow processes the event
4. Your workflow sends emails, calls APIs, schedules follow-ups

---

## Your Dependencies

| You need from | What | When |
|---------------|------|------|
| **Intern 2** | API base URL + API documentation | Before building any workflow |
| **Intern 2** | Webhook call from their API to your n8n URL | Before testing |
| **Intern 4** | Gemini AI scoring endpoint or n8n sub-workflow | Before Workflow 4 |

**While waiting for Intern 2**: Learn n8n. Build practice workflows. Get email sending working. You have plenty to do.

---

## Setup (Day 1)

### Step 1: n8n Account

**Option A — n8n Cloud (easier)**:
1. Go to n8n.io → Sign up → Start free trial
2. You get a cloud instance immediately
3. Free tier: 5 active workflows, enough for this project

**Option B — Self-hosted (more control)**:
1. In your terminal: `npx n8n`
2. Opens at http://localhost:5678
3. Free, unlimited workflows
4. BUT: must be running for automations to work

**Recommendation**: Start with cloud. Move to self-hosted later if you hit limits.

### Step 2: Learn n8n (spend 2-3 hours on this)

Open ChatGPT and say:
> I'm completely new to n8n (automation platform). Teach me:
> 1. What is a workflow?
> 2. What is a node?
> 3. What is a trigger?
> 4. What is a webhook?
> 5. How do I pass data from one node to the next?
> 6. What does {{ $json.fieldName }} mean?
> 7. How do I use the IF node for conditions?
> 8. How do I use the HTTP Request node to call an API?
>
> Explain each with a simple example. Keep it very beginner friendly.

Read the answer carefully. Ask follow-up questions.

### Step 3: Build your first test workflow

In n8n:
1. Click "Add Workflow" → Name it "Test - Hello World"
2. Add a **Webhook** node → Set method to POST → Copy the test URL
3. Add a **Set** node → Add a field: message = "Hello from n8n! I received: {{ $json.name }}"
4. Add a **Respond to Webhook** node → Set response body to {{ $json.message }}
5. Connect: Webhook → Set → Respond to Webhook
6. Click "Test workflow" (top right)
7. In another terminal or browser, send a test:
```
curl -X POST YOUR_WEBHOOK_URL -H "Content-Type: application/json" -d '{"name": "Meer"}'
```
8. You should see the response: "Hello from n8n! I received: Meer"

If this works, you understand the basics. If not, paste the error into ChatGPT.

### Step 4: Set up email sending

You need email to work before you build real workflows.

**Option A — Gmail (easiest)**:
1. In n8n → Credentials → Add: Google (Gmail)
2. Follow the OAuth flow to connect your Gmail
3. Test: create a workflow with Webhook → Gmail node → send email to yourself

**Option B — Brevo (better for production)**:
1. Go to brevo.com → Sign up (free, 300 emails/day)
2. Go to SMTP & API → Get your SMTP credentials
3. In n8n → Credentials → Add: SMTP → Enter Brevo credentials
4. Test: send an email to yourself

**Option C — n8n's Send Email node**:
1. Uses n8n's built-in email (works for testing only, may go to spam)

Ask ChatGPT if stuck:
> How do I set up the Gmail node in n8n to send emails? Step by step with screenshots descriptions.

### Step 5: Share your webhook URL

Once your test workflow works:
1. Create a new workflow called "KaamChalu - Event Router"
2. Add a Webhook node → Set method to POST → Set path to `/kaamchalu-events`
3. **Activate the workflow** (toggle at top right)
4. Copy the **production webhook URL** (not the test URL!)
5. Share this URL with Intern 2 in the group chat

Tell Intern 2:
> "Here's my webhook URL: [URL]. Send me POST requests with this format:
> { event: 'event_name', data: { ...event data } }
> I'll handle the rest."

---

## The Event Router Pattern

Instead of giving Intern 2 a different webhook URL for every event, use ONE webhook URL and route events inside n8n.

### Task: Build the Event Router

In n8n, build this workflow:

```
TRIGGER: Webhook (receives ALL events from Intern 2's API)
    ↓
SWITCH node: Check {{ $json.event }}
    ├── "job_posted"          → Workflow: Job Matching
    ├── "worker_accepted"     → Workflow: Notify Customer
    ├── "booking_confirmed"   → Workflow: Booking Confirmation
    ├── "booking_started"     → Workflow: Job Started
    ├── "booking_completed"   → Workflow: Job Completed
    ├── "booking_cancelled"   → Workflow: Cancellation
    ├── "worker_approved"     → Workflow: Worker Approved
    ├── "worker_rejected"     → Workflow: Worker Rejected
    ├── "dispute_raised"      → Workflow: Dispute Alert
    └── default               → Log: "Unknown event: {{ $json.event }}"
```

Ask Antigravity or ChatGPT:
> In n8n, I have a webhook that receives events like { event: "job_posted", data: { ... } }. How do I use a Switch node to route different events to different paths in the same workflow? Show me step by step.

Each branch will have its own set of nodes. Some branches will be simple (send 1 email), others complex (multiple steps).

---

## Phase 1: Notification Workflows (Epic 7)

### Workflow 1: Job Posted → Notify Matching Workers

**Trigger**: event = "job_posted"
**Data received**: `{ job_id, category, description, location, pin_code, preferred_date, preferred_time, budget, customer_name }`

Build this flow:
```
Switch (job_posted branch)
    ↓
HTTP Request: GET [API_URL]/api/workers?category={{ $json.data.category }}&area={{ $json.data.pin_code }}
    ↓
Split In Batches: Process each worker
    ↓
Send Email to each matching worker:
    To: {{ $json.email }}
    Subject: "New job near you: {{ $json.data.category }} in {{ $json.data.location }}"
    Body: "Hi {{ $json.full_name }},

    A customer near you needs help!

    Service: {{ $json.data.category }}
    Description: {{ $json.data.description }}
    Date: {{ $json.data.preferred_date }}
    Time: {{ $json.data.preferred_time }}
    Budget: {{ $json.data.budget || 'Flexible' }}

    Log in to KaamChalu to accept this job.

    — KaamChalu Team"
    ↓
HTTP Request: POST [API_URL]/api/notifications (create in-app notification for each worker)
    Body: { user_id: worker.id, type: "job_alert", title: "New job near you", body: "..." }
```

Ask ChatGPT:
> In n8n, I receive a webhook with job data. I need to:
> 1. Call an API to get matching workers (GET request with query params)
> 2. Loop through each worker
> 3. Send each one an email
> 4. Create an in-app notification via POST request
>
> Show me which n8n nodes to use and how to connect them. I'm a beginner.

### Workflow 2: Worker Accepted → Notify Customer

**Trigger**: event = "worker_accepted"
**Data received**: `{ job_id, worker_name, worker_rating, worker_rate, customer_email, customer_name }`

```
Switch (worker_accepted branch)
    ↓
Send Email to customer:
    Subject: "A worker is available for your job!"
    Body: "Hi {{ $json.data.customer_name }},

    {{ $json.data.worker_name }} (★ {{ $json.data.worker_rating }}, ₹{{ $json.data.worker_rate }}/hr) is available for your job.

    Log in to KaamChalu to confirm the booking.

    — KaamChalu Team"
    ↓
HTTP Request: POST [API_URL]/api/notifications
    Body: { user_id: customer_id, type: "worker_accepted", title: "Worker available!", ... }
```

### Workflow 3: Booking Confirmed → Notify Both

**Trigger**: event = "booking_confirmed"
**Data received**: `{ booking_id, job_id, worker_name, worker_phone, worker_email, customer_name, customer_phone, customer_email, scheduled_date, scheduled_time, category }`

```
Switch (booking_confirmed branch)
    ↓
── Branch 1: Email to Worker
    Subject: "Booking Confirmed — {{ $json.data.category }} on {{ $json.data.scheduled_date }}"
    Body: "Hi {{ $json.data.worker_name }},

    Your booking is confirmed!

    Customer: {{ $json.data.customer_name }}
    Phone: {{ $json.data.customer_phone }}
    Service: {{ $json.data.category }}
    Date: {{ $json.data.scheduled_date }}
    Time: {{ $json.data.scheduled_time }}

    Contact the customer to confirm details.

    — KaamChalu Team"

── Branch 2: Email to Customer
    Subject: "Booking Confirmed — {{ $json.data.worker_name }} is coming!"
    Body: "Hi {{ $json.data.customer_name }},

    Your booking is confirmed!

    Worker: {{ $json.data.worker_name }}
    Phone: {{ $json.data.worker_phone }}
    Service: {{ $json.data.category }}
    Date: {{ $json.data.scheduled_date }}
    Time: {{ $json.data.scheduled_time }}

    — KaamChalu Team"
```

### Workflow 4: Job Completed → Send Rating Requests

**Trigger**: event = "booking_completed"
**Data received**: `{ booking_id, worker_name, worker_email, customer_name, customer_email, category }`

```
Switch (booking_completed branch)
    ↓
── Branch 1: Email to Customer
    Subject: "How was {{ $json.data.worker_name }}?"
    Body: "Your {{ $json.data.category }} job is complete!
    Rate your experience: [LINK to rating page]"

── Branch 2: Email to Worker
    Subject: "Job complete — rate your customer"
    Body: "Your job for {{ $json.data.customer_name }} is done!
    Rate your customer: [LINK to rating page]"
```

### Workflow 5: Worker Approved/Rejected → Notify Worker

**Trigger**: event = "worker_approved" or "worker_rejected"

```
Switch (worker_approved branch)
    ↓
Send Email:
    Subject: "Your KaamChalu profile is approved!"
    Body: "Hi {{ $json.data.worker_name }},

    Great news! Your profile has been verified and is now live.
    Customers can find you and send job requests.

    — KaamChalu Team"

Switch (worker_rejected branch)
    ↓
Send Email:
    Subject: "Your KaamChalu profile needs updates"
    Body: "Hi {{ $json.data.worker_name }},

    We couldn't verify your profile. Reason: {{ $json.data.reason }}

    Please update your profile and try again.

    — KaamChalu Team"
```

### Workflow 6: Cancellation → Notify Other Party

**Trigger**: event = "booking_cancelled"

```
Switch (booking_cancelled branch)
    ↓
IF: cancelled_by == "customer"
    → Email to worker: "The customer cancelled the booking for {{ $json.data.category }} on {{ $json.data.scheduled_date }}"
    → Create notification for worker
IF: cancelled_by == "worker"
    → Email to customer: "Unfortunately, {{ $json.data.worker_name }} cancelled. We're finding you another worker."
    → Create notification for customer
    → Trigger: re-run matching (POST to API to update job status back to 'matching')
```

### Workflow 7: Dispute → Alert Admin

**Trigger**: event = "dispute_raised"

```
Switch (dispute_raised branch)
    ↓
Send Email to admin:
    Subject: "⚠️ New dispute — Booking #{{ $json.data.booking_id }}"
    Body: "Raised by: {{ $json.data.raised_by_name }}
    Reason: {{ $json.data.reason }}
    Booking details: [link to admin panel]"
    ↓
Create notification for admin user
```

---

## Phase 2: Scheduled Automations (Epic 7)

These don't use webhooks — they run on a schedule.

### Workflow 8: Booking Reminders

Create a NEW workflow (not inside the event router).

```
TRIGGER: Cron — every hour
    ↓
HTTP Request: GET [API_URL]/api/bookings?status=confirmed
    (Intern 2 should add a query param: scheduled_date=tomorrow or scheduled_within=1h)
    ↓
Filter: bookings scheduled in the next 24 hours that haven't been reminded yet
    ↓
For each booking:
    ↓
    IF scheduled in ~24 hours:
        Send email to both: "Reminder: Your booking is tomorrow at {{ time }}"
    IF scheduled in ~1 hour:
        Send email to both: "Reminder: Your booking starts in 1 hour!"
```

Ask ChatGPT:
> In n8n, how do I create a cron trigger that runs every hour, fetches data from an API, filters items by date, and sends emails for items matching a condition?

### Workflow 9: Daily Worker Summary

```
TRIGGER: Cron — every day at 8 PM IST
    ↓
HTTP Request: GET [API_URL]/api/workers?status=active (get all active workers)
    ↓
For each worker:
    HTTP Request: GET [API_URL]/api/bookings?worker_id={{ worker.id }}&date=today
    ↓
    Send Email:
        Subject: "Your daily summary — {{ date }}"
        Body: "Hi {{ worker.name }},

        Today's summary:
        - Jobs completed: {{ count }}
        - Upcoming tomorrow: {{ upcoming_count }}

        Keep up the great work!
        — KaamChalu Team"
```

### Workflow 10: Daily Admin Report

```
TRIGGER: Cron — every day at 9 AM IST
    ↓
HTTP Request: GET [API_URL]/api/admin/dashboard
    ↓
Send Email to admin:
    Subject: "KaamChalu Daily Report — {{ date }}"
    Body: "
    Workers: {{ total_workers.active }} active, {{ total_workers.pending }} pending
    Customers: {{ total_customers }}
    Bookings yesterday: {{ bookings.yesterday }}
    Completion rate: {{ completion_rate }}%
    Open disputes: {{ open_disputes }}
    "
```

### Workflow 11: Stale Job Cleanup

```
TRIGGER: Cron — every hour
    ↓
HTTP Request: GET [API_URL]/api/jobs?status=matching
    ↓
Filter: jobs where created_at is more than 2 hours ago
    ↓
For each stale job:
    HTTP Request: PATCH [API_URL]/api/jobs/{{ job.id }} → { status: "expired" }
    ↓
    Send Email to customer: "We couldn't find a worker for your {{ category }} request. Try posting again with a different date or area."
```

### Workflow 12: Rating Reminder

```
TRIGGER: Cron — every day at 10 AM
    ↓
HTTP Request: GET [API_URL]/api/bookings?status=completed
    ↓
Filter: completed > 24 hours ago AND no rating exists
    ↓
For each unrated booking:
    Send Email to customer: "You completed a {{ category }} job with {{ worker_name }} yesterday. How was it? Rate now: [link]"
```

### Workflow 13: Inactive Worker Ping

```
TRIGGER: Cron — every Monday at 10 AM
    ↓
HTTP Request: GET [API_URL]/api/workers?status=active
    ↓
Filter: workers who haven't had a booking in 7+ days
    ↓
Send Email: "Hi {{ name }}, we haven't seen you in a while! Update your availability so customers can find you."
```

---

## Phase 3: AI Integration (Epic 8)

Coordinate with Intern 4 for this.

### Workflow 14: AI Lead Scoring (inside Event Router)

Add to the "job_posted" branch, BEFORE notifying workers:

```
(after receiving job data)
    ↓
HTTP Request: POST to Gemini API (or Intern 4's scoring endpoint)
    Body: {
        prompt: "Classify this service request urgency. Request: '{{ $json.data.description }}'. Date requested: {{ $json.data.preferred_date }}. Reply with ONLY one word: URGENT, NORMAL, or FLEXIBLE."
    }
    ↓
HTTP Request: PATCH [API_URL]/api/jobs/{{ job_id }} → { urgency: AI_response }
    ↓
(continue to worker notification)
```

Ask ChatGPT:
> In n8n, how do I call the Google Gemini API using an HTTP Request node? I have an API key. I want to send a prompt and get a text response.

---

## Documentation

### Task: Write WORKFLOWS.md

For EVERY workflow you build, document it in `docs/WORKFLOWS.md`:

```markdown
## Workflow: [Name]
**Trigger**: Webhook event "X" / Cron schedule "every day at 9 AM"
**What it does**: [1-2 sentences]
**Inputs**: What data it expects
**Actions**: Step by step what it does
**Outputs**: What emails/notifications/API calls it makes
**Testing**: How to test it manually
```

Ask ChatGPT to help format this.

**Export every workflow** as JSON: In n8n → workflow → ... menu → Export → Save in `automations/workflows/`

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---------|-------------------|
| Building workflows without testing | Use the "Test workflow" button after every change |
| Not checking the execution log | When something fails, go to Executions → see exactly which node failed and why |
| Using test webhook URL in production | Switch to production URL when going live (they're different!) |
| Not activating workflows | Workflows don't run until you toggle them ON |
| Sending too many emails at once | Use "Split In Batches" node to avoid rate limits |
| Hardcoding API URLs | Use n8n's environment variables or a Set node at the start of each workflow |
| Not exporting workflow JSON | Export after every working change. This is your backup. |
| Building everything before Intern 2 is ready | Learn n8n, build with test data, set up email first |

---

## Testing Guide

For each workflow, test with curl:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "event": "job_posted",
    "data": {
      "job_id": "test-123",
      "category": "plumbing",
      "description": "Kitchen sink leaking",
      "location": "Andheri West",
      "pin_code": "400058",
      "preferred_date": "2026-03-25",
      "preferred_time": "morning",
      "budget": 500,
      "customer_name": "Test Customer"
    }
  }'
```

Check:
1. Did the workflow execute? (check Executions tab)
2. Did emails arrive?
3. Did API calls succeed? (check the HTTP Request node output)
4. Did any node fail? (red = failed, green = success)

---

## Daily Checklist

Before you end each day:
- [ ] Did I test every workflow I worked on?
- [ ] Did I check the execution log for errors?
- [ ] Did I export updated workflow JSON to GitHub?
- [ ] Did I update docs/WORKFLOWS.md?
- [ ] Are my production workflows activated?
- [ ] Did I tell Intern 2 what webhook data format I need?
