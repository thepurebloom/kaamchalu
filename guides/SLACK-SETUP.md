# KaamChalu — Slack Workspace Setup Guide

---

## Step 1: Create the Workspace

1. Go to slack.com → "Create a New Workspace"
2. Workspace name: **KaamChalu**
3. Invite all 4 interns by email
4. Set your role as Workspace Owner

---

## Step 2: Create Channels

### Project Channels

| Channel | Purpose | Who's in it |
|---------|---------|-------------|
| `#general` | Announcements from Meer only. No chatter. | Everyone |
| `#kaamchalu-frontend` | Intern 1's work — page updates, UI questions, deploy status | Intern 1, Meer |
| `#kaamchalu-backend` | Intern 2's work — API updates, schema changes, endpoint status | Intern 2, Meer |
| `#kaamchalu-automation` | Intern 3's work — n8n workflows, webhook URLs, email setup | Intern 3, Meer |
| `#kaamchalu-ai-admin` | Intern 4's work — AI features, admin panel, Gemini issues | Intern 4, Meer |
| `#kaamchalu-integration` | Cross-team integration work — when 2+ interns need to connect their pieces | Everyone |
| `#standups` | Daily standups — each intern posts every morning | Everyone |
| `#blockers` | Post ONLY when you're stuck and need help from another intern | Everyone |
| `#bugs` | Bug reports with screenshots/errors during integration and testing | Everyone |
| `#deploys` | Deployment updates — "Frontend deployed to Vercel ✅" | Everyone |
| `#learning` | Share useful articles, AI prompts that worked, things you learned | Everyone |

### Channels to create later (Week 2+)

| Channel | Purpose |
|---------|---------|
| `#demo-prep` | Week 3 — demo day preparation |
| `#real-users` | Week 3 — feedback from the real business user |

---

## Step 3: Channel Descriptions & Topics

Set these so interns know exactly what goes where.

**#general**
- Description: "Announcements from Meer. Read-only for interns. Important updates only."
- Topic: "KaamChalu Intern Project — Read the PRD before asking questions"
- Post restriction: Meer only (Settings → Posting Permissions → Admins only)

**#standups**
- Description: "Post your daily standup here every morning before 10 AM"
- Topic: "Format: 1) What I finished yesterday 2) What I'm doing today 3) Am I blocked by anyone?"

**#blockers**
- Description: "Post ONLY when stuck for 30+ minutes. Tag the person you need. They must respond within 2 hours."
- Topic: "Format: What I'm trying to do → What's failing → Error message/screenshot → Who I need"

**#bugs**
- Description: "Bug reports during integration. Include: steps to reproduce, expected result, actual result, screenshot."
- Topic: "Don't fix bugs reported by others without telling them first."

**#deploys**
- Description: "Post every time you deploy. Format: [Service] deployed to [URL] — what changed"

---

## Step 4: Pin Important Messages

Pin these in **#general** (post them as Meer):

### Pinned Message 1: Project Links
```
📌 KaamChalu — Project Links

📄 PRD: [link to PRD.md in GitHub repo or paste a Google Doc link]
📋 Execution Plan: [link when interns create it]
🏗️ Architecture Diagram: [link when interns create it]

🔗 GitHub Repo: https://github.com/[your-username]/kaamchalu
🌐 Frontend (Vercel): [URL once deployed]
🔌 Backend API (Railway): [URL once deployed]
⚡ n8n Dashboard: [URL once set up]
🤖 AI Service (Railway): [URL once deployed]
🛡️ Admin Panel (Vercel): [URL once deployed]
📊 Supabase Dashboard: [URL]

📚 API Docs: docs/API.md in the repo
📚 DB Docs: docs/DATABASE.md in the repo
📚 Workflow Docs: docs/WORKFLOWS.md in the repo
```

### Pinned Message 2: Team Roles
```
📌 Team Roles

👤 Intern 1 — [Name] — Frontend (Pages, UI, Vercel)
👤 Intern 2 — [Name] — Backend (Supabase, API, Railway)
👤 Intern 3 — [Name] — Automation (n8n workflows)
👤 Intern 4 — [Name] — AI + Admin (Gemini, Admin Panel)
👤 Meer — Project Lead

Each intern's detailed guide: guides/ folder in the repo
```

