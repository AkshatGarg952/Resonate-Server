# Resonate Backend API Documentation for Mobile Integration

Last updated: 2026-02-14
Source of truth: `Resonate-Server/src/app.js`, `Resonate-Server/src/routes/*.js`, and controllers/services/models.

## 1. Base URL and Environment

- Base URL: `https://<your-api-domain>` (local default: `http://localhost:<PORT>`)
- Health checks:
  - `GET /`
  - `GET /health`
- API docs UI (server side): `GET /api-docs`

## 2. Authentication and Session Model (Important)

The backend uses 2-step auth:

1. Firebase token verification for auth endpoints only.
2. Cookie session (`authToken`) for all protected endpoints.

### 2.1 Auth Endpoints (`/auth/register`, `/auth/login`)

- Required header: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- Required body: JSON (register has profile fields, login does not need body fields)
- On success server sets cookie:
  - Cookie name: `authToken`
  - `HttpOnly: true`
  - Cookie `Max-Age: 7 days`
  - `secure: true` in production, false in non-prod
  - `sameSite: none` in production, `lax` in non-prod
- Session caveat: cookie may exist for 7 days, but JWT inside it expires in 1 day (`expiresIn: "1d"`).
  After ~24 hours, protected APIs can return `401 Session expired` and user should login again.

### 2.2 Protected Endpoints

- Auth middleware reads cookie only: `req.cookies.authToken`
- `Authorization: Bearer` is NOT used for protected APIs.
- Mobile app must preserve/send cookies (cookie jar/session handling).

### 2.3 Admin Authorization

Admin endpoints additionally require:
- authenticated user email equals `ADMIN_EMAIL` environment variable.

## 3. Common Conventions

- Most dates sent/returned are ISO strings.
- Some endpoints return `success: true/false`; others return `message` + data directly.
- File uploads use `multipart/form-data`.
- Error shape is not globally standardized; handle both `{ message }` and `{ error }`.

### 3.1 Verified Implementation Caveats

- `PUT /user/profile` now persists canonical fields `dateOfBirth`, `heightCm`, and `weightKg`.
- Backward compatibility is supported for legacy aliases `height` and `weight` (mapped to `heightCm`/`weightKg`).
- Legacy `age` is not used by the current schema and should not be sent by mobile clients.
- Cookie lifetime and JWT lifetime differ (7-day cookie vs 1-day JWT). Mobile app should handle relogin on `401 Session expired`.

---

## 4. Endpoint Reference

## 4.1 Health

### GET `/`
- Auth: none
- Response 200 (text):
```text
Resonate API is running...
```

### GET `/health`
- Auth: none
- Response 200:
```json
{ "status": "ok" }
```

## 4.2 Auth

### POST `/auth/register`
- Auth: Firebase bearer token required
- Headers:
  - `Authorization: Bearer <FIREBASE_ID_TOKEN>`
  - `Content-Type: application/json`
- Body (all optional except Firebase identity from token):
```json
{
  "name": "Aarav Sharma",
  "dateOfBirth": "1997-08-19",
  "weightKg": 74,
  "heightCm": 178,
  "goals": "Build muscle",
  "phone": "+919876543210",
  "gender": "male",
  "dietType": "eggetarian",
  "hasMedicalCondition": false,
  "medicalConditions": [],
  "menstrualProfile": {
    "cycleLengthDays": 28,
    "lastPeriodDate": "2026-02-01",
    "phase": "follicular"
  }
}
```
- Success 200:
```json
{
  "message": "User Registered",
  "user": {
    "_id": "...",
    "firebaseUid": "firebase_uid",
    "email": "user@example.com",
    "name": "Aarav Sharma"
  }
}
```
- Also possible 200 if already registered:
```json
{ "message": "User already registered!" }
```
- Errors: `500 { "error": "..." }`

### POST `/auth/login`
- Auth: Firebase bearer token required
- Headers:
  - `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- Body: none required
- Success 200:
```json
{ "message": "Login Success", "user": { "_id": "...", "firebaseUid": "..." } }
```
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "error": "..." }`

## 4.3 User

