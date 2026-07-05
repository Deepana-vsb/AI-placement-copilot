# AI Placement Copilot
### Accelerate your placement preparation with AI-driven resume reviews and technical mock interviews.

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

> AI Placement Copilot is an end-to-end full-stack SaaS platform designed to streamline student preparation for technical job interviews. By leveraging the power of Next.js 14 App Router, MongoDB Atlas, and the Groq API running the `llama-3.3-70b-versatile` LLM model, the platform provides automated, high-precision ATS resume reviews, conversational turn-based mock technical interviews with a calibration score, and a personalized study planner roadmap to close skill gaps.

---

## Table of Contents
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Prompt Engineering Deep Dive](#prompt-engineering-deep-dive)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Author](#author)
- [License](#license)

---

## Key Features

The application ports and fully implements all 16 design mockups:

| Page / Feature | Type / Support | Description |
| :--- | :--- | :--- |
| **Login** | Wired Backend Auth | Secure credential check using JWT cookie authentication. |
| **Signup** | Wired Backend Auth | Hashed password user registration with college details. |
| **Onboarding** | Database Persistence | Multi-step form capturing target role, companies, and skill ratings. |
| **Dashboard** | AI Analytics Aggregated | Live metrics (Streak, XP, Resume/Interview stats) & dynamic weak topic warning. |
| **Resume Review** | **AI-powered (Groq LLaMA)** | ATS grading and bullet-point rewrite suggestions in What/How/Impact syntax. |
| **Mock Interview** | **AI-powered (Groq LLaMA)** | Turn-based text-based technical mock interview session with live calibrator. |
| **Planner** | UI complete, seeded data | Chronological module roadmap of core computer science chapters. |
| **Profile** | UI complete, seeded data | Displays earned badges, target preferences, and scores. |
| **Settings** | UI complete, seeded data | Manage student info and preferences details. |
| **Achievements** | UI complete, seeded data | Level tracking and badge completion milestones. |
| **Coding Practice** | UI complete, seeded data | Central dashboard of coding problems grouped by topics. |
| **Java Practice** | UI complete, seeded data | Code execution editor for Java object-oriented questions. |
| **SQL Practice** | UI complete, seeded data | Database editor for query syntax challenges. |
| **Aptitude Prep** | UI complete, seeded data | Math logic reasoning multiple-choice test environment. |
| **Communication** | UI complete, seeded data | Pitch linguistic pace, filler word, and clarity calibrator. |
| **Skill Gap Analysis**| UI complete, seeded data | Capability radar indicator showing target role requirements. |

---

## System Architecture

### Runtime Workflow

```
┌─────────┐       Request       ┌──────────────────────────────┐
│ Browser │  ────────────────>  │ Next.js 14 App Router Server │
│ (Client)│  <────────────────  │ (API Endpoints & TSX pages)  │
└─────────┘       Response      └──────────────────────────────┘
                                          │            │
                                     DB   │            │ Groq SDK
                                   Driver │            │ API call
                                          ▼            ▼
                                 ┌──────────────┐   ┌──────────┐
                                 │ MongoDB      │   │ Groq API │
                                 │ Atlas        │   │ (LLaMA)  │
                                 └──────────────┘   └──────────┘
```

### Layer Responsibilities

| Component Layer | Technologies Used | Primary Responsibility |
| :--- | :--- | :--- |
| **Client Frontend** | Next.js 14 App Router, TSX, CSS | UI representation, form validation, responsive layouts. |
| **Backend API Controller**| Next.js API Routes (`/api/*`) | Endpoint routing, JWT token extraction, session security. |
| **Database Store** | MongoDB Atlas, native MongoDB driver| Storage of users, onboarding, reviews, and XP events. |
| **AI Reasoning Engine** | Groq SDK, `llama-3.3-70b-versatile` | Resume optimization and turn-based mock interview calibration. |

---

## Prompt Engineering Deep Dive

AI Placement Copilot follows rigorous prompt engineering principles to guarantee deterministic behavior and clean structural responses:

### 1. Resume Review Agent (`/api/resume/route.ts`)
- **Persona:** Senior technical recruiter reviewing resumes for entry-level software roles.
- **Forced JSON Output Schema:** `{what, how, impact, score, suggestions[]}`.
- **Few-Shot Examples:** Provides two examples mapping weak bullets to high-impact "What/How/Impact" bullets (e.g. converting *"Helped build a website using React"* to *"Designed and implemented a responsive web dashboard utilizing React.js... increasing onboarding by 25%"*).

```
System Prompt:
You are a senior technical recruiter reviewing resumes for entry-level software roles.
Your task is to analyze the provided resume text and generate structured feedback to improve it.
Focus particularly on rewriting weak resume bullets into high-impact "What/How/Impact" format.

For your feedback, you MUST output a single, valid JSON object matching the following structure exactly, and nothing else. Do not wrap the JSON in Markdown formatting (e.g. do not use \`\`\`json).

JSON Schema:
{
  "what": "Detailed description of the primary focus area that needs work...",
  "how": "Actionable advice on how to rewrite their bullets...",
  "impact": "Actionable advice on how to quantify and specify the measurable results...",
  "score": 75,
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Few-Shot Examples:
[2 examples included demonstrating bullet transformations]
```

### 2. Mock Interview Agent (`/api/interview/route.ts` and `/api/interview/end/route.ts`)
- **Separation of Concerns:** Instead of forcing a single prompt to manage the interactive conversation *and* calculate final scores, we split these tasks into two dedicated prompts. This reduces context drift and prevents performance bias:
  - **Conversational Agent Prompt:** Directs the model to act as a technical interviewer, asking exactly **one** question at a time and reacting naturally to candidate answers in character.
  - **Scoring Agent Prompt:** Triggered on "End Interview", this prompt functions as a technical calibration committee, analyzing the full transcript to score the conversation out of 100 across three categories: Technical, Communication, and Confidence.

```
Conversational System Prompt:
You are an expert technical interviewer conducting a mock interview for the role of: {targetRole}.
Your goals are to assess the candidate's core technical understanding, problem-solving methodologies, and communication.
Rules:
1. Act strictly in character as a professional tech interviewer.
2. Ask exactly ONE clear, concise question at a time.
3. Listen to the candidate's answer and ask a logical follow-up question.
4. Keep responses under 3-4 sentences.

Scoring System Prompt:
You are a Senior Technical Calibration Committee Member. Your ONLY job is to evaluate and score a transcript of a mock technical interview for the target role: {targetRole}.
Analyze the interview conversation and output a structured performance report matching this JSON:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "skillScores": { "technical": 80, "communication": 85, "confidence": 75 },
  "overallScore": 80
}
```

---

## Project Structure

```
placement-copilot/frontend/
├── .env.example
├── Dockerfile
├── next.config.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── me/
│   │   │   │   └── route.ts
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   │   └── stats/
│   │   │       └── route.ts
│   │   ├── interview/
│   │   │   ├── route.ts
│   │   │   └── end/
│   │   │       └── route.ts
│   │   ├── onboarding/
│   │   │   └── route.ts
│   │   └── resume/
│   │       └── route.ts
│   ├── achievement/
│   │   └── page.tsx
│   ├── aptitudepractice/
│   │   └── page.tsx
│   ├── codingpractice/
│   │   └── page.tsx
│   ├── communication/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── javapractice/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── mock/
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── planner/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── skillgapanalysis/
│   │   └── page.tsx
│   ├── sqlpractice/
│   │   └── page.tsx
│   └── studentprofile/
│       └── page.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   ├── auth.ts
│   └── db.ts
└── public/
    └── .gitkeep
```

---

## Quick Start

### Local Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd placement-copilot/frontend
   ```
2. Create your environment configuration:
   ```bash
   cp .env.example .env
   ```
   Fill in the `MONGODB_URI`, `GROQ_API_KEY`, and `JWT_SECRET`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

### Running in Docker
1. Build the production Docker image:
   ```bash
   docker build -t placement-copilot .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env placement-copilot
   ```

---

## Configuration

| Environment Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | Connection string to MongoDB Atlas. | `mongodb+srv://...` |
| `GROQ_API_KEY` | Developer API key from Groq Console. | `gsk_...` |
| `JWT_SECRET` | Secret key used to encrypt cookie tokens. | `some_super_secret_hash` |

---

## Roadmap

- [x] **Resume Review Agent:** ATS optimization tool with What/How/Impact prompt metrics.
- [x] **Mock Interview Agent:** Turn-based technical dialog simulator with scoring calibration.
- [ ] **Voice Mock Interviews:** Real-time speech-to-text audio streaming model calibration.
- [ ] **Sandboxed Code Labs:** Isolated container playground running SQL & Java tests.
- [ ] **Semantic Vector Search:** RAG pipelines injecting syllabus docs matching company target roles.

---

## Author
- **Solo Student**
- **ABC Engineering College**
- **Computer Science & Engineering, 4th Year**

---

## License
Licensed under the [MIT License](LICENSE).
