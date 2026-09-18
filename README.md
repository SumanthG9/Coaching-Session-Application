# 🎯 Student-Coach Management

> A robust, full-stack web application connecting students with expert coaches for personalized mentoring, scheduling, and session lifecycle management.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Alembic](https://img.shields.io/badge/Alembic-1.20-green.svg?style=flat)](https://alembic.sqlalchemy.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [For Students](#for-students)
  - [For Coaches](#for-coaches)
  - [Security & Architecture Highlights](#security--architecture-highlights)
- [System Architecture](#-system-architecture)
- [Database Schema & Lifecycle](#-database-schema--lifecycle)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Session Lifecycle State Machine](#session-lifecycle-state-machine)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Setup & Installation](#-step-by-step-setup--installation)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Database Setup](#2-database-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Live Development Endpoints](#-live-development-endpoints)
- [REST API Reference](#-rest-api-reference)
- [Automated Testing](#-automated-testing)
- [Project Directory Structure](#-project-directory-structure)
- [Security & Validation Principles](#-security--validation-principles)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Overview

The **Student-Coach Management** platform bridges the gap between aspiring learners and experienced mentors. It provides an end-to-end platform where coaches can showcase their professional expertise, set availability and rates, and review incoming session requests. Students can explore coaches by skills, book targeted coaching sessions without scheduling conflicts, track real-time request statuses, and receive comprehensive feedback remarks once sessions are completed.

---

## 🚀 Key Features

### For Students
- **Account & Profile Management**: Register, authenticate with secure JWT tokens, and maintain an academic/professional profile (phone, education, and bio).
- **Coach Discovery & Skill Search**: Explore coaches with live search filtering by specific skills (e.g., Python, React, System Design).
- **Comprehensive Coach Profiles**: View coach biographies, years of experience, hourly/session fees, availability schedules, and tagged skill badges.
- **Conflict-Free Session Booking**: Request sessions by picking a date, start time, duration (minutes), topic, and personal message. The backend strictly prevents overlapping reservations.
- **Session Tracking & Cancellation**: Track session statuses (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`) and cancel pending requests anytime.
- **Post-Session Feedback**: Read personalized remarks and action items submitted by coaches after completing a session.

### For Coaches
- **Account & Profile Setup**: Register as a coach and configure bio, years of industry experience, session fee, and general availability windows.
- **Skill Inventory**: Dynamically add and remove skills tagged to your coach profile.
- **Request Management Dashboard**: View incoming student session requests with session details, topic, and student notes.
- **Accept / Reject Workflow**: Accept requests to lock them into your schedule or reject requests that cannot be accommodated.
- **Session Completion & Remarks**: Mark accepted sessions as completed while submitting comprehensive coach remarks and feedback for the student.

### Security & Architecture Highlights
- **Role-Based Access Control (RBAC)**: Strict role separation between `student` and `coach` enforced on both frontend protected routes and backend API endpoints.
- **Server-Side Authorization**: Ownership verification on all student and coach resources (e.g., a coach cannot complete another coach's session).
- **Argon2 Password Hashing**: Modern, memory-hard password hashing via `pwdlib[argon2]`. Plaintext passwords are never stored and password hashes are never exposed via the API.
- **Scheduling Overlap Prevention**: Database-level validation ensuring that coaches cannot be booked for overlapping time windows.

---

## 🏗️ System Architecture

The application follows a clean decoupled client-server architecture:

```mermaid
flowchart TD
    subgraph Client["Client Tier (React + Vite)"]
        UI["User Interface (React 19 / JSX)"]
        Router["React Router v7 (Protected Routes)"]
        ServiceLayer["API Client (Fetch API / Auth Header)"]
        UI --> Router
        Router --> ServiceLayer
    end

    subgraph Server["API Tier (FastAPI)"]
        FastAPI["FastAPI REST Application (:8000)"]
        CORS["CORS Middleware"]
        AuthMiddleware["JWT Authentication & RBAC Dependencies"]
        Pydantic["Pydantic v2 Request/Response Schemas"]
        Routers["Domain Routers\n(/auth, /students, /coaches, /sessions)"]

        FastAPI --> CORS
        CORS --> AuthMiddleware
        AuthMiddleware --> Pydantic
        Pydantic --> Routers
    end

    subgraph Persistence["Persistence Tier (PostgreSQL + SQLAlchemy)"]
        SQLAlchemy["SQLAlchemy 2.0 ORM"]
        Alembic["Alembic Migrations"]
        PostgreSQL[("PostgreSQL Database\n(coaching_db)")]

        Routers --> SQLAlchemy
        Alembic -.-> PostgreSQL
        SQLAlchemy --> PostgreSQL
    end

    ServiceLayer -->|HTTP / REST / JSON| FastAPI
```

- **Frontend Responsibility**: Presentation, client-side routing, auth state persistence (localStorage), responsive forms, and user-friendly error handling.
- **Backend Responsibility**: Authoritative validation, business rules, scheduling conflict checks, role authorization, and database transactions.
- **Direct Database Isolation**: The browser client communicates strictly through REST endpoints and never touches PostgreSQL directly.

---

## 📊 Database Schema & Lifecycle

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| student_profiles : "has one (CASCADE)"
    users ||--o| coach_profiles : "has one (CASCADE)"
    coach_profiles ||--o{ coach_skills : "has many (CASCADE)"
    student_profiles ||--o{ coaching_sessions : "requests"
    coach_profiles ||--o{ coaching_sessions : "conducts"

    users {
        int id PK
        string name "VARCHAR(100)"
        string email "VARCHAR(255) UNIQUE"
        string password_hash "VARCHAR(255)"
        enum role "'student' | 'coach'"
        datetime created_at
    }

    student_profiles {
        int id PK
        int user_id FK "UNIQUE"
        string phone "VARCHAR(30)"
        string education "VARCHAR(255)"
        text bio
    }

    coach_profiles {
        int id PK
        int user_id FK "UNIQUE"
        text bio
        int years_experience "CHECK (>= 0)"
        numeric session_fee "NUMERIC(10,2) CHECK (>= 0)"
        text availability
    }

    coach_skills {
        int id PK
        int coach_id FK
        string skill "VARCHAR(100)"
    }

    coaching_sessions {
        int id PK
        int student_id FK
        int coach_id FK
        date session_date
        time start_time
        int duration_minutes "CHECK (> 0)"
        string topic "VARCHAR(255)"
        text student_message
        text coach_remarks
        enum status "'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'"
        datetime created_at
        datetime updated_at
    }
```

### Session Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : Student Books Session

    PENDING --> ACCEPTED : Coach Accepts
    PENDING --> REJECTED : Coach Rejects
    PENDING --> CANCELLED : Student Cancels

    ACCEPTED --> COMPLETED : Coach Completes (With Remarks)

    REJECTED --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]
```

- **Conflict Detection Rule**: When a new session is booked, the backend checks for existing `PENDING` or `ACCEPTED` sessions for the given coach on that date where:
  $$\text{Requested Start} < \text{Existing End} \quad \text{AND} \quad \text{Requested End} > \text{Existing Start}$$
  Any intersection immediately raises an `HTTP 409 Conflict`.

---

## 💻 Technology Stack

| Layer | Technology | Version / Package | Description |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | FastAPI | `0.141.1` | High-performance ASGI Python web framework |
| **ASGI Server** | Uvicorn | `0.53.0` | Production ASGI web server implementation |
| **ORM** | SQLAlchemy | `2.0.53` | Modern Python SQL toolkit and Object Relational Mapper |
| **Database Driver** | Psycopg 3 | `3.3.5` | Next-generation PostgreSQL adapter for Python |
| **Migrations** | Alembic | `1.20.0` | Lightweight database migration tool for SQLAlchemy |
| **Validation** | Pydantic | `2.13.5` | Data validation and schema enforcement |
| **Password Security** | pwdlib (Argon2) | `0.3.1` | Secure password hashing using the Argon2 algorithm |
| **Authentication** | PyJWT | `2.14.0` | RFC 7519 JSON Web Token implementation |
| **Frontend Framework** | React | `19.2.8` | Component-based UI library |
| **Build Tool** | Vite | `8.3.0` | Ultra-fast frontend bundler and dev server |
| **Routing** | React Router | `7.18.4` | Declarative client-side routing and protected routes |
| **Styling** | Tailwind CSS / CSS | `4.3.3` | Modern responsive utility and custom styles |
| **Icons** | Lucide React | `1.46.0` | Beautiful and consistent icons |
| **Database** | PostgreSQL | `14+` | Relational database engine |

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Python**: `v3.10` or higher
- **Node.js**: `v18.0` or higher (with `npm`)
- **PostgreSQL**: `v14` or higher (running locally or accessible via network)
- **Git**

---

## 🛠️ Step-by-Step Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/SumanthG9/Coaching-Session-Application.git
cd Coaching-Session-Application
```

---

### 2. Database Setup

Ensure your PostgreSQL service is running. Connect to PostgreSQL using `psql` or pgAdmin and create the database:

```sql
CREATE DATABASE coaching_db;
```

---

### 3. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On Linux / macOS:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file inside the `backend` directory (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL credentials and a secure JWT secret:
   ```env
   DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/coaching_db
   JWT_SECRET_KEY=your-super-secret-jwt-signing-key-here
   ```

5. **Run Database Migrations**:
   Apply all Alembic migrations to create the required tables and constraints:
   ```bash
   alembic upgrade head
   ```

6. **Start the Backend API Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will start at: `http://localhost:8000`

---

### 4. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment (Optional)**:
   By default, the frontend points to `http://localhost:8000`. If you wish to customize this, create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The web application will open at: `http://localhost:5173`

---

## 🌐 Live Development Endpoints

Once both backend and frontend servers are running, access the following:

| Service | URL | Purpose |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Interactive client interface for students and coaches |
| **FastAPI Root** | [http://localhost:8000](http://localhost:8000) | Root API health status check |
| **Swagger UI (Interactive Docs)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive OpenAPI testing console |
| **ReDoc UI (API Specification)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Alternative clean API documentation view |
| **API Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Verifies FastAPI application status |
| **Database Health Check** | [http://localhost:8000/health/database](http://localhost:8000/health/database) | Verifies live PostgreSQL connectivity (`SELECT 1`) |

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <access_token>`

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register/student` | Public | Register student account and auto-create student profile |
| `POST` | `/auth/register/coach` | Public | Register coach account and auto-create coach profile |
| `POST` | `/auth/login` | Public | Authenticate email/password; returns JWT access token |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile and role details |

### 🎓 Students (`/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/students/me` | Student Only | Get current student's profile (phone, education, bio) |
| `PUT` | `/students/me` | Student Only | Update student profile fields |

### 👨‍🏫 Coaches & Skills (`/coaches`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/coaches/me` | Coach Only | Get logged-in coach's profile |
| `PUT` | `/coaches/me` | Coach Only | Update coach profile (bio, experience, fee, availability) |
| `POST` | `/coaches/me/skills` | Coach Only | Add a new skill (e.g., `{"skill_name": "Python"}`) |
| `GET` | `/coaches/me/skills` | Coach Only | List all skills added by this coach |
| `DELETE` | `/coaches/me/skills/{skill_id}` | Coach Only | Delete a skill from the coach profile |
| `GET` | `/coaches` | Student Only | Search and browse coaches (Optional query `?skill=python`) |
| `GET` | `/coaches/{coach_id}` | Student Only | Get detailed profile and skills for a specific coach |

### 📅 Coaching Sessions (`/sessions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/sessions` | Student Only | Book coaching session (Checks for scheduling overlaps) |
| `GET` | `/sessions/my` | Student Only | View student's booked sessions and statuses |
| `GET` | `/sessions/requests` | Coach Only | View all session requests directed to the coach |
| `PUT` | `/sessions/{session_id}/accept` | Coach Only | Accept a `PENDING` session |
| `PUT` | `/sessions/{session_id}/reject` | Coach Only | Reject a `PENDING` session |
| `PUT` | `/sessions/{session_id}/cancel` | Student Only | Cancel a `PENDING` session |
| `PUT` | `/sessions/{session_id}/complete` | Coach Only | Complete an `ACCEPTED` session and add coach remarks |

---

## 📁 Project Directory Structure

```text
coaching/
├── backend/
│   ├── alembic/                      # Database migrations
│   │   ├── versions/                 # Versioned migration scripts
│   │   ├── env.py                    # Alembic environment configuration
│   │   └── script.py.mako
│   ├── app/
│   │   ├── auth/                     # Authentication & security
│   │   │   ├── dependencies.py       # Current user & role check dependencies
│   │   │   ├── jwt.py                # Token creation and verification
│   │   │   ├── router.py             # Auth endpoints (/auth/login, /auth/register)
│   │   │   └── security.py           # Argon2 hashing utilities
│   │   ├── coaches/                  # Coach profile management
│   │   │   ├── skills/               # Coach skills router
│   │   │   ├── router.py             # Coach profile endpoints
│   │   │   └── search_router.py      # Coach discovery & skill search
│   │   ├── database/                 # SQLAlchemy engine and session
│   │   │   └── database.py
│   │   ├── models/                   # SQLAlchemy declarative models
│   │   │   ├── coach_profile.py      # CoachProfile model
│   │   │   ├── coach_skill.py        # CoachSkill model
│   │   │   ├── coaching_session.py   # CoachingSession model & SessionStatus enum
│   │   │   ├── student_profile.py    # StudentProfile model
│   │   │   └── user.py               # User model & UserRole enum
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── coach.py
│   │   │   ├── coach_skill.py
│   │   │   ├── coach_search.py
│   │   │   ├── session.py
│   │   │   ├── student.py
│   │   │   └── user.py
│   │   ├── sessions/                 # Session booking & lifecycle
│   │   │   └── router.py             # Session CRUD & state transition endpoints
│   │   ├── students/                 # Student profile router
│   │   │   └── router.py
│   │   └── main.py                   # FastAPI app entry point & CORS
│   ├── alembic.ini                   # Alembic configuration
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Template environment variables
│   └── .env                          # Local environment variables (not committed)
│
├── frontend/
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx            # Dynamic navigation bar based on auth & role
│   │   │   └── ProtectedRoute.jsx    # Role-based route guard
│   │   ├── context/                  # React Context providers (AuthContext)
│   │   ├── pages/                    # Application pages
│   │   │   ├── Landing.jsx           # Landing / hero page
│   │   │   ├── Login.jsx             # Authentication page
│   │   │   ├── Register.jsx          # Unified signup page with role switcher
│   │   │   ├── NotFound.jsx          # Dedicated 404 page
│   │   │   ├── StudentDashboard.jsx  # Student overview & quick actions
│   │   │   ├── CoachListing.jsx      # Coach search & skill filter
│   │   │   ├── CoachProfile.jsx      # Coach profile editor & view
│   │   │   ├── StudentSessions.jsx   # Student session booking history
│   │   │   ├── StudentProfile.jsx    # Student profile editor
│   │   │   ├── CoachDashboard.jsx    # Coach analytics & active requests
│   │   │   ├── CoachRequests.jsx     # Coach request accept/reject/complete modal
│   │   │   └── SessionDetails.jsx    # Live meeting launcher & session details
│   │   ├── services/                 # API service layer
│   │   │   ├── api.js                # Centralized fetch wrapper & error handler
│   │   │   ├── authService.js        # Auth API calls
│   │   │   ├── coachService.js       # Coach profile & search API calls
│   │   │   ├── sessionService.js     # Session lifecycle API calls
│   │   │   └── studentService.js     # Student profile API calls
│   │   ├── App.jsx                   # React Router routing tree
│   │   ├── main.jsx                  # React DOM root mounting
│   │   └── index.css                 # Global CSS & Tailwind styling
│   ├── package.json                  # Node.js dependencies & scripts
│   └── vite.config.js                # Vite build configuration
│
├── Coaching_Project_Complete_Requirements.txt # Complete specifications
├── .gitignore                        # Git ignore file
└── README.md                         # Project documentation
```

---

## 🔒 Security & Validation Principles

1. **Argon2 Password Hashing**: Passwords are saved solely as Argon2 hashes. No plain text is ever retained or written to logs.
2. **Server-Side Role Guarding**: FastAPI dependencies `require_student` and `require_coach` extract the verified token payload and reject unauthorized access with `HTTP 403 Forbidden`.
3. **Resource Ownership Checks**:
   - A coach can only modify their own profile, skills, and sessions.
   - A student can only cancel sessions that belong to their student profile.
4. **State Transition Enforcements**:
   - Only `PENDING` sessions can be accepted, rejected, or cancelled.
   - Only `ACCEPTED` sessions can be transitioned to `COMPLETED`.
   - Invalid state transitions return `HTTP 409 Conflict`.
5. **Double Booking Prevention**:
   - Session requests check the coach's existing sessions on the target date. Overlapping time intervals are rejected at creation time with `HTTP 409 Conflict`.
6. **Input Sanitization**:
   - Check constraints enforce that `years_experience >= 0`, `session_fee >= 0`, and `duration_minutes > 0`.
   - Pydantic models validate email formats, string lengths, dates, and times before reaching the database.

---

## ❓ Troubleshooting & FAQs

### Database Connection Fails (`connection to server at "localhost", port 5432 failed`)
- Ensure PostgreSQL is running:
  - Windows: Check Services (`services.msc`) $\rightarrow$ PostgreSQL.
  - Linux/macOS: `sudo systemctl status postgresql` or `brew services list`.
- Check credentials in `backend/.env`. Ensure the database `coaching_db` exists (`CREATE DATABASE coaching_db;`).

### Alembic Migration Issues
- If Alembic says `RuntimeError: DATABASE_URL is not set`, verify that `backend/.env` exists and contains `DATABASE_URL=postgresql+psycopg://...`.
- Re-run:
  ```bash
  alembic upgrade head
  ```

### Windows PowerShell Script Execution Policy
- If `.\venv\Scripts\Activate.ps1` gives an execution policy error, run PowerShell as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### CORS Errors in Browser Console
- The backend pre-configures CORS for `http://localhost:5173` and `http://127.0.0.1:5173`. Ensure your frontend is running on standard port `5173`.
