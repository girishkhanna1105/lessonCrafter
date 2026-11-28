<div align="center">

# LessonCrafter

**An AI-native learning studio that turns any topic into a live, interactive React lesson on demand.**

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-2563eb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20SSR-10b981?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Overview

**LessonCrafter** transforms any concept, theorem, or topic into a self-contained, executable educational micro-app. Instead of returning static walls of text, LessonCrafter runs a **multi-agent AI pipeline** streamed over Server-Sent Events (SSE) and compiles three synchronized pillars into a live browser sandbox:

1. **Conceptual Theory & Worked Examples** — Structured explanations, intuitive anchors, and misconception callouts tailored to learner level (`Introductory`, `Foundational`, `College`, `Advanced & R&D`) and delivery mode (`Student` vs. `Teacher`).
2. **Interactive Simulator** — Real-time, state-driven visualizers and SVG simulations executed directly in the browser via `react-live` and `@babel/standalone`.
3. **Formative Assessment & Socratic Tutor** — Interactive MCQs with instant analysis, paired with a dockable **Socratic AI Tutor** that guides learners with probing questions rather than spoiling answers.

---

## Architecture & Pipeline

```mermaid
flowchart LR
    User["/studio (Prompt + Diagnostic Intake)"] -->|SSE Stream| API["POST /api/generate-v2"]
    API --> A0["Agent 0: Pedagogy Specialist"]
    A0 --> A1["Agent 1: Content Architect"]
    A1 --> A2["Agent 2: Interactive Builder"]
    A1 --> A3["Agent 3: Quiz Designer"]
    A2 & A3 --> A4["Agent 4: Deterministic Compiler (Sucrase)"]
    A4 --> DB[("Supabase / Local Fallback")]
    A4 --> Runner["/lessons/[id] (react-live Sandbox)"]
    Runner -->|Runtime Error (max 2x)| Repair["POST /api/repair"]
    Runner --> Tutor["POST /api/tutor (Socratic Sidecar)"]
```

### Key Engineering Highlights

- **Multi-Agent Orchestration (`lib/agents/orchestrator.ts`)**:
  - **Intake Agent (`/api/intake`)**: Generates diagnostic follow-up questions before synthesis to calibrate depth and focus areas.
  - **Pedagogy & Content Agents**: Build intuitive anchors, target misconceptions, structured sections, and step-by-step worked examples.
  - **Parallel Execution**: Runs the Interactive Simulation Builder and Quiz Designer concurrently via `Promise.allSettled()` to cut generation latency.
  - **Deterministic Compiler (`lib/agents/compilerAgent.ts`)**: Validates generated JSX snippets with `sucrase` and deterministically assembles the final `LessonComponent`—eliminating LLM truncation and syntax failures at compile time.
- **Poly-Model Resilient Failover (`lib/llmClient.ts`)**:
  - Prioritizes ultra-fast **Groq** inference (`qwen/qwen3.8-27b`, `openai/gpt-oss-20b`, `openai/gpt-oss-120b`) and automatically fails over to **Google Gemini** (`gemini-2.5-flash-lite`, `gemini-2.5-flash`) on rate limits or provider saturation.
  - Socratic Tutor (`/api/tutor`) uses Groq (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) with Gemini (`gemini-2.5-flash`) fallback.
- **Self-Healing Browser Sandbox (`components/LessonRunner.tsx`)**:
  - Executes generated components in `react-live` (`noInline` mode) with a `Proxy`-guarded `safeScope` (injecting React hooks, dual-mode theme tokens, and `lucide-react` icons).
  - Blocks `require()` calls, catches compile/runtime errors via `LessonErrorBoundary`, and triggers autonomous repair (`/api/repair`) up to a hard ceiling of 2 attempts, with a 3-agent fast-path rebuild (`/api/regenerate`).
- **Resilient Local Fallback**:
  - If Supabase is paused or unreachable, `/api/generate-v2` and `/lessons/[id]` seamlessly fall back to `local-*` session IDs and `localStorage` caching so lessons still generate, render, repair, and export.
- **Dual-Mode & Export Suite**:
  - **Cobalt Architect** dark/light theme (`next-themes`) with a technical blueprint grid UI.
  - Switch between **Interactive Laboratory**, **Structured Document View**, and **Raw TSX Source**; export lessons as escaped standalone `.html` files or print/PDF.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js (App Router, Turbopack), React 19, TypeScript 5.9 |
| **Styling & UI** | Tailwind CSS, Radix UI / shadcn-style primitives, Lucide Icons, `next-themes` |
| **AI & Observability** | Groq SDK, Google Generative AI (`@google/generative-ai`), Langfuse (optional tracing) |
| **In-Browser Execution** | `react-live`, `@babel/standalone`, `sucrase` (server-side JSX validation) |
| **Database & Auth** | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), `bcryptjs`, `jsonwebtoken` |

---

## Project Structure

```text
lessoncrafter/
├── app/
│   ├── api/
│   │   ├── admin/metrics/      # Operations telemetry & stuck-task reset
│   │   ├── auth/               # Login, register, and JWT session verification
│   │   ├── generate-v2/        # Primary SSE multi-agent streaming pipeline
│   │   ├── intake/             # Diagnostic follow-up question generator
│   │   ├── profile/            # Student/Teacher persona persistence
│   │   ├── regenerate/         # 3-agent fast-path lesson rebuild
│   │   ├── repair/             # Autonomous AST/runtime code healer
│   │   └── tutor/              # Socratic AI tutor sidecar endpoint
│   ├── admin/                  # Mission Control telemetry dashboard
│   ├── auth/                   # Sign-in & registration
│   ├── lessons/                # Explore Labs & [id] interactive viewer
│   ├── onboarding/             # Role-based persona questionnaire
│   ├── profile/                # Account & pedagogy preferences
│   └── studio/                 # Primary creation workbench (/page2 redirects here)
├── components/                 # Sandbox runner, Socratic drawer, landing demos, UI primitives
├── lib/
│   ├── agents/                 # Pedagogy, Content, Interactive, Quiz, Compiler, Orchestrator
│   ├── supabase/               # Browser & SSR Supabase clients
│   ├── jwt.ts                  # JWT sign/verify helpers
│   └── llmClient.ts            # Multi-provider Groq -> Gemini failover client
└── middleware.ts               # Bearer token verification for /api/auth/me
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/lessoncrafter.git
cd lessoncrafter
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` (or `.env`) and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key

# AI Providers
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

# Auth
JWT_SECRET=your-random-jwt-secret-string

# Observability (Optional)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Verify Lint, Types & Build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Security & Reliability Notes

- **Password & Token Security**: Passwords are hashed with `bcryptjs` (cost 10) and sessions use signed `jsonwebtoken` tokens (`7d` expiry). Self-registration restricts roles to `student` or `teacher`.
- **Sandbox Guardrails**: `LessonRunner` rejects `require()` statements, isolates execution in `react-live`, and caps autonomous LLM repair loops at 2 attempts.
- **Export & HTTP Hardening**: HTML exports escape all dynamic lesson content to prevent script injection, and `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.
- **Environment Hygiene**: `.env` and `.env*.local` are gitignored; keep API keys out of version control.

---

<p align="center">
  Built with curiosity and first-principles engineering.
</p>
