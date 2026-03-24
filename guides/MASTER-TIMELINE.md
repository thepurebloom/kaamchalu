# KaamChalu — Master Timeline & Integration Map

## Who Depends on Whom

```
                    ┌─────────────────┐
                    │   INTERN 2      │
                    │   Backend + DB  │
                    │   (Supabase +   │
                    │    Railway)     │
                    └──┬───┬───┬─────┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            ▼              ▼              ▼
    ┌───────────┐  ┌──────────────┐  ┌───────────────┐
    │  INTERN 1 │  │   INTERN 3   │  │   INTERN 4    │
    │  Frontend │  │  Automation  │  │  AI + Admin   │
    │  (Vercel) │  │   (n8n)      │  │  (Gemini +    │
    │           │  │              │  │   Vercel)     │
    └───────────┘  └──────┬───────┘  └──────┬────────┘
                          │                  │
                          └──────┬───────────┘
                                 │
                          Intern 3 calls
                          Intern 4's AI
```

**Translation**: Intern 2 goes first. Intern 1, 3, 4 build with fake data while waiting, then connect.

---

## Phase 0: System Design (Day 1-3) — NO CODE

**This phase is mandatory. No one opens an IDE until Phase 0 is complete.**

See `docs/SYSTEM-DESIGN-TEMPLATE.md` for exact templates.

### Day 1: Read + Understand (ALL TOGETHER)

| Time | Activity | Everyone does this |
|------|----------|-------------------|
| Morning | Read the full PRD individually | Each intern reads `docs/PRD.md` end to end |
| Afternoon | Team discussion | Each person shares their 5 questions, team resolves using AI |

### Day 2: System Design (ALL TOGETHER)

| Time | Activity | Who leads |
|------|----------|----------|
| Morning | Database schema design | Intern 2 leads, everyone reviews |
| Morning | API contract (all endpoints) | Intern 2 leads, everyone confirms their needs |
| Afternoon | n8n workflow specs + event contract | Intern 3 leads, Intern 2 confirms webhook format |
| Afternoon | AI feature specs + prompts | Intern 4 leads, Intern 2+3 confirm integration |
| End of day | Page specs (customer/worker pages) | Intern 1 leads, Intern 4 adds admin pages |
| End of day | Architecture diagram | Everyone contributes their box |

**Output**: `docs/PRODUCT-SPEC.md` complete, `docs/architecture.png` done

### Day 3: Execution Plans (INDIVIDUAL then TEAM)

| Time | Activity | Who |
|------|----------|-----|
| Morning | Team execution plan | All together → `docs/EXECUTION-PLAN.md` |
| Afternoon | Personal execution plans | Each intern → `docs/EXECUTION-PLAN-INTERN-[N].md` |
| End of day | Review with Meer | Everyone presents their plan, Meer approves or requests changes |

**Output**: Team plan + 4 individual plans complete. Meer approves. NOW you can code.

---

## Week-by-Week Timeline

### WEEK 1 — Design (Day 1-3) + Foundation (Day 4-8)

