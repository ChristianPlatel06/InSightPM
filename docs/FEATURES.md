# Features Specification — InSightPM

This document provides a comprehensive technical and functional breakdown of all features **actually implemented and operational** in InSightPM.

---

## 1. User Authentication & Identity Management

### Functional Capabilities
- **Email/Password Registration & Login**: Validated user signup and sign-in with instant error feedback for invalid credentials or malformed emails.
- **Google OAuth 2.0 Sign-In**: One-click authentication using Google identity accounts.
- **Session Persistence & Synchronization**: 
  - Token synchronization on authentication state changes.
  - Server-side verification via Google JWKS public keys.
  - Stateless session cookies (`HttpOnly`, `SameSite=Lax`) to maintain authenticated sessions across browser restarts.
- **Automatic Profile Provisioning**: Every authenticated user automatically receives a synchronized document in the `users` database containing their UID, full name, email, avatar URL, and creation timestamp.
- **Protected Routing**: Next.js client and server boundaries redirect unauthenticated users away from `/projects` and `/create-project` to `/login`.

---

## 2. Project Lifecycle & Milestone Management

### Functional Capabilities
- **Create Project**: Input title, comprehensive description, initial status, starting progress percentage, and optional target due date.
- **Inspect Project Details**: Tabbed interface featuring Overview, Team Roster, AI Planner, and Activity Feed.
- **Update Project**: Real-time inline editing for project name, description, progress percentage, project status, and deadlines.
- **Delete Project**: Owner-only deletion with confirmation safeguards to prevent accidental data loss.
- **Owner Tracking**: Projects explicitly store `ownerId` and `owner` display name.
- **UTC-Safe Date Architecture**:
  - Internal storage follows strict ISO 8601 (`YYYY-MM-DD`).
  - Rendered in standardized `DD/MM/YYYY` format via `formatIndianDate()`.
  - Dynamic countdown calculation via `calculateDaysRemaining()` outputting statuses such as `Deadline is today!`, `4 days left`, or `Overdue by 3 days`.
- **Status Progression**: Full lifecycle tracking across `Planned`, `In Progress`, `At Risk`, `Delayed`, and `Completed`.

---

## 3. AI Project Analyst (Google Gemini)

### Functional Capabilities
- **Natural Language Update Ingestion**: Project leads submit freeform progress notes, commit summaries, or blocker descriptions.
- **Gemini 2.5 Flash Reasoning**: Analyzes the submitted update against the project scope, elapsed time, and scheduled deadline.
- **Objective Output Metrics**:
  - **Completion Probability**: Predicted likelihood of on-time completion expressed as a percentage.
  - **Top Delivery Risks**: Enumerated list of critical technical, temporal, and resource bottlenecks.
  - **Recommended Remedial Actions**: Concrete, prioritized steps to de-risk the project.
  - **Immediate Priorities**: Focus areas for the upcoming work sprint.
- **Persistent AI Analysis**: Results are saved directly into the project document so the entire team can review them.

---

## 4. Deterministic Mathematical Risk Engine

### Scoring Logic & Formulation
Unlike subjective status toggles, InSightPM calculates an objective risk index from **0 to 100** using a deterministic mathematical model:

$$\text{Risk Score} = \min(100, \max(0, \text{Remaining Work} + \text{Status Penalty} + \text{Temporal Penalty}))$$

Where:
1. **Remaining Work**:
   $$\text{Baseline} = 100 - \text{progress}$$
2. **Status Modifiers**:
   - `Status == "Delayed"`: **+30 points**
   - `Status == "At Risk"`: **+20 points**
   - `Status == "Completed"`: **Score = 0** (Immediately low risk)
3. **Temporal Modifiers (Days Remaining)**:
   - **Overdue** ($\text{daysLeft} < 0$): **+50 points**
   - **Due Today** ($\text{daysLeft} == 0$ and $\text{progress} < 90\%$): **+45 points**
   - **Critical Proximity** ($1 \le \text{daysLeft} \le 3$ and $\text{progress} < 80\%$): **+40 points**
   - **Approaching Deadline** ($4 \le \text{daysLeft} \le 7$ and $\text{progress} < 60\%$): **+25 points**
   - **Missing Deadline**: **+10 points**

