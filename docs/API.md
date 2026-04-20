# Kaamchalu API Documentation

## Auth Routes

### User Signup
**Method**: POST
**URL**: `/api/auth/signup`
**Auth**: Not required
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { ... }
}
```
**Error Responses**:
- 400: `{ "error": "Email and password are required" }`
- 500: `{ "error": "Internal server error" }`

### User Login
**Method**: POST
**URL**: `/api/auth/login`
**Auth**: Not required
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
```
**Response**:
```json
{
  "success": true,
  "session": {
    "access_token": "eyJhbGci...",
    "user": { ... }
  }
}
```
**Error Responses**:
- 400: `{ "error": "Email and password are required" }`
- 401: `{ "error": "Invalid login credentials" }`
- 500: `{ "error": "Internal server error" }`

### Signup Worker
**Method**: POST
**URL**: `/api/auth/signup-worker`
**Auth**: Required
**Request Body**:
```json
{
  "full_name": "Ramesh Kumar",
  "skills": ["plumbing", "electrical"],
  "experience": "3-5",
  "hourly_rate": 300,
  "service_areas": ["400001", "Andheri"],
  "availability": { "monday": ["morning", "afternoon"] },
  "languages": ["hindi", "marathi"],
  "about": "Expert plumber with 4 years experience",
  "aadhaar_number": "123412341234"
}
```
**Response**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "role": "worker",
    "full_name": "Ramesh Kumar",
    "status": "pending_verification"
  }
}
```
**Error Responses**:
- 400: `{ "error": "Error creating worker profile..." }`
- 401: `{ "error": "Unauthorized" }`

### Signup Customer
**Method**: POST
**URL**: `/api/auth/signup-customer`
**Auth**: Required
**Request Body**:
```json
{
  "full_name": "Amit Sharma",
  "area": "Bandra",
  "pin_code": "400050",
  "email": "amit@example.com"
}
```
**Response**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "role": "customer",
    "full_name": "Amit Sharma"
  }
}
```
**Error Responses**:
- 400: `{ "error": "Error creating customer profile" }`
- 401: `{ "error": "Unauthorized" }`

### Get Current User Profile
**Method**: GET
**URL**: `/api/auth/me`
**Auth**: Required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "user": { ... },
  "profile": { "id": "uuid", "role": "customer", "full_name": "Amit Sharma" },
  "worker_profile": null
}
```
**Error Responses**:
- 401: `{ "error": "Unauthorized" }`

---

## Worker Routes

### Get Workers List
**Method**: GET
**URL**: `/api/workers?category=plumbing&limit=10&page=1`
**Auth**: Not required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "skills": ["plumbing"],
      "hourly_rate": 300,
      "avg_rating": 4.5,
      "profiles": {
        "full_name": "Ramesh Kumar",
        "avatar_url": "url"
      }
    }
  ],
  "metadata": { "total": 1, "page": 1, "limit": 10 }
}
```
**Error Responses**:
- 400: `{ "error": "Invalid query parameters" }`
- 500: `{ "error": "Internal server error" }`