| Day | Intern 1 (Frontend) | Intern 2 (Backend) | Intern 3 (Automation) | Intern 4 (AI + Admin) |
|-----|--------------------|--------------------|----------------------|----------------------|
| 1 | 📖 Read PRD, write 5 questions | 📖 Read PRD, write 5 questions | 📖 Read PRD, write 5 questions | 📖 Read PRD, write 5 questions |
| 2 | ✏️ Write page specs, review API contract | ✏️ LEAD: Design schema + API contract | ✏️ Write workflow specs, agree event format with Intern 2 | ✏️ Write AI specs, test prompts in AI Studio, write admin page specs |
| 3 | 📋 Team execution plan + personal plan | 📋 Team execution plan + personal plan | 📋 Team execution plan + personal plan | 📋 Team execution plan + personal plan |
| 4 | Setup: Next.js, Vercel, deploy skeleton | Setup: Supabase project, create ALL tables, share credentials | Setup: n8n account, learn n8n basics, build test workflow | Setup: Gemini API key, test it works, scaffold admin app |
| 5 | Build: Login + Signup pages (fake auth) | Build: RLS policies, auth setup, profile triggers | Learn: n8n nodes — Webhook, HTTP Request, Email, IF, Switch | Build: Urgency scorer + worker matcher AI functions |
| 6 | Build: Landing page + worker directory (fake data) | Build: Auth routes + Worker routes (test with curl) | Build: Event Router webhook + test email sending setup | Build: Fake review detector + reply generator AI functions |
| 7 | Build: Worker profile page + post a job page (fake data) | Build: Job routes + Booking routes (test with curl) | Build: Workflow 1-3 (job posted, worker accepted, booking confirmed) with test data | Build: AI server (Express) with all endpoints, deploy to Railway |
| 8 | Build: Job detail page + customer dashboard (fake data) | Build: Rating + Admin + Notification routes, write API.md | Build: Workflow 4-7 (completed, approved, cancelled, dispute) with test data | Build: Admin dashboard page + verification queue (fake data) |

**End of Week 1 milestone**: System design complete. Everything built in ISOLATION with fake data. Nothing connected yet.

### WEEK 2 — Integration

| Day | Intern 1 | Intern 2 | Intern 3 | Intern 4 |
|-----|---------|---------|---------|---------|
| 6 | 🔗 **Intern 1 + 2**: Connect login/signup to real Supabase auth | 🔗 **Intern 1 + 2**: Help Intern 1 connect auth, debug issues | Build: Scheduled workflows 8-13 (reminders, reports, cleanup) | Build: User management + bookings + disputes admin pages (fake data) |
| 7 | 🔗 **Intern 1 + 2**: Connect worker directory + profile to real API | 🔗 **Intern 1 + 2**: Help Intern 1, fix API issues | 🔗 **Intern 2 + 3**: Connect webhook — API calls n8n on events | 🔗 **Intern 2 + 4**: Connect admin dashboard to real admin API |
| 8 | 🔗 Connect post-a-job + job detail to real API | 🔗 **Intern 2 + 3**: Debug webhook integration | 🔗 **Intern 3 + 4**: Add AI scoring to job_posted workflow | 🔗 **Intern 3 + 4**: Help Intern 3 call AI endpoints from n8n |
| 9 | 🔗 Connect worker dashboard + alerts + bookings to API | 🔗 Fix bugs from all integrations, add missing endpoints | 🔗 Test all workflows end-to-end with real data | 🔗 Connect verification queue + disputes to real API |
| 10 | Polish: navigation, loading states, error handling, mobile test | Deploy: final Railway deployment, test all endpoints | Deploy: activate all production workflows, test | Deploy: admin panel to Vercel, test all pages |

**End of Week 2 milestone**: Full flow works — post a job → workers notified → accept → confirm → complete → rate. Admin panel shows real data.

### WEEK 3 — Testing & Polish

| Day | Intern 1 | Intern 2 | Intern 3 | Intern 4 |
|-----|---------|---------|---------|---------|
| 11 | ALL TOGETHER: End-to-end testing. Every flow, every page, every email. Write down every bug. | Same | Same | Same |
| 12 | Fix bugs from Day 11 | Fix bugs + add any missing API validations | Fix workflow bugs, test scheduled workflows | Fix admin bugs, test AI accuracy |
| 13 | Final mobile testing — test on 3 different phones | Load test: submit 50 jobs, check everything works | Monitor: check all workflow executions, fix failures | Review: check AI scores 20 different job descriptions, tune prompts |
| 14 | Final polish: colors, spacing, empty states | API docs: final update, make sure everything is documented | Workflow docs: final WORKFLOWS.md | Admin polish: charts, reports working |
| 15 | **DEMO DAY** | **DEMO DAY** | **DEMO DAY** | **DEMO DAY** |

---

## Integration Checkpoints

These are moments where two interns MUST work together. Both people present, sharing screens.

### Checkpoint 1: Auth (Day 6)
**Who**: Intern 1 + Intern 2
**Test**: User can sign up with phone → get OTP → verify → see dashboard
**Pass criteria**: New user appears in Supabase profiles table

