# Objectives — InSightPM

## 1. Vision Statement

The vision of **InSightPM** is to redefine collaborative project delivery by augmenting human leadership with deterministic risk modeling and generative artificial intelligence, providing a frictionless, transparent, and intelligent workspace for modern development teams.

---

## 2. Primary Objectives (Functional Goals)

### 1. Robust Multi-Method Authentication & Session Management
- Implement secure, enterprise-grade authentication supporting both **Email/Password credentials** and **Google OAuth 2.0 Sign-In**.
- Establish stateless session persistence using cryptographically verified JWT tokens (`jose`) over HttpOnly cookies.
- Maintain a synchronized, searchable user directory in the database for instant collaboration.

### 2. End-to-End Project Governance (CRUD)
- Deliver comprehensive project creation, modification, deletion, and retrieval flows.
- Enforce strict ownership boundaries while granting authorized access to all recognized project collaborators.
- Standardize all date attributes in ISO 8601 UTC format, displayed cleanly as `DD/MM/YYYY` with dynamic countdowns.

### 3. Automated AI Project Analyst
- Integrate the **Google Gemini API** (`@google/genai`) to ingest raw team updates, commit notes, and project descriptions.
- Autonomously generate objective completion probabilities, top delivery risks, recommended strategic actions, and immediate priorities.

### 4. Deterministic Mathematical Risk Engine
- Build an algorithmic risk quantification system that outputs an integer score from 0 to 100.
- Ensure risk scoring considers unfinished work, project status weights (`Delayed`, `At Risk`), and temporal decay (days remaining and overdue penalties).
- Automatically categorize risk into four color-coded tiers: `Low`, `Medium`, `High`, and `Critical`.

### 5. Frictionless Direct Team Collaboration
- Replace complex, asynchronous onboarding mechanics with a **direct 1-click team addition system**.
- Enable project owners to search registered users across display names and emails with real-time feedback.
- Provide instant project visibility on newly added members' dashboards with zero reload lag.

### 6. AI Team Assignment Planner
- Utilize Gemini 2.5 Flash to automatically analyze project scope alongside available team members.
- Suggest task distributions and responsibilities mapped to specific member roles.
- Surface proactive warnings regarding missing skill sets or technical imbalances.

### 7. Granular Role & Progress Management
- Allow project leaders to assign and update member roles across 8 predefined profiles.
- Track individual member completion percentages and visualize progress via animated progress indicators.

### 8. Executive Dashboard & Audit Logging
- Provide high-level dashboard metrics (Total Projects, Active Projects, Overdue Count, Average Progress).
- Maintain an immutable, reverse-chronological activity log recording all major project lifecycle events.

---

## 3. Secondary Objectives (Non-Functional Goals)

### 1. High Performance & Low Latency
- Leverage Next.js 16 App Router, Turbopack, and server-side optimizations to achieve sub-second page transitions and fast initial loads.
- Ensure all API endpoints complete within strict latency budgets.

### 2. Enterprise-Grade Security
- Enforce least-privilege access rules across API routes and database storage.
- Prevent privilege escalation by restricting team addition, removal, and role reassignment strictly to project owners.

### 3. Clean, Maintainable Architecture
- Maintain strict TypeScript type safety across all interfaces, data codecs, and UI components.
- Modularize UI components into reusable, atomic building blocks.

### 4. Superior Developer & User Experience
- Provide a visually stunning dark-mode interface featuring subtle glassmorphism, responsive grids, and fluid **Framer Motion** animations.

---

## 4. Success Criteria for Evaluation & Viva Review

| Evaluation Criterion | Target Benchmark | Achieved Status |
|---|---|:---:|
| **Authentication Reliability** | Zero-failure login across Google OAuth & Email credentials | ✅ Verified |
| **Direct Onboarding Speed** | Immediate member addition under 500ms with instant dashboard reflection | ✅ Verified |
| **Risk Accuracy** | Mathematical consistency across overdue dates and progress thresholds | ✅ Verified |
| **AI Generation Quality** | Structured, hallucination-free JSON response from Gemini API | ✅ Verified |
| **Build & Lint Stability** | 100% clean production compilation via `npm run build` | ✅ Verified |