### GET `/user/profile`
- Auth: cookie `authToken`
- Success 200:
```json
{ "user": { "_id": "...", "firebaseUid": "...", "email": "..." } }
```
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "error": "..." }`

### PUT `/user/profile`
- Auth: cookie `authToken`
- Body (recommended canonical payload):
```json
{
  "name": "Aarav",
  "gender": "male",
  "dateOfBirth": "1997-08-19",
  "heightCm": 178,
  "weightKg": 74,
  "dietType": "vegetarian",
  "goals": "Fat loss",
  "hasMedicalCondition": true,
  "medicalConditions": ["thyroid"],
  "phone": "+919876543210",
  "menstrualProfile": {
    "cycleLengthDays": 28,
    "lastPeriodDate": "2026-02-01",
    "phase": "follicular"
  }
}
```
- Also accepted for backward compatibility:
  - `height` (mapped to `heightCm`)
  - `weight` (mapped to `weightKg`)
- `age` is ignored by the schema and should not be relied on.
- Success 200:
```json
{ "message": "Profile updated successfully", "user": { "_id": "..." } }
```
- Errors:
  - `401 { "message": "Unauthorized" }`
  - `500 { "error": "..." }`

### GET `/user/memories`
- Auth: cookie `authToken`
- Query params:
  - `category` (optional)
- Category mapping done by server:
  - `workout -> fitness.training`
  - `diet -> nutrition.intake`
  - `health -> diagnostics.blood`
  - `recovery -> recovery.sleep`
- Success 200 (Mem0 wrapper format):
```json
{
  "success": true,
  "results": [
    {
      "id": "mem_123",
      "memory": "...",
      "user_id": "firebase_uid",
      "metadata": { "category": "nutrition.intake" },
      "created_at": "2026-02-14T10:25:00.000Z",
      "updated_at": "2026-02-14T10:25:00.000Z"
    }
  ],
  "count": 1
}
```
- Errors:
  - `401 { "message": "Unauthorized" }`
  - `500 { "message": "Failed to fetch memories" }`

## 4.4 Diagnostics

### POST `/diagnostics/upload`
- Auth: cookie `authToken`
- Content-Type: `multipart/form-data`
- Form fields:
  - `report` (required): PDF file only (`application/pdf`)
- Success 200:
```json
{
  "message": "Report uploaded and parsed successfully",
  "diagnostics": {
    "_id": "...",
    "userId": "firebase_uid",
    "pdfUrl": "https://...pdf",
    "status": "completed",
    "biomarkers": {
      "hemoglobin": {
        "value": 13.6,
        "isAvailable": true,
        "status": "good",
        "unit": "g/dL",
        "category": "blood",
        "reason": "Within range",
        "categoryLabel": "Blood"
      }
    },
    "biomarkersByCategory": {},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
- Errors:
  - `401 { "message": "Unauthorized" }`
  - `400 { "message": "PDF file required" }`
  - `400 { "message": "No biomarkers found in the report" }`
  - `500 { "message": "Cloudinary upload failed" }`
  - `500 { "message": "Microservice unreachable or parsing failed" }`

### GET `/diagnostics/latest`
- Auth: cookie `authToken`
- Success 200: diagnostics object or `null`
- Error: `500 { "error": "..." }`

### GET `/diagnostics/history`
- Auth: cookie `authToken`
- Success 200: array of diagnostics objects (latest first)
- Error: `500 { "error": "..." }`

### POST `/diagnostics/fetch-from-api`
- Auth: cookie `authToken`
- Body: none
- Success 200:
```json
{
  "message": "Data fetched & processed successfully",
  "diagnostics": { "_id": "...", "status": "completed" }
}
```
- Errors:
  - `400 { "message": "No biomarker data received" }`
  - `500 { "error": "..." }`

## 4.5 Google Fit

### GET `/fit/google`
- Auth: cookie `authToken`
- Behavior: redirects to Google OAuth consent screen (302).

### GET `/fit/google/callback`
- Auth: none
- Query params:
  - `code` (required)
  - `state` (required, expected Firebase UID)
- Behavior: stores Google tokens, syncs fitness data, then redirects to:
  - `${CLIENT_URL}/dashboard`
- Errors:
  - `400 Invalid OAuth callback` (text)
  - `401 User not found` (text)
  - `500 Failed to connect Google Fit` (text)

### GET `/fit/getGoogleFitData`
- Auth: cookie `authToken`
- Success 200:
```json
{
  "stepsHistory": [{ "date": "2026-02-13", "steps": 8342 }],
  "sleepHistory": [{ "date": "2026-02-13", "sleepHours": 7.2 }],
  "workoutHistory": [{ "date": "2026-02-13", "workouts": [] }],
  "lastSyncTime": "2026-02-14T07:00:00.000Z",
  "stepGoal": 9000
}
```
- Could return `null` if not connected/synced.
- Error: `500 { "error": "..." }`

### POST `/fit/step-goal`
- Auth: cookie `authToken`
- Body:
```json
{ "stepGoal": 10000 }
```
- Success 200:
```json
{ "stepGoal": 10000 }
```
- Errors:
  - `400 { "message": "Step goal required" }`
  - `500 { "error": "..." }`

## 4.6 Water Tracking

### GET `/water`
- Auth: cookie `authToken`
- Success 200:
```json
{
  "today": { "date": "2026-02-14", "amountMl": 1200, "goalMl": 2500 },
  "history": [
    { "date": "2026-02-14", "amountMl": 1200, "goalMl": 2500 }
  ]
}
```
- Error: `500 { "message": "Server error", "error": "..." }`

### POST `/water/log`
- Auth: cookie `authToken`
- Body:
```json
{ "amountMl": 300, "date": "2026-02-14" }
```
- `date` optional (`YYYY-MM-DD`), defaults to today.
- Success 200: updated day entry
```json
{ "date": "2026-02-14", "amountMl": 1500, "goalMl": 2500 }
```
- Errors:
  - `400 { "message": "Invalid amount" }`
  - `500 { "message": "Server error", "error": "..." }`

### POST `/water/goal`
- Auth: cookie `authToken`
- Body:
```json
{ "goalMl": 2500, "date": "2026-02-14" }
```
- Success 200: updated day entry
- Errors:
  - `400 { "message": "Goal required" }`
  - `500 { "message": "Server error" }`

## 4.7 Coach Lead

### POST `/coach/create`
- Auth: cookie `authToken`
- Body:
```json
{
  "name": "Aarav Sharma",
  "phone": "+919876543210",
  "goal": ["fat_loss", "strength"]
}
```
- Validation:
  - all fields required
  - phone must match Indian format `+91XXXXXXXXXX` starting with 6-9
  - `goal` should be a non-empty array (schema level)
- Success 201:
```json
{
  "message": "Coach request submitted successfully",
  "lead": {
    "_id": "...",
    "firebaseUid": "firebase_uid",
    "name": "Aarav Sharma",
    "phone": "+919876543210",
    "goal": ["fat_loss", "strength"],
    "status": "new",
    "createdAt": "..."
  }
}
```
- Errors:
  - `400 { "message": "Name, phone number, and goal are required" }`
  - `400 { "message": "Invalid phone number" }`
  - `500 { "message": "Internal server error" }`

## 4.8 Workout

### POST `/workout/generate`
- Auth: cookie `authToken`
- Body:
```json
{
  "fitnessLevel": "intermediate",
  "equipment": ["dumbbells", "mat"],
  "timeAvailable": 45,
  "injuries": ["knee_pain"],
  "motivationLevel": "medium",
  "workoutTiming": "morning",
  "goalBarriers": ["busy_schedule"]
}
```
- Required: `fitnessLevel`, `timeAvailable`
- Success 200:
```json
{
  "status": "success",
  "plan": {
    "title": "Upper Body Strength",
    "duration": "45",
    "exercises": [
      { "name": "Push Ups", "sets": 3, "reps": "12" }
    ]
  },
  "workoutId": "..."
}
```
- Errors:
  - `400 { "message": "Missing required fields" }`
  - upstream microservice error: `4xx/5xx { "message": "Error from generator service", "detail": ... }`
  - `500 { "message": "Failed to generate workout", "error": "..." }`

### GET `/workout/history`
- Auth: cookie `authToken`
- Success 200:
```json
{ "status": "success", "workouts": [ { "_id": "...", "inputs": {}, "plan": {} } ] }
```
- Error: `500 { "message": "Failed to fetch workout history" }`

### POST `/workout/complete`
- Auth: cookie `authToken`
- Body:
```json
{
  "workoutId": "<mongo_workout_id>",
  "rpe": 8,
  "energyLevel": "medium",
  "notes": "Good session",
  "durationMinutes": 42,
  "actualExercises": [
    { "name": "Push Ups", "sets": 3, "reps": "12" }
  ]
}
```
- Required: `workoutId`
- Success 200:
```json
{ "status": "success", "message": "Workout completed", "workout": { "_id": "..." } }
```
- Errors:
  - `400 { "message": "Workout ID is required" }`
  - `404 { "message": "Workout not found" }`
  - `500 { "message": "Failed to complete workout" }`

## 4.9 Nutrition

### GET `/nutrition/daily-suggestions`
- Auth: cookie `authToken`
- Success 200 (existing plan):
```json
{ "status": "success", "plan": { "breakfast": {} }, "date": "2026-02-14T00:00:00.000Z" }
```
- Success 200 (none generated today):
```json
{ "status": "no_plan", "message": "No plan generated for today" }
```
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "message": "Internal server error" }`

### POST `/nutrition/daily-suggestions`
- Auth: cookie `authToken`
- Body: none required
- Success 200:
```json
{ "status": "success", "plan": { "breakfast": {}, "lunch": {}, "dinner": {} } }
```
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "message": "Failed to regenerate plan" }`
  - `500 { "message": "Internal server error" }`

### GET `/nutrition/history`
- Auth: cookie `authToken`
- Success 200:
```json
{ "status": "success", "history": [ { "_id": "...", "plan": {}, "date": "..." } ] }
```
- Server returns max 30 records.
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "message": "Failed to fetch history" }`

## 4.10 Food

### POST `/food/analyze`
- Auth: cookie `authToken`
- Content-Type: `multipart/form-data`
- Form fields:
  - `image` (required): `jpeg/jpg/png/webp`, max 5MB
  - `cuisine` (optional): string, default `General`
- Success 200:
```json
{
  "message": "Food analyzed and saved successfully",
  "data": {
    "food_name": "Paneer Tikka",
    "description": "...",
    "ingredients": ["paneer"],
    "nutritional_info": {
      "calories": 280,
      "protein": "18g",
      "carbohydrates": "12g",
      "fats": "16g",
      "fiber": "3g"
    },
    "health_rating": 8,
    "suggestions": "..."
  },
  "imageUrl": "https://...",
  "logId": "..."
}
```
- Errors:
  - `401 { "message": "Unauthorized" }`
  - `400 { "message": "Image file required" }`
  - `500 { "message": "Image upload failed" }`
  - `500 { "message": "Failed to analyze food image with AI", "detail": "..." }`

### GET `/food/history`
- Auth: cookie `authToken`
- Success 200:
```json
{ "status": "success", "history": [ { "_id": "...", "foodName": "...", "nutritionalInfo": {} } ] }
```
- Errors:
  - `401 { "message": "Unauthorized" }`
  - `500 { "message": "Failed to fetch food history" }`

## 4.11 Interventions

Base path: `/api/interventions`

### POST `/api/interventions`
- Auth: cookie `authToken`
- Body (required fields from model):
```json
{
  "type": "sleep",
  "recommendation": "Sleep before 11 PM",
  "rationale": "Low recovery trend",
  "startDate": "2026-02-14",
  "durationDays": 14,
  "targetMetric": "sleep_hours",
  "targetValue": 7.5,
  "checkInFrequency": "daily"
}
```
- Success 201:
```json
{ "success": true, "intervention": { "_id": "...", "status": "active" } }
```
- Error: `500 { "success": false, "message": "Failed to create intervention", "error": "..." }`

### GET `/api/interventions/active`
- Auth: cookie `authToken`
- Success 200:
```json
{ "success": true, "interventions": [ { "_id": "...", "status": "active" } ] }
```

### GET `/api/interventions`
- Auth: cookie `authToken`
- Success 200:
```json
{ "success": true, "interventions": [ { "_id": "..." } ] }
```

### POST `/api/interventions/:id/outcome`
- Auth: cookie `authToken`
- Path params:
  - `id`: intervention Mongo `_id`
- Body:
```json
{
  "metricValue": 7.1,
  "notes": "Sleep quality improved",
  "status": "completed"
}
```
- Success 200:
```json
{ "success": true, "intervention": { "_id": "...", "outcomes": [ { "metricValue": 7.1 } ] } }
```
- Error: `500 { "success": false, "message": "Failed to record outcome", "error": "..." }`

### GET `/api/interventions/:id/analysis`
- Auth: cookie `authToken`
- Success 200:
```json
{
  "success": true,
  "analysis": {
    "interventionId": "...",
    "target": 7.5,
    "actual": 7.1,
    "notes": "Sleep quality improved"
  }
}
```
- Not found:
```json
{ "success": false, "message": "Intervention not found or no data" }
```

### POST `/api/interventions/suggest`
- Auth: cookie `authToken`
- Body: none required
- Success 200:
```json
{
  "success": true,
  "suggestions": [
    { "title": "Evening wind-down", "description": "...", "type": "sleep" }
  ],
  "contextUsed": {}
}
```
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "success": false, "message": "Failed to generate suggestions", "error": "..." }`

