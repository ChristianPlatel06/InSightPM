# Team Contributions & Project Responsibility Matrix — InSightPM

This document outlines the specialized contributions, technical roles, and domain ownership of all project team members for **InSightPM**, prepared for academic viva evaluation, hackathon judging, and technical portfolio review.

---

## 1. Project Team Roster & Domain Breakdown

```
InSightPM Development Team
│
├── Christian Platel   ── Lead Software Architect & Full-Stack Engineer
├── Harinath           ── Technical Documentation Lead & API Researcher
├── Mansoordin         ── Quality Assurance Lead & Viva Defense Strategist
├── Sathish            ── UI/UX Designer & Frontend Presentation Specialist
├── Prathiksha         ── Product Analyst & Academic Project Reporter
└── Priyadharshini     ── Systems Diagram Designer & Architecture Modeling Specialist
```

---

## 2. Individual Member Contributions

### 2.1. Christian Platel
**Role**: Lead Software Architect & Full-Stack Engineer  
**Core Responsibilities**:
- **System Architecture & Core Engineering**: Designed and developed the Next.js 16 full-stack architecture, App Router navigation structure, and serverless API endpoints.
- **AI Integration**: Implemented the Google Gemini 2.5 Flash integration using `@google/genai` for both the AI Project Analyst and the AI Team Assignment Planner.
- **Mathematical Risk Engine**: Formulated, implemented, and tuned the deterministic 0–100 risk scoring algorithm, including UTC-safe ISO date parsing and dynamic temporal decay calculations.
- **Authentication & Security**: Engineered the dual-mode authentication flow (Google OAuth 2.0 and Email/Password) and server-side JWT session verification using `jose` with public Google JWKS keys.
- **Direct Team Collaboration Engine**: Developed the direct 1-click team addition system, user search endpoint, and instant dashboard synchronization.
- **DevOps & Release**: Managed the GitHub repository, branch hygiene, CI/CD pipeline, and zero-downtime deployment on Vercel.

---

### 2.2. Harinath
**Role**: Technical Documentation Lead & API Researcher  
**Core Responsibilities**:
- **Technical Documentation Leadership**: Authored and structured technical specifications, including `README.md`, `SYSTEM_ARCHITECTURE.md`, and `API_DOCUMENTATION`.
- **API Research & Contract Design**: Researched REST API standards, payload design, and error response serialization across Next.js route handlers.
- **System Verification**: Verified API contract compliance and parameter validation for project lifecycle routes (`/api/projects`, `/api/users/search`).
- **Developer Experience**: Documented environment configuration, installation steps, and local development prerequisites.

---

### 2.3. Mansoordin
**Role**: Quality Assurance Lead & Viva Defense Strategist  
**Core Responsibilities**:
- **Quality Assurance & Testing**: Designed test scenarios for end-to-end user journeys (registration, project creation, member search, direct addition, and deletion).
- **Edge-Case Validation**: Conducted rigorous boundary testing on date edge cases (leap years, overdue milestones, same-day deadlines) to validate the risk engine.
- **Viva Defense Strategy**: Structured technical Q&A preparation, architectural defense rationales, and live demonstration scripts for academic evaluators and hackathon judges.
- **Regression Testing**: Validated production build stability (`npm run build`) and verified zero-defect execution under Turbopack.

---

### 2.4. Sathish
**Role**: UI/UX Designer & Frontend Presentation Specialist  
**Core Responsibilities**:
- **Design System Architecture**: Co-developed the design language, establishing dark-mode zinc color palettes (`#0a0a0a`), typography hierarchy, and glassmorphic surface treatments.
- **Component Styling & Responsiveness**: Styled atomic UI elements, responsive project cards, risk badges, and team roster displays using Tailwind CSS.
- **Motion & Micro-Interactions**: Assisted in implementing Framer Motion micro-interactions, tab-switching transitions, and progress bar animations.
- **Presentation Deck Engineering**: Designed visual presentation assets, slide decks, and UI walk-through guides for the project pitch.

---

### 2.5. Prathiksha
**Role**: Product Analyst & Academic Project Reporter  
**Core Responsibilities**:
- **Requirements Engineering**: Gathered, prioritized, and documented functional and non-functional requirements in `OBJECTIVES.md` and `PROBLEM_STATEMENT.md`.
- **Academic Project Report Preparation**: Compiled the comprehensive academic project report detailing methodologies, feasibility analysis, and problem-solution alignment.
- **Feature Gap Analysis**: Audited market alternatives (Jira, Trello, Asana) to identify competitive differentiators for InSightPM's hackathon positioning.
- **User Journey Mapping**: Documented end-to-end user workflows for team leads and collaborating members.

---

### 2.6. Priyadharshini
**Role**: Systems Diagram Designer & Architecture Modeling Specialist  
**Core Responsibilities**:
- **System Diagram Design**: Designed and modeled architectural diagrams, including the multi-tier system architecture, database entity relationships, and sequence flows using Mermaid.js.
- **Workflow & Process Modeling**: Created sequence diagrams illustrating authentication lifecycle verification, user session token exchanges, and direct team onboarding flows.
- **Visual Design Documentation**: Structured visual layouts and graphical assets across the technical documentation suite (`SYSTEM_ARCHITECTURE.md`, `PROJECT_OVERVIEW.md`).
- **Data Flow Documentation**: Mapped data transformation pipelines between client requests, Next.js serverless functions, database documents, and external Gemini AI endpoints.

---

## 3. Responsibility & Deliverable Traceability Matrix

| Project Module / Deliverable | Primary Contributor | Supporting Contributor(s) | Verification Status |
|---|---|---|:---:|
| **Next.js 16 Full-Stack Setup** | Christian Platel | Harinath | ✅ Complete |
| **Firebase Auth & JOSE JWT Verification** | Christian Platel | Mansoordin | ✅ Complete |
| **Deterministic Risk Engine (0–100)** | Christian Platel | Mansoordin, Prathiksha | ✅ Complete |
| **Gemini AI Analyst & Team Planner** | Christian Platel | Harinath | ✅ Complete |
| **Direct Team Collaboration Engine** | Christian Platel | Sathish | ✅ Complete |
| **UI/UX & Framer Motion Styling** | Sathish | Christian Platel | ✅ Complete |
| **Technical Architecture Documentation** | Harinath | Priyadharshini | ✅ Complete |
| **System Sequence Diagrams (Mermaid)** | Priyadharshini | Christian Platel | ✅ Complete |
| **Academic Project Report & Objectives** | Prathiksha | Harinath | ✅ Complete |
| **QA, Edge-Case Testing & Viva Deck** | Mansoordin | Christian Platel, Sathish | ✅ Complete |
| **Vercel Deployment & Build Validation** | Christian Platel | Mansoordin | ✅ Complete |