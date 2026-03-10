# 📋 TalentAI Recruitment Portal - Complete API Documentation

## Overview
Full-stack recruitment platform with role-based access control, AI-powered resume/behavioral analysis, and applicant tracking.

**Base URL:** `http://localhost:8000`

---

## 🔐 Authentication

### Bearer Token
All protected endpoints require this header:
```
Authorization: Bearer dev-static-token
```

### User Roles
- **`recruiter`** - Post jobs, view applicants, make hiring decisions
- **`candidate`** - Apply for jobs, view applications, take assessments

---

## 📚 API Endpoints

### 1️⃣ Authentication Routes (`/api/auth`)

#### POST `/api/auth/login`
**Access:** Public (No auth required)

**Request:**
```json
{
  "username": "john_recruiter",
  "password": "password123",
  "role": "recruiter"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "john_recruiter",
    "role": "recruiter"
  },
  "token": "jwt_token_here"
}
```

**Roles:** Both recruiter & candidate ✅

---

#### POST `/api/auth/signup`
**Access:** Public (No auth required)

**Request:**
```json
{
  "username": "jane_candidate",
  "password": "securepass123",
  "role": "candidate"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "username": "jane_candidate",
    "role": "candidate"
  },
  "token": "jwt_token_here"
}
```

**Roles:** Both recruiter & candidate ✅

---

#### POST `/api/auth/logout`
**Access:** Protected 🔒

**Request:**
```
Header: Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Roles:** Both recruiter & candidate ✅

---

### 2️⃣ Jobs Routes (`/api/jobs`)

#### GET `/api/jobs`
**Access:** Protected 🔒

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `page_size` (int, default: 10) - Results per page

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "total": 5,
  "page": 1,
  "page_size": 10,
  "jobs": [
    {
      "id": "job-uuid",
      "title": "Senior Python Developer",
      "description": "Looking for experienced Python dev...",
      "location": "Remote",
      "job_type": "Full-time",
      "experience_required": "5+ years",
      "required_skills": ["Python", "FastAPI", "PostgreSQL"],
      "created_by": "recruiter-uuid",
      "created_at": "2026-02-15",
      "applicant_count": 3,
      "is_active": true
    }
  ]
}
```

**Roles:** Both recruiter & candidate ✅

---

#### POST `/api/jobs`
**Access:** Protected 🔒 (Recruiter Only)

**Request:**
```json
{
  "title": "Full Stack Developer",
  "description": "Build scalable web applications",
  "location": "Bangalore",
  "job_type": "Full-time",
  "experience_required": "3+ years",
  "required_skills": ["React", "Node.js", "MongoDB"],
  "salary_range": "60K-100K"
}
```

**Response (201 Created):**
```json
{
  "id": "new-job-uuid",
  "title": "Full Stack Developer",
  "created_by": "recruiter-uuid",
  "created_at": "2026-02-15",
  "applicant_count": 0,
  "is_active": true
}
```

**Roles:** Recruiter only 👔

**Errors:**
- `403 Forbidden` - Candidate tried to create job
- `422 Unprocessable Entity` - Invalid data

---

#### GET `/api/jobs/{job_id}`
**Access:** Protected 🔒

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "id": "job-uuid",
  "title": "Senior Python Developer",
  "description": "...",
  "location": "Remote",
  "required_skills": ["Python", "FastAPI"],
  "applicant_count": 2,
  "is_active": true
}
```

**Roles:** Both recruiter & candidate ✅

---

#### PUT `/api/jobs/{job_id}`
**Access:** Protected 🔒 (Recruiter Owner Only)

**Request:**
```json
{
  "title": "Senior Python Developer (Updated)",
  "salary_range": "90K-130K"
}
```

**Response (200 OK):**
```json
{
  "id": "job-uuid",
  "title": "Senior Python Developer (Updated)",
  "updated_at": "2026-02-15T14:30:00"
}
```

**Roles:** Recruiter (job owner) only 👔

**Errors:**
- `403 Forbidden` - Not job creator
- `404 Not Found` - Job doesn't exist

---

#### DELETE `/api/jobs/{job_id}`
**Access:** Protected 🔒 (Recruiter Owner Only)

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

**Roles:** Recruiter (job owner) only 👔

**Note:** Soft delete (data preserved in DB)

---

### 3️⃣ Applications Routes (`/api/applications`)

#### POST `/api/applications/jobs/{job_id}/apply`
**Access:** Protected 🔒 (Candidate Only)

**Request (Form Data):**
```
- candidate_name: "John Doe" (string)
- job_id: "job-uuid" (from URL)
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicant_id": "applicant-uuid",
  "applied_at": "2026-02-15T14:30:00"
}
```

**Roles:** Candidate only 👤

**Workflow:**
1. Application recorded in database
2. Resume can be added separately
3. Behavior assessment scores added later

**Errors:**
- `403 Forbidden` - Recruiter tried to apply
- `404 Not Found` - Job doesn't exist
- `409 Conflict` - Already applied

---

#### GET `/api/applications/my`
**Access:** Protected 🔒 (Candidate Only)

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "applications": [
    {
      "id": "applicant-uuid",
      "candidate_name": "John Doe",
      "job_id": "job-uuid",
      "applied_at": "2026-02-15T14:30:00",
      "status": "Shortlisted",
      "resume_score": 87,
      "behavioural_score": 82,
      "fit_score": 85,
      "locked": true
    }
  ],
  "total": 2
}
```

