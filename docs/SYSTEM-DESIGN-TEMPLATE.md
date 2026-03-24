# KaamChalu — System Design Template

> **EVERY INTERN MUST COMPLETE THIS BEFORE WRITING ANY CODE.**
> Do this together as a team on Day 1-3.

---

## Part 1: Product Spec (Team — Day 1-2)

Create a file: `docs/PRODUCT-SPEC.md`

### 1.1 Database Schema

For EVERY table, write:
```
### Table: [name]
**Purpose**: [one sentence]

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| ... | ... | ... | ... | ... |

**Foreign Keys**: [list relationships]
**Indexes**: [list indexes and why]
**RLS Rules**: [who can read/write]
```

**Who leads this**: Intern 2 writes it, everyone reviews and asks questions.

### 1.2 API Contract

For EVERY endpoint, write:
```
### [METHOD] /api/[path]
**Auth**: Required / Public / Admin only
**Owner**: Intern 2 builds, Intern [X] calls it
**Purpose**: [one sentence]

**Request**:
- Headers: Authorization: Bearer <token>
- Body:
  { example request JSON }

**Response (200)**:
  { example success response }

**Response (400/401/404)**:
  { example error response }

**Side Effects**:
- Triggers webhook: [event name] → Intern 3's n8n
- Updates table: [table name]
```

**Who leads this**: Intern 2 writes it, Intern 1/3/4 review to confirm it has what they need.

### 1.3 n8n Workflow Specs

For EVERY workflow, write:
```
### Workflow: [name]
**Trigger**: Webhook event "[name]" / Cron "[schedule]"
**Input data**:
  { exact JSON format this workflow receives }

**Steps**:
1. [Node type]: [what it does]
2. [Node type]: [what it does]
3. ...

**Output**:
- Sends email to: [who]
- Calls API: [endpoint]
- Updates database: [what]

**Error handling**: [what happens if a step fails]
```

**Who leads this**: Intern 3 writes it, Intern 2 confirms the webhook data format.

### 1.4 AI Feature Specs

For EVERY AI feature, write:
```
### Feature: [name]
**API Endpoint**: POST /api/ai/[path]
**Called by**: Intern [X] from [where]

**Input**:
  { exact JSON }

**Prompt sent to Gemini**:
  "[exact prompt with {placeholders}]"

**Expected output**:
  { exact JSON response }

**Fallback**: [what to return if AI fails]
**Rate limit**: [how often this gets called]
```

**Who leads this**: Intern 4 writes it, Intern 2 and 3 confirm they can call it.

### 1.5 Page Specs

For EVERY page, write:
```
### Page: [name]
**URL**: /[path]
**Auth**: Required / Public
**Role**: Customer / Worker / Admin / Public

**Data needed** (what API to call):
- GET /api/[endpoint] → shows [what]

**User actions** (what the page does):
- Button "[label]" → calls POST/PATCH /api/[endpoint]
- Form submit → calls POST /api/[endpoint]

**States**:
- Loading: [what to show]
- Empty: [what to show]
- Error: [what to show]
- Success: [what to show]
```

**Who leads this**: Intern 1 writes customer/worker pages, Intern 4 writes admin pages.

---

## Part 2: Architecture Diagram (Team — Day 2)

Create a visual diagram showing HOW everything connects. Save as `docs/architecture.png` or `docs/architecture.pdf`.

Use any free tool: draw.io, Excalidraw, Figma, pen + paper + photo.

### What the diagram MUST show:

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS                                     │
│   Customer (phone browser)    Worker (phone browser)    Admin    │
└──────────┬───────────────────────┬──────────────────────┬───────┘
           │                       │                      │
           ▼                       ▼                      ▼
┌─────────────────────┐                          ┌──────────────────┐
│   FRONTEND (Vercel) │                          │ ADMIN PANEL      │
│   Next.js + Tailwind│                          │ (Vercel)         │
│                     │                          │ Next.js + Charts │
│   Pages:            │                          │                  │
│   - Landing         │                          │ Pages:           │
│   - Login/Signup    │                          │ - Dashboard      │
│   - Worker Directory│                          │ - Verify Workers │
│   - Post Job        │                          │ - Users          │
│   - Dashboard       │                          │ - Disputes       │
└────────┬────────────┘                          └────────┬─────────┘
         │ API calls (fetch)                              │ API calls
         ▼                                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Railway)                          │