### Checkpoint 2: Worker Flow (Day 7)
**Who**: Intern 1 + Intern 2
**Test**: Browse workers → see profiles → worker can edit their profile
**Pass criteria**: Data loads from API, changes save to database

### Checkpoint 3: Backend → n8n (Day 7)
**Who**: Intern 2 + Intern 3
**Test**: Submit a job via API → n8n webhook fires → email sent to matching workers
**Pass criteria**: Email actually arrives in inbox

### Checkpoint 4: Admin Data (Day 7)
**Who**: Intern 2 + Intern 4
**Test**: Admin dashboard shows real stats from database
**Pass criteria**: Numbers on dashboard match Supabase table counts

### Checkpoint 5: AI in Workflow (Day 8)
**Who**: Intern 3 + Intern 4
**Test**: New job → n8n calls AI scoring → job gets urgency tag → workers notified
**Pass criteria**: Job in database has urgency set by AI

### Checkpoint 6: Full Flow (Day 9)
**Who**: ALL 4
**Test the complete flow**:
1. Customer signs up ✓
2. Worker signs up → pending ✓
3. Admin approves worker → email sent ✓
4. Customer posts a job ✓
5. AI scores urgency ✓
6. Matching workers get email ✓
7. Worker accepts job ✓
8. Customer gets notified ✓
9. Customer confirms booking ✓
10. Both get confirmation email ✓
11. Worker starts job ✓
12. Worker completes job ✓
13. Both get rating request ✓
14. Customer rates worker ✓
15. AI checks if review is fake ✓
16. Worker rating updates ✓
17. Admin dashboard shows all this ✓

**If even ONE step fails, stop and fix it before moving on.**

---

## The Handoff Document

At each checkpoint, the person providing the dependency must hand over:

| From | To | What to hand off |
|------|----|-----------------|
| Intern 2 → Intern 1 | Supabase URL, anon key, docs/API.md | "Here's how to call my API" |
| Intern 2 → Intern 3 | API base URL, docs/API.md, webhook data format | "Here's what I'll send to your webhook" |
| Intern 2 → Intern 4 | API base URL, docs/API.md (admin endpoints) | "Here's how to get admin data" |
| Intern 3 → Intern 2 | n8n webhook URL | "Call this URL when events happen" |
| Intern 4 → Intern 2 | AI service URL, endpoint docs | "Call my AI for scoring" |
| Intern 4 → Intern 3 | AI service URL, endpoint docs | "Call my AI from your n8n workflow" |

---

## Daily Standup Format

Every morning, 15 minutes, all 4 interns + Meer.

Each person says:
1. **Yesterday**: "I finished [specific thing]. Here's proof [show screen/deployment/commit]."
2. **Today**: "I'm building [specific task from the timeline]."
3. **Blocked**: "I need [specific thing] from [intern name]." OR "Not blocked."

**Rules**:
- If you say "I'm blocked by Intern X" — Intern X must address it TODAY
- If you finished nothing yesterday — explain why honestly. No shame, just figure out the fix.
- Keep it to 2 minutes per person MAX.

---

## Git Branch Strategy

```
main (protected — no direct pushes)
├── intern1/auth-pages
├── intern1/landing-page
├── intern1/worker-pages
├── intern2/database-schema
├── intern2/auth-routes
├── intern2/job-routes
├── intern3/event-router
├── intern3/scheduled-workflows
├── intern4/ai-scoring
├── intern4/admin-dashboard
```

- Each intern creates a branch per feature
- To merge: Create a Pull Request on GitHub
- Another intern reviews and approves (learn code review!)
- Then merge to main
- Pull from main every morning

---

## Emergency Contacts

When you're completely stuck and your teammates can't help:

1. **Ask AI** (ChatGPT or Claude): Paste the exact error message + your code
2. **Google it**: Error messages are almost always on StackOverflow
3. **Ask Meer**: Only after trying steps 1 and 2 for 30+ minutes