**Roles:** Candidate only 👤

---

#### GET `/api/applications/jobs/{job_id}/applicants`
**Access:** Protected 🔒 (Recruiter Owner Only)

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "job_id": "job-uuid",
  "job_title": "Senior Python Developer",
  "applicant_count": 2,
  "applicants": [
    {
      "id": "applicant-1",
      "candidate_name": "Alice Johnson",
      "status": "Shortlisted",
      "resume_score": 89,
      "behavioural_score": 84,
      "fit_score": 87,
      "locked": true,
      "applied_at": "2026-02-14T10:30:00"
    },
    {
      "id": "applicant-2",
      "candidate_name": "Bob Smith",
      "status": "Under Review",
      "resume_score": 72,
      "behavioural_score": 68,
      "fit_score": 70,
      "locked": false,
      "applied_at": "2026-02-15T14:30:00"
    }
  ]
}
```

**Roles:** Recruiter (job owner) only 👔

---

#### PUT `/api/applications/applicants/{applicant_id}/status`
**Access:** Protected 🔒 (Recruiter Owner Only)

**Request:**
```json
{
  "status": "Shortlisted"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Applicant status updated to Shortlisted",
  "applicant_id": "applicant-uuid",
  "status": "Shortlisted"
}
```

**Status Options:**
- `Shortlisted` ✅
- `Rejected` ❌
- `Under Review` (default) ⏳

**Roles:** Recruiter (job owner) only 👔

---

#### PUT `/api/applications/applicants/{applicant_id}/unlock`
**Access:** Protected 🔒 (Recruiter Owner Only)

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Decision unlocked"
}
```

**Use Case:** Recruiter wants to change a decision

**Roles:** Recruiter (job owner) only 👔

---

### 4️⃣ Behavioral Analysis Routes (`/api/behavioural`)

#### POST `/api/behavioural/analyze`
**Access:** Protected 🔒

**Request:**
```json
{
  "candidate_id": "candidate-uuid",
  "job_id": "job-uuid",
  "responses": [
    {
      "question_id": "q1",
      "text": "I took initiative to lead a team project when the manager was overwhelmed"
    },
    {
      "question_id": "q2",
      "text": "I adapted quickly when technologies changed mid-project"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "sentiment": {
    "polarity": 0.75,
    "label": "Positive"
  },
  "big_five": {
    "openness": 0.78,
    "conscientiousness": 0.85,
    "extraversion": 0.72,
    "agreeableness": 0.81,
    "neuroticism": 0.35
  },
  "soft_skills": {
    "communication": 0.85,
    "teamwork": 0.82,
    "leadership": 0.78,
    "emotional_stability": 0.65
  },
  "behavioural_score": 0.82
}
```

**Roles:** Both recruiter & candidate ✅

---

#### GET `/api/behavioural/jobs`
**Access:** Protected 🔒

**Response (200 OK):**
```json
{
  "jobs": ["job-uuid-1", "job-uuid-2", "job-uuid-3"],
  "total": 3
}
```

**Roles:** Both recruiter & candidate ✅

---

#### GET `/api/behavioural/jobs/{job_id}`
**Access:** Protected 🔒

**Response (200 OK):**
```json
{
  "job_id": "job-uuid",
  "candidate_count": 5,
  "candidates": [
    {
      "candidate_id": "cand-1",
      "behavioural_score": 0.82,
      "big_five": { ... },
      "timestamp": "2026-02-15T14:30:00"
    }
  ]
}
```

**Roles:** Both recruiter & candidate ✅

---

### 5️⃣ Resume Analysis Routes (`/api/resume`)