### Get Worker By ID
**Method**: GET
**URL**: `/api/workers/:id`
**Auth**: Optional (Required if status is inactive)
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "worker": { ... },
  "ratings": [ ... ]
}
```
**Error Responses**:
- 403: `{ "error": "Not authorized to view inactive worker profile" }`
- 404: `{ "error": "Worker not found" }`

### Update Given Worker Profile
**Method**: PATCH
**URL**: `/api/workers/:id`
**Auth**: Required (Owner)
**Request Body**:
```json
{
  "hourly_rate": 350,
  "about": "Updated about section"
}
```
**Response**:
```json
{
  "success": true,
  "worker": { ... }
}
```
**Error Responses**:
- 400: `{ "error": "No valid fields provided for update" }`
- 401: `{ "error": "Unauthorized" }`
- 403: `{ "error": "You can only update your own profile" }`

### Update Worker Status (Admin)
**Method**: PATCH
**URL**: `/api/workers/:id/status`
**Auth**: Admin only
**Request Body**:
```json
{
  "status": "active",
  "reason": "Documents verified successfully"
}
```
**Response**:
```json
{
  "success": true,
  "worker": { "status": "active", "verified_at": "timestamp" }
}
```
**Error Responses**:
- 400: `{ "error": "Invalid status" }`
- 403: `{ "error": "Only admins can update worker status" }`

---

## Job Routes

### Create a Job
**Method**: POST
**URL**: `/api/jobs`
**Auth**: Required (Customer only)
**Request Body**:
```json
{
  "category": "plumbing",
  "description": "Leaky faucet in kitchen",
  "location": "A-123, Pearl Apartments, Andheri",
  "pin_code": "400053",
  "preferred_date": "2026-05-15",
  "preferred_time": "morning",
  "budget": 500
}
```
**Response**:
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "status": "posted"
  }
}
```
**Error Responses**:
- 400: `{ "error": "Invalid job details" }`
- 403: `{ "error": "Only customers can post jobs" }`

### Get Jobs List
**Method**: GET
**URL**: `/api/jobs?status=posted`
**Auth**: Required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "jobs": [ { ... } ],
  "metadata": { "total": 1, "page": 1, "limit": 20 }
}
```
**Error Responses**:
- 401: `{ "error": "Unauthorized" }`

### Get Job Details
**Method**: GET
**URL**: `/api/jobs/:id`
**Auth**: Required (Involved parties or Admin)
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "job": { ... },
  "applications": [ { ... } ],
  "booking": null
}
```
**Error Responses**:
- 403: `{ "error": "Not authorized to view this job" }`
- 404: `{ "error": "Job not found" }`

### Apply for Job
**Method**: POST
**URL**: `/api/jobs/:id/apply`
**Auth**: Required (Worker only)
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "application": {
    "job_id": "uuid",
    "worker_id": "uuid",
    "status": "accepted"
  }
}
```
**Error Responses**:
- 403: `{ "error": "Only workers can apply" }`
- 404: `{ "error": "Job not found" }`

### Confirm Booking for Job
**Method**: POST
**URL**: `/api/jobs/:id/confirm`
**Auth**: Required (Customer only)
**Request Body**:
```json
{
  "worker_id": "uuid_of_chosen_worker"
}
```
**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "confirmed"
  }
}
```
**Error Responses**:
- 400: `{ "error": "worker_id is required" }`
- 403: `{ "error": "Not your job" }`
- 404: `{ "error": "Job not found" }`

---

## Booking Routes

### Get Bookings
**Method**: GET
**URL**: `/api/bookings`
**Auth**: Required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "bookings": [ { ... } ],
  "metadata": { "total": 2, "page": 1, "limit": 20 }
}
```
**Error Responses**:
- 401: `{ "error": "Unauthorized" }`

### Get Booking By ID
**Method**: GET
**URL**: `/api/bookings/:id`
**Auth**: Required (Involved parties or Admin)
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "booking": { ... },
  "ratings": [ ... ]
}
```
**Error Responses**:
- 403: `{ "error": "Not authorized" }`
- 404: `{ "error": "Booking not found" }`

### Update Booking Action
**Method**: PATCH
**URL**: `/api/bookings/:id`
**Auth**: Required (Involved parties or Admin)
**Request Body**:
```json
{
  "action": "start" 
}
```
*Valid actions: `start`, `complete`, `cancel`, `dispute`. For `dispute`, supply a `reason` key.*
**Response**:
```json
{
  "success": true,
  "booking": { "status": "in_progress" }
}
```
**Error Responses**:
- 400: `{ "error": "Invalid action specified" }`
- 403: `{ "error": "Only worker can start" }`
- 404: `{ "error": "Booking not found" }`

---

## Rating Routes