### Automated Risk Tiers
- **Low Risk (0–24)**: Green indicator (`bg-emerald-500/10 text-emerald-400`). Healthy trajectory.
- **Medium Risk (25–49)**: Amber indicator (`bg-amber-500/10 text-amber-400`). Requires standard monitoring.
- **High Risk (50–74)**: Orange indicator (`bg-orange-500/10 text-orange-400`). Immediate intervention required.
- **Critical Risk (75–100)**: Red indicator (`bg-rose-500/10 text-rose-400`). Severe milestone compromise or overdue deliverable.

---

## 5. Smart Direct Team Collaboration

### Functional Capabilities
- **Real-Time Directory Search**: Search input queries the `users` database collection by email or display name prefix with instant loading and debounce handling.
- **1-Click Direct Addition**: Project owners click **"Add to Team"**; the selected user is immediately appended to `memberIds` and `members`. No temporary access tokens, no manual links, and no pending states.
- **Instant Project Visibility**: The project immediately appears on the new member's dashboard upon next load, powered by fast `memberIds CONTAINS uid` database indexing.
- **Duplicate Prevention**: Users already present in the project roster are automatically filtered out from search results.
- **Member Removal**: Project owners can remove collaborators with a single click, instantly revoking project access and logging the removal event.

---

## 6. AI Team Assignment Planner

### Functional Capabilities
- **Comprehensive Team Synthesis**: Submits project title, scope, description, and the full team roster (with current roles and skills) to Gemini 2.5 Flash.
- **Intelligent Workload Balancing**:
  - Calculates recommended ownership percentages across members.
  - Decomposes project requirements into concrete deliverables assigned to appropriate team members.
- **Skill Gap Detection**: Detects missing engineering functions (e.g., frontend-heavy project lacking QA or backend engineers) and outputs explicit warning badges.
- **Strategic Team Recommendations**: Produces high-level organizational advice to optimize team velocity.

---

## 7. Role Management & Individual Progress Tracking

### Functional Capabilities
- **8 Predefined Industry Roles**:
  - `Owner`
  - `Project Manager`
  - `Backend Engineer`
  - `Frontend Engineer`
  - `UI Designer`
  - `Tester`
  - `Documentation Lead`
  - `Viewer`
- **Dynamic In-Place Role Modification**: Project owners can reassign roles directly from the team card dropdown.
- **Individual Contribution Tracking**: Each team member maintains a dedicated `completion` percentage (0–100%) visualized by an animated, color-graded progress bar:
  - $\ge 80\%$: Emerald
  - $\ge 50\%$: Blue
  - $\ge 25\%$: Amber
  - $< 25\%$: Slate

---

## 8. Modern Executive Dashboard

### Functional Capabilities
- **High-Level KPI Counters**:
  - Total Projects
  - In Progress Count
  - At Risk / Delayed Counter
  - Average Delivery Completion
- **Quick Status Filters**: Single-click filtering across `All`, `In Progress`, `At Risk`, `Delayed`, and `Completed`.
- **Informative Project Cards**:
  - Title, description preview, and status pill badge.
  - Overall progress bar with numerical percentage.
  - Owner display name, due date in `DD/MM/YYYY` with relative days countdown, and team member counter.
  - Embedded Risk Engine badge with numerical score and category.

---

## 9. Visual Enhancements & Motion Design

### Functional Capabilities
- **Deep Slate Dark Theme**: Modern `#0a0a0a` background with semi-transparent surfaces and gradient highlights.
- **Glassmorphism Panels**: `backdrop-blur-md` cards with subtle borders (`border-white/10`).
- **Framer Motion Micro-Interactions**:
  - Smooth hover elevations on project cards.
  - Animated layout transitions when switching between Overview, Team, AI Planner, and Activity tabs.
  - Expanding search drawers and animated completion progress bars.