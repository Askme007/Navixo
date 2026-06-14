# Navixo

Placement preparation is not an information problem. It is an execution problem.

Navixo is a student execution platform designed to help engineering students move from planning to consistent action. Instead of overwhelming users with endless resources, Navixo generates structured preparation roadmaps, tracks progress, integrates coding platform performance, and provides a focused execution workflow for placement preparation.

**Live Demo:** https://navixo.site

---

## Why Navixo Exists

Most students already know what they should study.

The real challenge is:

* What should I do today?
* Am I making progress?
* Which topics am I weak in?
* How close am I to being placement-ready?

Navixo was built to answer those questions through structured planning, progress tracking, and execution-focused workflows.

---

## Core Features

### Personalized Onboarding
Users provide their preparation background, goals, and current state. Navixo uses this information to generate a tailored preparation experience.

### Roadmap Generation
Generate structured learning roadmaps covering:
* Data Structures & Algorithms
* Core CS Subjects
* Development
* Placement Preparation

Roadmaps are saved and can be revisited anytime.

### Execution Dashboard
Track preparation through a centralized dashboard containing:
* Active roadmaps
* Completed milestones
* Current focus areas
* Platform statistics
* Progress summaries

### LeetCode Integration
Connect your LeetCode profile and track:
* Problems solved
* Easy / Medium / Hard breakdown
* Ranking information
* Sync status

### Codeforces Integration
Connect your Codeforces account and monitor:
* Rating
* Problem-solving activity
* Competitive programming progress

### AI Chat Workspace
Interactive chat interface for:
* Roadmap clarification
* Learning guidance
* Preparation questions
* Study support

Includes persistent conversation history.

### Authentication
Secure custom authentication architecture:
* Custom JWT-based Authorization Middleware
* Seamless Google OAuth integration (`@react-oauth/google`)

---

## Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| Frontend       | React, TypeScript, Vite                            |
| Styling        | Tailwind CSS, Shadcn UI                            |
| Backend        | Node.js, Express.js                                |
| Database       | PostgreSQL managed via **Prisma ORM** |
| Authentication | Custom JWT Authorization & Google OAuth            |
| AI             | Google Gemini                                      |
| Deployment     | Vercel (Frontend), Render (Backend)                |
| Domain         | navixo.site                                        |

---

## Project Structure

```text
src/
├── components/
│   ├── dashboard/
│   ├── chat/
│   ├── Markdown/
│   ├── ui/
│   └── pages/
│
├── hooks/
├── services/
├── utils/
└── router.tsx

backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── config/
│
└── server.js