### PATCH `/api/interventions/:id/stop`
- Auth: cookie `authToken`
- Body:
```json
{ "reason": "Not feasible with schedule" }
```
- Success 200:
```json
{ "success": true, "intervention": { "_id": "...", "status": "discontinued" } }
```

### PUT `/api/interventions/:id`
- Auth: cookie `authToken`
- Body: partial intervention fields
- Success 200:
```json
{ "success": true, "intervention": { "_id": "..." } }
```

## 4.12 Daily Logs

Base path: `/api/daily-logs`

### POST `/api/daily-logs`
- Auth: cookie `authToken`
- Body:
```json
{
  "date": "2026-02-14",
  "energyLevel": 7,
  "sleepQuality": 6,
  "stressLevel": 5,
  "mood": "Calm",
  "symptoms": ["mild headache"],
  "notes": "Better than yesterday"
}
```
- Behavior: updates same-day log if already exists, else creates new.
- Success 200:
```json
{ "success": true, "dailyLog": { "_id": "...", "date": "..." } }
```
- Error: `500 { "success": false, "message": "Server Error", "error": "..." }`

### GET `/api/daily-logs/weekly`
- Auth: cookie `authToken`
- Returns logs from last 7 days (ascending by date)
- Success 200:
```json
{ "success": true, "logs": [ { "_id": "...", "date": "..." } ] }
```

