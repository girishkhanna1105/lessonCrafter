🚀 Overview
live-link:https://lesson-crafter.vercel.app/

lessonCrafter is an AI-powered platform designed to generate, refine, and manage high-quality educational content.

It streamlines:

creating structured lessons

generating quizzes

repairing mistakes

regenerating improved versions

viewing & managing lessons

Built using a modern, ultra-fast tech stack powered by Next.js 16, Turbopack, and Bun.

🧠 Key Features
Feature	Description
AI Lesson Generation	Create complete, structured lessons from any prompt
AI Regeneration	Improve or re-create lessons with different depth/clarity
AI Repair System	Fix errors, missing parts, or inconsistencies
Dynamic Lesson Pages	Auto-generated routes like /lessons/[id]
Zero-latency Dev Experience	Next.js App Router + Turbopack + Bun
Developer Friendly	Clean folder structure, TypeScript, reusable components
🏗️ Tech Stack

Framework: Next.js 16 (App Router)

Bundler: Turbopack

Runtime: Bun

Language: TypeScript

Styling: TailwindCSS (optional if you use it)

Deployment: Vercel

📁 Project Structure
lessoncrafter/
 ├─ app/
 │   ├─ api/
 │   │   ├─ generate/route.ts      # AI lesson generation
 │   │   ├─ regenerate/route.ts    # AI lesson re-generation
 │   │   └─ repair/route.ts        # AI repair functionality
 │   ├─ lessons/
 │   │   └─ [id]/page.tsx          # View lesson by ID
 │   ├─ layout.tsx
 │   └─ page.tsx
 │
 ├─ lib/
 │   └─ ai.ts                      # AI utilities (OpenAI / Gemini / Groq)
 │
 ├─ components/
 │   ├─ LessonCard.tsx
 │   └─ UI components...
 │
 ├─ public/
 ├─ .env.example
 ├─ bun.lockb
 ├─ package.json
 └─ README.md

🔌 API Documentation
1. Generate Lesson
POST /api/generate

Request:

{
  "prompt": "Explain Newton's First Law with examples"
}


Response (example):

{
  "id": "abc123",
  "title": "Newton's First Law",
  "content": "... generated lesson ..."
}

2. Regenerate Lesson
POST /api/regenerate

Request:

{
  "lessonId": "abc123",
  "prompt": "Make it simpler for grade 7 students"
}

3. Repair Lesson
POST /api/repair

Request:

{
  "lessonId": "abc123",
  "issue": "Fix grammar and improve clarity"
}

🔄 How It Works (Architecture)
User Prompt
     ↓
Frontend UI
     ↓
/api/generate  →  AI Model (OpenAI / Gemini / Groq)
     ↓
Lesson Generated
     ↓
Database or Local Storage
     ↓
Displayed on /lessons/[id]

🏁 Getting Started
Prerequisites

You must have Bun installed.

Install it here → https://bun.sh/docs/installation

Installation
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/lessoncrafter.git
cd lessoncrafter

2. Install dependencies
bun install

3. Setup environment variables

Create .env:

OPENAI_API_KEY=your-key-here


(Or Gemini/Groq depending on your backend)

4. Run development server
bun dev


Visit:
http://localhost:3000

🌐 Deployment (Vercel)

Push project to GitHub/GitLab/Bitbucket

Create a new Vercel project

Vercel auto-detects:

Next.js

App Router

Bun

Add environment variables

Click Deploy

Done 🚀

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch

Commit your changes

Open a pull request

