# Multi-Agent AI Travel Planner

> An autonomous multi-agent system that coordinates specialized LLM agents to research transportation, evaluate accommodations, curate uncrowded local experiences, and deterministically optimize travel budgets into personalized day-by-day itineraries.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED.svg)](https://www.docker.com/)
[![Python Tests](https://img.shields.io/badge/Tests-15_Passed-brightgreen.svg)]()

---

## 1. Project Overview

The **Multi-Agent AI Travel Planner** replaces traditional travel planning—which requires juggling dozens of browser tabs across flights, hotels, blogs, and manual spreadsheets—with an autonomous system of coordinated AI agents. 

Users provide their destination, origin, dates, travelers, travel style, food preferences, interests, and budget. The Orchestrator agent delegates tasks across specialized agents, enforces strict mathematical budget constraints via deterministic arithmetic code (preventing LLM math hallucinations), and generates a coherent, time-synchronized daily itinerary.

---

## 2. Problem Statement

1. **Information Overload:** Travelers spend an average of 10–20 hours across disjointed booking sites, blogs, and forums.
2. **LLM Arithmetic Hallucinations:** Generic AI chatbots (ChatGPT, Gemini prompt dumps) frequently hallucinate budgets, providing plans that exceed funds by 20–50% or invent prices.
3. **Monolithic Prompt Failure:** Prompts attempting to do flights, stays, timing, transit, and activities all at once lose attention and create physically impossible schedules (e.g., overlapping activities or ignoring airport transfer times).

---

## 3. Solution

A decoupled **Multi-Agent Architecture** orchestrated by a master coordinator:
* **Decoupled Roles:** Distinct agents for Flights, Accommodations, Activities, and Itineraries.
* **Deterministic Arithmetic Validator:** 100% deterministic code calculating subtotal, food allowances, local transit, and contingency reserve.
* **Iterative Optimization Fallback Loop:** When budget limits are breached, the Orchestrator requests cheaper alternatives from the specific high-cost driver (up to 3 iterations) until the budget is satisfied.
* **Granular Section Regeneration:** Users can refresh a single hotel, activity category, or single day without discarding the rest of the plan.

---

## 4. Architecture Diagram

```
                              [ User Request ]
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │   Orchestrator Agent   │
                        └────────────┬───────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│Flight/Transit Agent│    │Accommodation Agent │    │   Activity Agent   │
└──────────┬─────────┘    └──────────┬─────────┘    └──────────┬─────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
                                     ▼
                     ┌──────────────────────────────┐
                     │ Deterministic Budget Engine  │
                     │  (Arithmetic & 5% Contingency│
                     └───────────────┬──────────────┘
                                     │
                       [ Budget Exceeded? ]
                            ├── YES ──► (Loop back: Request cheaper options, max 3x)
                            └── NO
                                     │
                                     ▼
                     ┌──────────────────────────────┐
                     │    Itinerary Generator       │
                     │ (Morning/Afternoon/Evening)  │
                     └───────────────┬──────────────┘
                                     │
                                     ▼
                       [ Final Personalized Plan ]
```

---

## 5. Agent Architecture & Responsibilities

| Agent / Service | Responsibility | Structured Schema Output |
| :--- | :--- | :--- |
| **Orchestrator Agent** | Coordinates tasks, manages state, handles optimization loop. | `TripPlan` / `TripResponseSchema` |
| **Flight / Transport Agent** | Evaluates multi-modal routes, layovers, and price scoring. | `TransportOption` (Flight/Train/Bus) |
| **Accommodation Agent** | Filters verified stays by distance, user rating, and style. | `AccommodationOption` (Hotel/Resort) |
| **Activity Agent** | Curates attractions respecting crowd density preferences. | `ActivityOption` (Diverse categories) |
| **Budget Validator** | Pure deterministic arithmetic calculations (No LLM math). | `BudgetBreakdown` (Utilization & Buffer) |
| **Itinerary Agent** | Assembles chronological daily slots with meal pairings. | `ItineraryDay` (Morning/Noon/Night) |

---

## 6. Tech Stack

- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **AI / LLM:** Google GenAI SDK (`@google/genai` with `gemini-3.8-flash`), structured Pydantic schemas
- **Database:** PostgreSQL (with SQLite zero-dependency fallback for local rapid test)
- **DevOps / Containers:** Docker, Docker Compose, Multi-stage builds
- **Testing:** Pytest / Unittest (15 comprehensive unit tests for scoring, dates, budget math)

---

## 7. Project Structure

```
multi-agent-travel-planner/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── flight_agent.py
│   │   │   ├── accommodation_agent.py
│   │   │   ├── activity_agent.py
│   │   │   ├── itinerary_agent.py
│   │   │   └── orchestrator.py
│   │   ├── api/
│   │   │   └── trips.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── database/
│   │   │   └── session.py
│   │   ├── models/
│   │   │   └── trip.py
│   │   ├── schemas/
│   │   │   └── trip.py
│   │   ├── services/
│   │   │   ├── travel_provider.py
│   │   │   ├── accommodation_provider.py
│   │   │   └── activity_provider.py
│   │   ├── validators/
│   │   │   └── budget_validator.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_travel_planner.py
│   │   └── test_standalone.py
│   ├── requirements.txt
│   └── Dockerfile
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── TripForm.tsx
│   │   ├── TripSummary.tsx
│   │   ├── TransportSection.tsx
│   │   ├── AccommodationSection.tsx
│   │   ├── ActivitiesSection.tsx
│   │   ├── BudgetSection.tsx
│   │   ├── ItinerarySection.tsx
│   │   ├── AgentTraceModal.tsx
│   │   ├── PreferencesModal.tsx
│   │   └── ArchitectureModal.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server/
│   ├── agents/
│   ├── services/
│   ├── validators/
│   └── db.ts
├── shared/
│   └── types.ts
├── server.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── README.md
└── INTERVIEW_PREPARATION.md
```

---

## 8. Installation & Running Locally (Windows / Mac / Linux)

### Option A: Running Full-Stack Dev Server (Instant interactive web app)

```bash
# 1. Clone repository
git clone https://github.com/your-username/multi-agent-travel-planner.git
cd multi-agent-travel-planner

# 2. Install dependencies
npm install

# 3. Start development server (Node.js + Express + Vite)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Running Standalone Python FastAPI Backend (Windows PowerShell)

```powershell
# 1. Navigate to project root
cd multi-agent-travel-planner

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install Python dependencies
pip install -r backend/requirements.txt

# 4. Run FastAPI backend
uvicorn backend.app.main:app --reload --port 8000
```
Open FastAPI Swagger Docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Option C: Running with Docker Compose

```bash
# Build and launch PostgreSQL, FastAPI Backend, and Frontend
docker-compose up --build
```
* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:8000/docs`
* PostgreSQL: `localhost:5432`

---

## 9. Running Automated Tests

Run the test suite:

```bash
# Standalone zero-dependency test suite (15 tests covering scoring, budget, dates, and iterative optimization)
python backend/tests/test_standalone.py

# With pytest (in virtual environment)
pytest backend/tests/
```

Test output:
```text
...............
----------------------------------------------------------------------
Ran 15 tests in 0.004s

OK
```

---

## 10. API Documentation

### Key Endpoints:

- `POST /api/trips`: Create new trip planning request
- `GET /api/trips/{trip_id}`: Retrieve trip state and results
- `POST /api/trips/{trip_id}/generate`: Trigger multi-agent orchestrator
- `POST /api/trips/{trip_id}/regenerate`: Regenerate individual component (`transport`, `accommodation`, `activities`, `day`)
- `POST /api/trips/{trip_id}/optimize-budget`: 1-click deterministic optimization pass
- `GET /api/trips/{trip_id}/itinerary`: Day-by-day schedule
- `GET /api/trips/{trip_id}/budget`: Deterministic budget breakdown
- `GET /api/user/preferences`: Retrieve user travel preferences memory
- `POST /api/user/preferences`: Save updated travel preferences memory

---

## 11. Example Request & Response

### Request (`POST /api/trips/{id}/generate`):

```json
{
  "destination": "Goa",
  "origin": "Mumbai",
  "startDate": "2026-12-15",
  "endDate": "2026-12-18",
  "travelers": 2,
  "budget": 25000,
  "currency": "INR",
  "travelStyle": "balanced",
  "accommodationType": "mid-range",
  "foodPreferences": ["Local Specialties", "Seafood"],
  "interests": ["Beaches", "Adventure", "Local Food"],
  "transportationPreference": ["flight", "train"],
  "crowdPreference": "avoid_crowded"
}
```

### Deterministic Budget Output:

```json
{
  "within_budget": true,
  "total_cost": 24500,
  "budget": 25000,
  "remaining": 500,
  "utilization_percentage": 98.0,
  "transportation": 7600,
  "accommodation": 7500,
  "food": 4000,
  "activities": 3000,
  "local_transport": 1400,
  "miscellaneous": 1000,
  "contingency": 1000
}
```

---

## 12. Security & Best Practices

- **Zero Hardcoded Keys:** Environment variables managed via `.env`.
- **No Client-Side Secrets:** Gemini API calls and provider queries run exclusively server-side.
- **SQL Injection Prevention:** Parameterized ORM queries via SQLAlchemy.
- **Deterministic Math Guardrails:** Never delegate financial calculations to an LLM.

---

## 13. License & Author

Developed by **Chaitali Patil**
AIML Engineer & Full-Stack Developer
Portfolio Project — Multi-Agent AI Architecture