#### POST `/api/resume/analyze`
**Access:** Protected 🔒

**Request (Multipart Form Data):**
```
- jd_text: "Job Description..." (textarea)
- file: resume.pdf (file upload)
```

**Response (200 OK):**
```json
{
  "candidate_name": "John Doe",
  "resume_score": 87,
  "extracted_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
  "match_explanation": "Strong technical fit with relevant experience",
  "scores": {
    "final_weighted_score": 85
  },
  "analysis_report_pdf": "/reports/report_123.pdf"
}
```

**Roles:** Protected 🔒

---

#### GET `/api/resume/ranking`
**Access:** Protected 🔒

**Response (200 OK):**
```json
[
  {
    "candidate_name": "Alice Johnson",
    "score": 89,
    "pdf": "/reports/alice_report.pdf"
  },
  {
    "candidate_name": "Bob Smith",
    "score": 72,
    "pdf": "/reports/bob_report.pdf"
  }
]
```

**Roles:** Protected 🔒

---

#### GET `/api/resume/reports/{filename}`
**Access:** Protected 🔒

**Headers:**
```
Authorization: Bearer dev-static-token
```

**Response:** PDF file download

**Roles:** Protected 🔒

---

### 6️⃣ AI/ML Routes (`/api/ai`)

#### POST `/api/ai/generate-questions`
**Access:** Protected 🔒

**Request:**
```json
{
  "job_description": "Senior Python Developer needed. 5+ years experience with FastAPI, PostgreSQL, AWS."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "job_description_preview": "Senior Python Developer needed...",
  "questions": [
    "Tell us about your experience with FastAPI. What were the key challenges?",
    "Describe a time you optimized database performance.",
    "How do you handle tight deadlines?",
    "Tell us about your AWS experience.",
    "Describe a challenging problem you solved."
  ],
  "total_questions": 10,
  "message": "Questions generated successfully"
}
```

**Roles:** Both recruiter & candidate ✅

---

#### POST `/api/ai/parse-resume`
**Access:** Protected 🔒

**Response:**
```json
{
  "success": true,
  "message": "Use POST /api/resume/analyze to parse resumes"
}
```

**Roles:** Both recruiter & candidate ✅

---

#### POST `/api/ai/analyze-behaviour`
**Access:** Protected 🔒

**Response:**
```json
{
  "success": true,
  "message": "Use POST /api/behavioural/analyze for behaviour analysis"
}
```

**Roles:** Both recruiter & candidate ✅

---

## 🔄 Complete Application Workflow

### CANDIDATE WORKFLOW
```
1. SIGNUP/LOGIN
   POST /api/auth/signup → Get JWT token
   
2. BROWSE JOBS
   GET /api/jobs → View all job postings
   GET /api/jobs/{job_id} → View job details
   
3. APPLY FOR JOB
   POST /api/ai/generate-questions → Get behavioral questions
   POST /api/applications/jobs/{job_id}/apply
   ├── Application recorded
   └── Can view status
   
4. TRACK APPLICATION
   GET /api/applications/my → View all applications
   └── Status: Under Review → Shortlisted/Rejected

5. LOGOUT
   POST /api/auth/logout
```

### RECRUITER WORKFLOW
```
1. SIGNUP/LOGIN
   POST /api/auth/signup → role: "recruiter"
   
2. CREATE JOB
   POST /api/jobs
   ├── Title, Description, Skills Required
   └── Location, Job Type
   
3. VIEW APPLICANTS
   GET /api/applications/jobs/{job_id}/applicants
   ├── Alice: Resume 89, Behaviour 84, Fit 87 ✅
   ├── Bob: Resume 72, Behaviour 68, Fit 70 ⏳
   └── Carol: Resume 65, Behaviour 60, Fit 62 ❌
   
4. MAKE DECISIONS
   PUT /api/applications/applicants/{id}/status
   ├── Status: "Shortlisted" (Locked)
   ├── Can view: Resume, Scores, Q&A Answers
   └── AI Insights: Recommendations
   
5. CHANGE DECISION (if needed)
   PUT /api/applications/applicants/{id}/unlock
   → Modify status again
   
6. MANAGE JOBS
   PUT /api/jobs/{id} → Update job details
   DELETE /api/jobs/{id} → Remove posting
   
7. VIEW RANKINGS
   GET /api/resume/ranking → Top candidatesAPPLICATION WORKFLOW

8. LOGOUT
   POST /api/auth/logout
```

---

## 🛡️ Role-Based Access Control Matrix