### Pinned Message 3: Rules
```
📌 Rules

1. Post standup in #standups EVERY morning before 10 AM
2. If blocked for 30+ min → post in #blockers and tag who you need
3. When an endpoint/webhook/deploy is ready → post in #deploys
4. When you need something from another intern → tag them, don't DM
5. Commit to git every day. No exceptions.
6. Ask AI first, teammates second, Meer third
7. No question is stupid. Ask in your channel.
```

---

## Step 5: Slack Workflows (Built-in Automations)

Slack has a built-in Workflow Builder. Set up these automations:

### Workflow 1: Daily Standup Reminder

1. Go to: Slack → Tools → Workflow Builder → Create
2. Name: "Standup Reminder"
3. Trigger: **Scheduled** — Every weekday at 9:30 AM IST
4. Action: **Send a message to #standups**
5. Message:
```
🌅 Good morning team! Time for standup.

Reply in a thread with:

1️⃣ What did I finish yesterday? (show commit or screenshot)
2️⃣ What am I building today? (be specific)
3️⃣ Am I blocked by anyone? (tag their name)

@intern1 @intern2 @intern3 @intern4
```

### Workflow 2: End of Day Check-in

1. Trigger: **Scheduled** — Every weekday at 6:00 PM IST
2. Action: Send message to **#standups**
3. Message:
```
🌆 End of day check:

Before you log off:
- [ ] Committed and pushed code to GitHub?
- [ ] Deployment still working?
- [ ] Updated docs if you changed anything?
- [ ] Posted in #deploys if you deployed?

Reply with ✅ when done. See you tomorrow!
```

### Workflow 3: Weekly Retro Reminder (Fridays)

1. Trigger: **Scheduled** — Every Friday at 4:00 PM IST
2. Action: Send message to **#general**
3. Message:
```
📝 Weekly Retro Time!

Each person reply in a thread:

🟢 What went well this week?
🔴 What was frustrating?
💡 What would you do differently next week?
🤝 Shoutout to a teammate who helped you

@intern1 @intern2 @intern3 @intern4
```

### Workflow 4: New Blocker Alert

1. Trigger: **When a message is posted in #blockers**
2. Action: **Send a DM to Meer**
3. Message: "⚠️ New blocker posted in #blockers by {{person}}. Check it."

---

## Step 6: Integrate GitHub with Slack

This lets the team see commits and PRs directly in Slack.

### Install GitHub App for Slack:
1. Go to: slack.com/apps → Search "GitHub" → Install
2. Or in Slack: type `/github subscribe` in #deploys

### Subscribe channels to the repo:
In **#deploys**, type:
```
/github subscribe [your-username]/kaamchalu commits pulls deployments
```

Now the team sees:
- Every commit message
- Every Pull Request (opened, merged, closed)
- Every deployment status

In individual channels, subscribe to specific folders (if GitHub app supports it) or just keep it in #deploys.

---

## Step 7: Integrate n8n with Slack (for Intern 3)

n8n can send messages to Slack when workflows run. This is optional but powerful.

### Option A: n8n → Slack webhook
1. In Slack: Apps → Incoming Webhooks → Add
2. Choose channel: `#deploys` or `#kaamchalu-automation`
3. Copy the webhook URL
4. In n8n: add a "Slack" node or "HTTP Request" node that POSTs to this URL

### Option B: Use n8n's Slack node
1. In n8n: Add credentials → Slack (OAuth)
2. Use the Slack node in workflows to post messages