### Post a Rating
**Method**: POST
**URL**: `/api/ratings`
**Auth**: Required
**Request Body**:
```json
{
  "booking_id": "uuid",
  "score": 5,
  "review_text": "Excellent plumbing service!"
}
```
**Response**:
```json
{
  "success": true,
  "rating": { ... }
}
```
**Error Responses**:
- 400: `{ "error": "You have already rated this booking" }`
- 403: `{ "error": "You are not part of this booking" }`

### Get Ratings
**Method**: GET
**URL**: `/api/ratings?user_id=123&page=1`
**Auth**: Not required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "data": [ { ... } ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```
**Error Responses**:
- 500: `{ "error": "Internal server error" }`

### Flag Rating (Admin)
**Method**: PATCH
**URL**: `/api/ratings/:id/flag`
**Auth**: Admin only
**Request Body**:
```json
{
  "is_flagged": true
}
```
**Response**:
```json
{
  "success": true,
  "rating": { "is_flagged": true }
}
```
**Error Responses**:
- 400: `{ "error": "is_flagged must be a boolean" }`
- 403: `{ "error": "Admin access required" }`

---

## Notification Routes

### Get Notifications
**Method**: GET
**URL**: `/api/notifications`
**Auth**: Required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "data": [ { ... } ],
  "unread_count": 3,
  "pagination": { "total": 10, "page": 1, "limit": 20, "total_pages": 1 }
}
```
**Error Responses**:
- 401: `{ "error": "Unauthorized" }`

### Mark Notification as Read
**Method**: PATCH
**URL**: `/api/notifications/:id/read`
**Auth**: Required (Owner)
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "notification": { "is_read": true }
}
```
**Error Responses**:
- 403: `{ "error": "You do not have permission to read this notification" }`
- 404: `{ "error": "Notification not found" }`

### Mark All as Read
**Method**: POST
**URL**: `/api/notifications/read-all`
**Auth**: Required
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```
**Error Responses**:
- 401: `{ "error": "Unauthorized" }`

---

## Admin Routes

### Admin Dashboard
**Method**: GET
**URL**: `/api/admin/dashboard`
**Auth**: Admin only
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "dashboard": {
    "total_workers": { "active": 10, "pending": 2, "suspended": 0 },
    "total_customers": 50,
    "bookings": { "today": 5, "this_week": 12, "this_month": 40 },
    "completion_rate": 95.5,
    "avg_rating": 4.6,
    "open_disputes": 1
  }
}
```
**Error Responses**:
- 403: `{ "error": "Admin access required" }`

### Get Verification Queue
**Method**: GET
**URL**: `/api/admin/verification-queue`
**Auth**: Admin only
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "data": [ { ... } ]
}
```
**Error Responses**:
- 403: `{ "error": "Admin access required" }`

### Admin Get Users
**Method**: GET
**URL**: `/api/admin/users?role=worker&status=active`
**Auth**: Admin only
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "data": [ { ... } ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```
**Error Responses**:
- 403: `{ "error": "Admin access required" }`

### Admin Get Disputes
**Method**: GET
**URL**: `/api/admin/disputes?status=open`
**Auth**: Admin only
**Request Body**:
```json
{}
```
**Response**:
```json
{
  "success": true,
  "data": [ { ... } ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "total_pages": 1 }
}
```
**Error Responses**:
- 403: `{ "error": "Admin access required" }`

### Update Dispute Status
**Method**: PATCH
**URL**: `/api/admin/disputes/:id`
**Auth**: Admin only
**Request Body**:
```json
{
  "status": "resolved",
  "resolution": "Refunded customer",
  "admin_notes": "Worker verified mistake"
}
```
**Response**:
```json
{
  "success": true,
  "dispute": { "status": "resolved", "resolved_at": "timestamp" }
}
```
**Error Responses**:
- 403: `{ "error": "Admin access required" }`
- 500: `{ "error": "Failed to update dispute" }`
