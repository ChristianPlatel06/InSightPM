# Technology Stack — InSightPM

InSightPM is constructed on a modern, high-performance technology stack selected to maximize developer velocity, operational reliability, type safety, and real-time responsiveness.

---

## 1. Stack Overview

| Category | Primary Technology | Version | Key Capability |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | `16.3.4` | Server Components, dynamic routing, edge optimization |
| **User Interface** | React | `19.2.8` | Declarative component model, state reactivity |
| **Programming Language** | TypeScript | `5.x` | End-to-end static typing, compile-time defect reduction |
| **Styling & Design** | Tailwind CSS | `4.x` | Modern utility classes, CSS variables, dark mode styling |
| **Animation Engine** | Framer Motion | `13.2.0` | GPU-accelerated micro-interactions and layout transitions |
| **Iconography** | Lucide React | `1.43.0` | Lightweight, scalable vector iconography |
| **Backend / API Engine** | Next.js API Routes | `16.3.4` | Serverless REST endpoints with zero cold-start friction |
| **Token Verification** | Jose | `6.2.12` | Cryptographic JWT verification via JWKS |
| **Database** | MongoDB / Cloud NoSQL | Latest | Document-based schema, flexible arrays, high-speed queries |
| **Authentication** | Firebase Auth | `12.18.0` | Secure Google OAuth 2.0 & Email/Password identity |
| **Artificial Intelligence** | Google Gemini API | `@google/genai 2.21.0` | Gemini 2.5 Flash model for analysis & workload planning |
| **Hosting & CI/CD** | Vercel | Cloud Platform | Automatic continuous integration, global edge network |

---

## 2. Detailed Tier Breakdown

### 2.1. Frontend Tier

#### Next.js 16 & React 19
- **App Router Architecture**: Utilizes route groups and nested layouts for optimal code splitting.
- **Turbopack Build Pipeline**: Delivers rapid local builds and sub-second Hot Module Replacement (HMR).
- **Client & Server Separation**: Computationally heavy rendering is isolated to client components (`"use client"`), while layouts and metadata execute securely on the server.

#### TypeScript
- **Defensive Type Contracts**: Every domain entity (`Project`, `UserProfile`, `ProjectMember`, `ActivityLog`, `AiTeamPlan`, `RiskAssessment`) is strongly typed.
- **Null Safety**: Strict compiler settings eliminate null-pointer exceptions across date calculations and optional database fields.

#### Tailwind CSS & Framer Motion
- **Glassmorphism Design System**: Custom backdrop-filter blurs, subtle gradient borders (`border-white/10`), and deep zinc surfaces (`#0a0a0a`).
- **Orchestrated Transitions**: Modals, tab switches, and progress meters are animated with layout-aware Framer Motion primitives.

---

### 2.2. Backend & API Layer

#### Next.js Serverless API Routes
- **Lightweight Micro-Endpoints**: Dedicated endpoints (`/api/projects`, `/api/users/search`, `/api/projects/[id]/analyze`, etc.) execute as lightweight serverless functions on demand.
- **Universal Error Handling**: Standardized JSON responses (`{ success: boolean, data?: T, error?: string }`) with consistent HTTP status codes.

#### Server-Side Security via `jose`
- **Zero-Secret Public Key Verification**: Tokens are verified against Google's public JSON Web Key Sets (JWKS) using the `jose` cryptographic library, eliminating the need to store sensitive administrative credentials in environment variables.

---

### 2.3. Database Layer

#### MongoDB / Cloud NoSQL Document Store
- **Document-Oriented Architecture**: Highly optimized for hierarchical project data where members, activities, and AI planning plans exist as structured document fields.
- **Array Containment Indexing**: Projects are indexed by `memberIds` array fields, enabling instantaneous lookups (`memberIds CONTAINS uid`) for multi-user project lists.
- **JSON Serialization Pattern**: High-density structures (team plans, activity timelines) are stored with transactional integrity.

---

### 2.4. Artificial Intelligence Tier

#### Google Gemini API (`gemini-2.5-flash`)
- **Model Choice**: Powered by `gemini-2.5-flash` via the official `@google/genai` SDK.
- **Low Latency & High Throughput**: Sub-second reasoning and synthesis ideal for interactive user experiences.
- **Deterministic Structured Output**: Prompt engineering enforces clean JSON schemas for risk probabilities, action items, and task distributions.

---

### 2.5. Authentication & Cloud Deployment

#### Firebase Authentication
- Provides battle-tested identity management supporting:
  - Email and Password registration with immediate verification.
  - One-click Google OAuth 2.0 sign-in.
  - Automatic token refresh and secure credential persistence.

#### Vercel Cloud Platform
- Global Edge Network guaranteeing low-latency response times worldwide.
- Seamless GitHub GitOps workflow with automated preview deployments and instant production rollouts.