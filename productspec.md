# PRODUCT-SPEC.md

## 📦 1. DATABASE SCHEMA

---

### 🔹 Table: profiles

Stores all users (worker, customer, admin)

| Column     | Type        | Description               |
| ---------- | ----------- | ------------------------- |
| id         | uuid (PK)   | References auth.users     |
| role       | text        | worker / customer / admin |
| full_name  | text        | User name                 |
| phone      | text        | Unique                    |
| email      | text        | Optional                  |
| avatar_url | text        | Profile photo             |
| area       | text        | User area                 |
| pin_code   | text        | Location pin              |
| created_at | timestamptz | Default now()             |

---

### 🔹 Table: worker_profiles

Extra info for workers

| Column        | Type                        | Description                  |
| ------------- | --------------------------- | ---------------------------- |
| id            | uuid (PK, FK → profiles.id) | Worker ID                    |
| skills        | text[]                      | Plumbing, Electrical etc     |
| experience    | text                        | 1-3, 3-5 etc                 |
| hourly_rate   | integer                     | ₹                            |
| service_areas | text[]                      | Locations                    |
| availability  | jsonb                       | Time slots                   |
| languages     | text[]                      | Spoken languages             |
| about         | text                        | Description                  |
| status        | text                        | pending / active / suspended |
| avg_rating    | numeric                     | Default 0                    |
| total_jobs    | integer                     | Default 0                    |

---

### 🔹 Table: jobs

Customer job requests

| Column            | Type                    | Description               |
| ----------------- | ----------------------- | ------------------------- |
| id                | uuid (PK)               | Job ID                    |
| customer_id       | uuid (FK → profiles.id) | Customer                  |
| category          | text                    | Plumbing etc              |
| description       | text                    | Problem                   |
| location          | text                    | Address                   |
| preferred_date    | date                    |                           |
| preferred_time    | text                    | morning/afternoon         |
| budget            | integer                 | Optional                  |
| status            | text                    | posted/matching/confirmed |
| matched_worker_id | uuid                    | Selected worker           |

---

### 🔹 Table: job_applications

Worker responses

| Column    | Type                    |
| --------- | ----------------------- |
| id        | uuid (PK)               |
| job_id    | uuid (FK)               |
| worker_id | uuid (FK)               |
| status    | text (accepted/skipped) |

---

### 🔹 Table: bookings

Confirmed jobs

| Column         | Type |
| -------------- | ---- |
| id             | uuid |
| job_id         | uuid |
| customer_id    | uuid |
| worker_id      | uuid |
| status         | text |
| scheduled_date | date |
| scheduled_time | text |

---

### 🔹 Table: ratings

| Column      | Type          |
| ----------- | ------------- |
| id          | uuid          |
| booking_id  | uuid          |
| rated_by    | uuid          |
| rated_user  | uuid          |
| score       | integer (1-5) |
| review_text | text          |

---

---

## 🔌 2. API CONTRACT

---

## 🔐 AUTH APIs

### POST /api/auth/send-otp

**Body:**

```json
{
  "phone": "+919876543210"
}
```

**Response:**

```json
{
  "success": true
}
```

---

### POST /api/auth/verify-otp

```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

---

### POST /api/auth/signup-worker

```json
{
  "full_name": "Ramesh",
  "skills": ["plumbing"],
  "hourly_rate": 300
}
```

---

### POST /api/auth/signup-customer

```json
{
  "full_name": "Rahul",
  "area": "Nagpur"
}
```

---

## 👷 WORKER APIs

### GET /api/workers

Query:

```
?category=plumbing&area=nagpur
```

Response:

```json
[
  {
    "id": "uuid",
    "name": "Ramesh",
    "rating": 4.5,
    "rate": 300
  }
]
```

---

### GET /api/workers/:id

Returns full profile + reviews

---

### PATCH /api/workers/:id

Update worker profile

---

## 🧾 JOB APIs

### POST /api/jobs

```json
{
  "category": "plumbing",
  "description": "Pipe leak",
  "location": "Nagpur",
  "preferred_date": "2026-03-25",
  "preferred_time": "morning"
}
```

---

### GET /api/jobs

Returns user jobs

---

### POST /api/jobs/:id/apply

Worker accepts job

---

### POST /api/jobs/:id/confirm

Customer selects worker

---

## 📦 BOOKING APIs

### GET /api/bookings

---

### PATCH /api/bookings/:id

Actions:

```json
{
  "action": "start"
}
```

---

## ⭐ RATING APIs

### POST /api/ratings

```json
{
  "booking_id": "uuid",
  "score": 5,
  "review_text": "Good work"
}
```

---

## 🔔 NOTIFICATION APIs

### GET /api/notifications

---

### PATCH /api/notifications/:id/read

---

## 🛠️ ADMIN APIs

### GET /api/admin/dashboard

---

### GET /api/admin/verification-queue

---

### PATCH /api/admin/disputes/:id

---

# 🔗 RELATIONSHIPS SUMMARY

* profiles → worker_profiles (1:1)
* profiles → jobs (1:many)
* jobs → bookings (1:1)
* bookings → ratings (1:many)

---

# 🎯 NOTES

* All APIs use JWT authentication (Supabase)
* Worker must be **active** to appear in search
* Ratings only after **completed booking**
* Phone hidden until booking confirmed

---