| Endpoint | Candidate | Recruiter | Public |
|----------|-----------|-----------|--------|
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `POST /auth/signup` | ✅ | ✅ | ✅ |
| `POST /auth/logout` | ✅ | ✅ | - |
| `GET /jobs` | ✅ | ✅ | - |
| `POST /jobs` | ❌ | ✅ | - |
| `GET /jobs/{id}` | ✅ | ✅ | - |
| `PUT /jobs/{id}` | ❌ | ✅* | - |
| `DELETE /jobs/{id}` | ❌ | ✅* | - |
| `POST /applications/jobs/{id}/apply` | ✅ | ❌ | - |
| `GET /applications/my` | ✅ | ❌ | - |
| `GET /applications/jobs/{id}/applicants` | ❌ | ✅* | - |
| `PUT /applications/applicants/{id}/status` | ❌ | ✅* | - |
| `PUT /applications/applicants/{id}/unlock` | ❌ | ✅* | - |
| `POST /behavioural/analyze` | ✅ | ✅ | - |
| `GET /behavioural/jobs` | ✅ | ✅ | - |
| `POST /resume/analyze` | ✅ | ✅ | - |
| `GET /resume/reports/{file}` | ✅ | ✅ | - |
| `POST /ai/generate-questions` | ✅ | ✅ | - |

**\* Owner Only** - Must be job creator/recruiter

---

## ⚙️ Configuration (.env)

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=talentai_behavioural

# Auth
JWT_SECRET_KEY=dev-secret-change-me
JWT_ALGORITHM=HS256

# Static Bearer Token (Development)
STATIC_BEARER_TOKEN=dev-static-token
STATIC_BEARER_SUB=dev-user

# API Keys
GEMINI_API_KEY=your_gemini_key_here

# Features
ENABLE_TEST_ENDPOINTS=false
ENABLE_DB=true
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- MongoDB running on localhost:27017
- Dependencies installed: `pip install -r requirements.txt`

### Run Server
```bash
cd behavioural_service
python -m app.main
```

Server runs on `http://localhost:8000`

### Interactive API Docs
- **Swagger:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔍 Testing with cURL

### Login as Recruiter
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"recruiter1","password":"pass123","role":"recruiter"}'
```

### Create Job
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Authorization: Bearer dev-static-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Python Developer",
    "description":"Senior Python role",
    "location":"Remote",
    "job_type":"Full-time",
    "experience_required":"5+ years",
    "required_skills":["Python","FastAPI"]
  }'
```

### Apply for Job
```bash
curl -X POST http://localhost:8000/api/applications/jobs/{job_id}/apply \
  -H "Authorization: Bearer dev-static-token" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_name":"John Doe",
    "job_id":"{job_id}"
  }'
```

---

## 📝 Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🏗️ Project Structure

```
behavioural_service/
├── app/
│   ├── api/
│   │   ├── auth_routes.py          # Authentication endpoints
│   │   ├── jobs_routes.py          # Job management
│   │   ├── applications_routes.py  # Application tracking
│   │   ├── behavioural_routes.py   # Behavioral analysis
│   │   ├── resume_routes.py        # Resume analysis
│   │   └── ai_routes.py            # AI/ML endpoints
│   ├── schemas/
│   │   ├── auth.py                 # Auth models
│   │   ├── jobs.py                 # Job models
│   │   ├── applications.py         # Application models
│   │   ├── behavioural.py          # Behavioral models
│   │   └── ...
│   ├── services/
│   │   ├── personality.py          # Big Five analysis
│   │   ├── sentiment.py            # Sentiment analysis
│   │   ├── softskills.py           # Soft skills derivation
│   │   ├── preprocessing.py        # Text preprocessing
│   │   └── scoring.py              # Scoring algorithms
│   ├── utils/
│   │   └── auth.py                 # Auth utilities
│   ├── config.py                   # Configuration
│   ├── database.py                 # MongoDB setup
│   └── main.py                     # FastAPI app
├── requirements.txt                # Dependencies
├── .env                            # Environment variables
└── API_DOCUMENTATION.md            # This file
```

---

## 🔐 Security Notes

1. **Bearer Token:** Always use HTTPS in production
2. **Password:** Hashed with bcrypt (salted)
3. **API Keys:** Store in env variables, never commit to git
4. **CORS:** Configured to allow all origins (restrict in production)
5. **Role-Based Access:** Every endpoint validates user role

---

**Version:** 1.0.0  
**Last Updated:** February 15, 2026  
**Maintainer:** TalentAI Team