### GET `/api/daily-logs`
- Auth: cookie `authToken`
- Returns all logs (descending by date)
- Success 200:
```json
{ "success": true, "logs": [ { "_id": "..." } ] }
```

## 4.13 Insights

Base path: `/api/insights`

### GET `/api/insights/daily`
- Auth: cookie `authToken`
- Success 200:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "type": "warning",
      "title": "Recovery Risk",
      "message": "...",
      "evidence": ["..."],
      "suggested_intervention": "reduce_volume"
    }
  ],
  "generated_at": "2026-02-14T09:21:33.000Z"
}
```
- Error:
```json
{ "success": false, "message": "Failed to generate insights", "error": "..." }
```

### GET `/api/insights/test-gen` (Dev only)
- Enabled only when `NODE_ENV !== 'production'`
- Auth: none
- Query: `userId` optional
- Success 200:
```json
{ "success": true, "count": 1, "data": [ { "type": "suggestion", "title": "..." } ] }
```
- In production: `403 { "message": "Forbidden" }`

## 4.14 Admin Memory

Base path: `/api/admin/memory`
Requires: cookie auth + admin email check.

### GET `/api/admin/memory/:userId`
- Path param `userId` can be:
  - Firebase UID
  - Mongo ObjectId
  - email
- Query params:
  - `category` optional
  - `limit` optional (default 20)
  - `query` optional (default `*`)
- Success 200:
```json
{
  "status": "success",
  "requestedUserId": "...",
  "userId": "firebase_uid",
  "memoryUserId": "firebase_uid",
  "mongoUserId": "...",
  "email": "user@example.com",
  "count": 2,
  "data": [ { "id": "mem_1", "memory": "...", "metadata": {} } ]
}
```
- Errors:
  - `404 { "message": "User not found" }`
  - `500 { "message": "Failed to fetch memories" }`

### POST `/api/admin/memory/:userId`
- Body:
```json
{
  "text": "User reported improved sleep quality this week.",
  "metadata": {
    "category": "recovery.sleep",
    "source": "admin_manual",
    "module_specific": { "note": "manual backfill" }
  }
}
```
- `text` required
- Metadata defaults if omitted:
  - `category: user.defined`
  - `source: admin_manual`
  - `module_specific: {}`
- Success 200:
```json
{ "status": "success", "message": "Memory added manually", "userId": "firebase_uid" }
```
- Errors:
  - `400 { "message": "Text required" }`
  - `404 { "message": "User not found" }`
  - `500 { "message": "Failed to add memory" }`

### DELETE `/api/admin/memory/:memoryId`
- Path param: Mem0 memory ID
- Success 200:
```json
{ "status": "success", "message": "Memory deleted" }
```
- Errors:
  - `400 { "message": "Memory ID is required" }`
  - `500 { "message": "Failed to delete memory" }`

## 4.15 Admin Dashboard

Base path: `/api/admin/dashboard`
Requires: cookie auth + admin email check.

### GET `/api/admin/dashboard/stats`
- Success 200:
```json
{
  "success": true,
  "stats": {
    "total_memories": "N/A (Mem0 Aggregation Pending)",
    "active_users_with_memory": "N/A",
    "system_status": "Healthy",
    "last_updated": "2026-02-14T09:00:00.000Z"
  }
}
```

### GET `/api/admin/dashboard/insights/recent`
- Success 200:
```json
{ "success": true, "insights": [] }
```

### GET `/api/admin/dashboard/user/:userId`
- `userId` can be Firebase UID / Mongo ObjectId / email
- Success 200:
```json
{
  "success": true,
  "requestedUserId": "...",
  "userId": "firebase_uid",
  "memoryUserId": "firebase_uid",
  "mongoUserId": "...",
  "email": "user@example.com",
  "count": 3,
  "memories": [ { "id": "...", "memory": "...", "metadata": {} } ]
}
```
- Errors:
  - `404 { "success": false, "message": "User not found" }`
  - `500 { "success": false, "message": "Failed to fetch user memories" }`

---

## 5. Data Shapes (Quick Reference)

### User
```json
{
  "_id": "...",
  "firebaseUid": "string",
  "email": "string",
  "name": "string",
  "phone": "string",
  "gender": "male|female|other",
  "fitnessProvider": "google_fit|apple_health",
  "fitnessConnected": true,
  "dateOfBirth": "date",
  "heightCm": 175,
  "weightKg": 72,
  "goals": "string",
  "dietType": "vegetarian|eggetarian|non_vegetarian",
  "googleFit": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiryDate": 0
  },
  "hasMedicalCondition": false,
  "medicalConditions": [],
  "menstrualProfile": {
    "cycleLengthDays": 28,
    "lastPeriodDate": "date",
    "phase": "string"
  }
}
```

### Diagnostics biomarker item
```json
{
  "value": 13.5,
  "isAvailable": true,
  "status": "good|bad|unavailable|unknown",
  "unit": "g/dL",
  "category": "string",
  "reason": "string",
  "categoryLabel": "string"
}
```

### FitnessData water entry
```json
{ "date": "YYYY-MM-DD", "amountMl": 1200, "goalMl": 2500 }
```

### Insight item
```json
{
  "type": "critical|warning|action|suggestion|positive",
  "title": "string",
  "message": "string",
  "evidence": ["string"],
  "suggested_intervention": "string"
}
```

---

## 6. Mobile Integration Notes

1. Session handling is cookie-based after login/register. Ensure your mobile HTTP client persists cookies automatically.
2. For webview-based OAuth (`/fit/google`), preserve same cookie session before opening OAuth flow.
3. Multipart field names must be exact:
   - diagnostics: `report`
   - food: `image`
4. Admin routes are safe to hide behind role-based UI because backend enforces admin via email check.
5. Some endpoints return plain text on redirect/error (`/fit/google/callback`) while most return JSON.
6. Server responses are not fully uniform; code defensively for both `message` and `error` keys.

---

## 7. Route Coverage Checklist

Documented routes:
- `/`, `/health`
- `/auth/register`, `/auth/login`
- `/user/profile` (GET/PUT), `/user/memories`
- `/diagnostics/upload`, `/diagnostics/latest`, `/diagnostics/history`, `/diagnostics/fetch-from-api`
- `/fit/google`, `/fit/google/callback`, `/fit/getGoogleFitData`, `/fit/step-goal`
- `/water`, `/water/log`, `/water/goal`
- `/coach/create`
- `/workout/generate`, `/workout/history`, `/workout/complete`
- `/nutrition/daily-suggestions` (GET/POST), `/nutrition/history`
- `/food/analyze`, `/food/history`
- `/api/interventions` (+ all subroutes)
- `/api/daily-logs` (+ weekly)
- `/api/insights/daily`, `/api/insights/test-gen` (dev)
- `/api/admin/memory` (+ subroutes)
- `/api/admin/dashboard` (+ subroutes)