│                    Node.js + Express                              │
│                                                                   │
│   Routes: /api/auth, /api/workers, /api/jobs, /api/bookings,    │
│           /api/ratings, /api/notifications, /api/admin           │
│                                                                   │
│   On events → calls n8n webhook                                  │
│   On scoring → calls AI service                                  │
└───────┬──────────────────┬──────────────────┬────────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  SUPABASE    │  │  n8n         │  │  AI SERVICE      │
│              │  │  (Cloud)     │  │  (Railway)       │
│  - Postgres  │  │              │  │                  │
│  - Auth/OTP  │  │  Workflows:  │  │  - Urgency score │
│  - Storage   │  │  - Notify    │  │  - Match workers │
│  - RLS       │  │  - Reminders │  │  - Fake review   │
│              │  │  - Reports   │  │  - Auto-reply    │
│              │  │  - Cleanup   │  │                  │
│              │  │              │  │  Gemini API      │
└──────────────┘  └──────┬───────┘  └──────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  EMAIL       │
                  │  (Gmail/     │
                  │   Brevo)     │
                  └──────────────┘
```

### The diagram must ALSO show:
1. **Arrows with labels**: what data flows between each box
2. **Auth flow**: User → OTP → Supabase Auth → JWT → API
3. **Job flow**: Customer posts → API → n8n → AI scores → notify workers → worker accepts → API → n8n → notify customer
4. **Which tools are hosted where**: Vercel, Railway, Supabase Cloud, n8n Cloud

---

## Part 3: Project Execution Plan (Team — Day 2-3)

Create a file: `docs/EXECUTION-PLAN.md`

Break the project into epics. Each epic has tasks. Each task has an owner and a "done" definition.

```markdown
# Execution Plan

## Epic 1: Project Setup (Day 1)
| # | Task | Owner | Done when | Status |
|---|------|-------|-----------|--------|
| 1.1 | Create GitHub accounts + clone repo | All | Everyone can push a branch | ⬜ |
| 1.2 | Create Supabase project | Intern 2 | Tables exist, credentials shared | ⬜ |
| 1.3 | Scaffold frontend, deploy to Vercel | Intern 1 | Live URL works | ⬜ |
| 1.4 | Scaffold backend, deploy to Railway | Intern 2 | /health returns ok | ⬜ |
| 1.5 | Set up n8n + test webhook | Intern 3 | Test email sends | ⬜ |
| 1.6 | Get Gemini API key + test | Intern 4 | AI returns a classification | ⬜ |

## Epic 2: Database + Auth (Day 1-2)
| # | Task | Owner | Done when | Status |
| ... | ... | ... | ... | ... |

[Continue for all 11 epics...]
```

### Rules for the execution plan:
- Every task must be finishable in 1 day or less
- Every task has exactly ONE owner (even if 2 people work on it, one person is responsible)
- Every task has a clear "done when" — not "work on X", but "X returns correct data when tested"
- Mark with: ⬜ (not started), 🔄 (in progress), ✅ (done), ❌ (blocked)
- Update this file DAILY

---

## Part 4: Individual Execution Plans (Each Intern — Day 3)

After the team execution plan is done, EACH intern creates their own detailed plan.

Create a file: `docs/EXECUTION-PLAN-INTERN-[N].md`

This is YOUR personal breakdown. Take each task assigned to you from the project execution plan and break it into sub-steps.

```markdown
# Intern [N] — Personal Execution Plan

## My Role: [Frontend / Backend / Automation / AI+Admin]
## My Epics: [list which epics I own tasks in]

## Week 1

### Day 1: [Date]
| Time | What I'm doing | Depends on | Output |
|------|---------------|------------|--------|
| Morning | Set up Next.js project | Nothing | Working localhost:3000 |
| Afternoon | Deploy to Vercel | Morning task | Live .vercel.app URL |

### Day 2: [Date]
| Time | What I'm doing | Depends on | Output |
|------|---------------|------------|--------|
| Morning | Build login page | Nothing | Page renders on mobile |
| Afternoon | Build worker signup form | Login page done | Form validates all fields |

[Continue for each day...]

## My Dependencies (What I need from others)
| What I need | From whom | By when | Status |
|-------------|-----------|---------|--------|
| Supabase URL + key | Intern 2 | Day 1 | ⬜ |
| API docs for /api/workers | Intern 2 | Day 3 | ⬜ |
| ... | ... | ... | ... |

## What Others Need From Me
| What they need | Who needs it | By when | Status |
|---------------|-------------|---------|--------|
| Live frontend URL | Everyone | Day 1 | ⬜ |
| ... | ... | ... | ... |

## My Risk List (What could go wrong)
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase credentials delayed | Can't connect auth | Build with fake auth first |
| ... | ... | ... |
```

---

## Checklist: You Can Start Coding When ALL of These Are Done

- [ ] All 4 interns have read the full PRD
- [ ] `docs/PRODUCT-SPEC.md` is complete and reviewed by all
- [ ] `docs/architecture.png` diagram is created
- [ ] `docs/EXECUTION-PLAN.md` is complete with all epics and tasks
- [ ] Each intern has created their `docs/EXECUTION-PLAN-INTERN-[N].md`
- [ ] Roles are assigned and everyone agrees
- [ ] Meer has reviewed and approved the plan