### What to notify Slack about:
- When a new worker signs up (post in #general: "New worker signup: [name], [skills]")
- When a job is posted (post in #general: "New job posted: [category] in [location]")
- When a workflow fails (post in #bugs: "⚠️ Workflow [name] failed: [error]")

---

## Step 8: Standup Template (Bookmark in #standups)

Create a **Canvas** or **Post** in #standups that interns can copy:

```
## Standup — [Your Name] — [Date]

### Yesterday
- Finished: [what you completed]
- Commit: [link to commit or PR]
- Deployed: [yes/no, link if yes]

### Today
- Working on: [specific task from timeline]
- Expected to finish: [what will be done by EOD]

### Blockers
- [ ] None
- [ ] Blocked by [name]: [what I need from them]
```

---

## Step 9: Create a Slack Canvas for Project Tracker

Slack Canvases are shared docs inside Slack. Create one in #general:

### Canvas: "KaamChalu — Project Status"

```
# KaamChalu Project Status
Last updated: [date]

## Epic Status

| Epic | Status | Owner | Notes |
|------|--------|-------|-------|
| 1. Project Setup | ✅ Done | All | Repo, accounts, tools ready |
| 2. Database + Auth | 🔄 In Progress | Intern 2 | Tables created, RLS pending |
| 3. Core API | ⬜ Not Started | Intern 2 | |
| 4. Worker Registration | ⬜ Not Started | Intern 1 | |
| 5. Job Posting + Browsing | ⬜ Not Started | Intern 1 | |
| 6. Matching + Booking | ⬜ Not Started | Intern 1 + 2 | |
| 7. n8n Automations | ⬜ Not Started | Intern 3 | |
| 8. AI Features | ⬜ Not Started | Intern 4 | |
| 9. Admin Panel | ⬜ Not Started | Intern 4 | |
| 10. Integration + Deploy | ⬜ Not Started | All | |
| 11. Real User Testing | ⬜ Not Started | All | |

## Deployments

| Service | URL | Status | Last deployed |
|---------|-----|--------|--------------|
| Frontend | — | Not deployed | — |
| Backend API | — | Not deployed | — |
| AI Service | — | Not deployed | — |
| Admin Panel | — | Not deployed | — |
| n8n | — | Not deployed | — |

## Integration Checkpoints

- [ ] Checkpoint 1: Auth works end-to-end (Day 6)
- [ ] Checkpoint 2: Worker flow works (Day 7)
- [ ] Checkpoint 3: Backend → n8n connected (Day 7)
- [ ] Checkpoint 4: Admin shows real data (Day 7)
- [ ] Checkpoint 5: AI scoring in workflow (Day 8)
- [ ] Checkpoint 6: Full flow works (Day 9)
```

Update this canvas in the Monday standup each week.

---

## Step 10: Slack Etiquette Rules

Post this in #general and pin it:

```
📌 Slack Rules

1. USE THREADS. Reply to messages in threads, not in the channel. Keeps things clean.

2. RIGHT CHANNEL. Don't post backend questions in #kaamchalu-frontend. Use the right channel.

3. TAG PEOPLE. If you need someone, @mention them. Don't just post and hope they see it.

4. SCREENSHOTS > DESCRIPTIONS. If something looks wrong, screenshot it. If there's an error, paste the full error message.

5. NO "HELLO" MESSAGES. Don't send "Hi" and wait for a response. Just say what you need.
   Bad: "Hi Meer"
   Good: "Hey @meer, I'm stuck on connecting Supabase auth. I get a 403 when calling signInWithOtp. Here's the error: [screenshot]. I've tried X and Y."

6. ACKNOWLEDGE. If someone asks you for something, react with 👀 (seen) or reply with when you'll get to it.

7. CELEBRATE. When something works, post it! When a teammate helps you, give them a 🙌 in #learning.
```

---

## Step 11: Bookmark Bar Links

In each intern's individual channel, add bookmarks (click the + next to bookmarks bar):

**All channels:**
- GitHub Repo: [link]
- PRD: [link]

**#kaamchalu-frontend:**
- Intern 1 Guide: [link to guide in repo]
- Vercel Dashboard: [link]
- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs

**#kaamchalu-backend:**
- Intern 2 Guide: [link]
- Supabase Dashboard: [link]
- Railway Dashboard: [link]
- Supabase Docs: https://supabase.com/docs
- Express Docs: https://expressjs.com

**#kaamchalu-automation:**
- Intern 3 Guide: [link]
- n8n Dashboard: [link]
- n8n Docs: https://docs.n8n.io

**#kaamchalu-ai-admin:**
- Intern 4 Guide: [link]
- Google AI Studio: https://aistudio.google.com
- Gemini Docs: https://ai.google.dev/docs

---

## Summary — What to Create

### Channels (11):
1. `#general` (admin-only posting)
2. `#kaamchalu-frontend`
3. `#kaamchalu-backend`
4. `#kaamchalu-automation`
5. `#kaamchalu-ai-admin`
6. `#kaamchalu-integration`
7. `#standups`
8. `#blockers`
9. `#bugs`
10. `#deploys`
11. `#learning`

### Workflows (4):
1. Daily standup reminder (9:30 AM)
2. End of day check (6:00 PM)
3. Weekly retro (Friday 4:00 PM)
4. Blocker alert DM to Meer

### Integrations (2):
1. GitHub → `#deploys`
2. n8n → Slack (optional)

### Pinned Messages (3):
1. Project links
2. Team roles
3. Rules

### Canvas (1):
1. Project status tracker

### Bookmarks:
- Docs and dashboards in each channel
