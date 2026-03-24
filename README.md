# KaamChalu

> India's Platform for Skilled Workers

KaamChalu connects blue-collar workers (plumbers, electricians, maids, drivers, cooks, etc.) with customers who need their services in Indian cities.

## Project Structure

```
kaamchalu/
├── frontend/          ← Customer + Worker web app (Next.js, Vercel) — Intern 1
├── backend/           ← API server (Express, Railway) — Intern 2
├── ai/                ← AI microservice (Gemini, Railway) — Intern 4
├── admin/             ← Admin panel (Next.js, Vercel) — Intern 4
├── automations/       ← n8n workflow exports — Intern 3
├── docs/              ← API docs, DB docs, workflow docs — Everyone reads
└── guides/            ← Intern guides and project playbook
```

## Tech Stack

| Layer | Tool |
|-------|------|
| Database + Auth | Supabase (Postgres, Phone OTP, RLS, Storage) |
| Frontend | Next.js 14 + Tailwind CSS on Vercel |
| Backend API | Node.js (Express) on Railway |
| Automations | n8n (cloud or self-hosted) |
| AI | Google Gemini API (free tier) |
| Admin Panel | Next.js + Tailwind + Chart.js on Vercel |

## Team

| Role | Responsibility |
|------|---------------|
| **Intern 1 — Frontend** | All customer + worker facing web pages |
| **Intern 2 — Backend** | Database, API, auth, deployments |
| **Intern 3 — Automation** | n8n workflows, notifications, scheduled jobs |
| **Intern 4 — AI + Admin** | AI scoring/matching, admin dashboard |

## Getting Started

1. Read the [PRD](docs/PRD.md) first
2. Read your role-specific guide in `guides/`
3. Set up your accounts (see your guide)
4. Start building!

## Links

- **Frontend**: _not deployed yet_
- **Backend API**: _not deployed yet_
- **Admin Panel**: _not deployed yet_
- **n8n**: _not set up yet_
- **Supabase**: _not set up yet_

## Git Rules

1. Never push to `main` directly
2. Create a branch: `your-name/feature-name`
3. Create a Pull Request → get reviewed → merge
4. Pull from main every morning
5. Commit messages: describe WHAT and WHY
