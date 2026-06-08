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

Users provide their preparation background, goals, and current state.

Navixo uses this information to generate a tailored preparation experience.

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

Secure authentication using Supabase Auth:

* Email & Password
* Google OAuth

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Frontend       | React, TypeScript, Vite                    |
| Styling        | Tailwind CSS, Shadcn UI                    |
| Backend        | Node.js, Express.js                        |
| Database       | PostgreSQL (Supabase)                      |
| Authentication | Supabase Auth, JWT-based API Authorization |
| AI             | Google Gemini                              |
| Deployment     | Vercel (Frontend), Render (Backend)        |
| Domain         | navixo.site                                |


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
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── config/
│
└── server.js

supabase/
└── functions/
```

---

## Current Capabilities

* User authentication
* Google OAuth login
* Placement onboarding workflow
* Roadmap generation
* Dashboard analytics
* LeetCode synchronization
* Codeforces synchronization
* Persistent AI chat history
* Progress tracking
* Responsive interface

---

## Local Development

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Environment Variables

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

Backend:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
PORT=
```

---

## Screenshots

### Landing Page

<img width="1896" height="955" alt="Screenshot 2026-06-09 021201" src="https://github.com/user-attachments/assets/83262b28-1bf2-4989-a653-51ec3db8d18b" />



### Dashboard

<img width="1898" height="1070" alt="image" src="https://github.com/user-attachments/assets/4a23a605-8d11-4b04-bc86-180203f1e65a" />


### Roadmap

<img width="1907" height="1078" alt="image" src="https://github.com/user-attachments/assets/4995ceaf-64c5-40ef-ba6b-ee3aa5b3fd15" />


### Chat Workspace

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/513739f8-95cc-42dd-bd85-33dad6c37dd4" />


---

## Roadmap

Upcoming improvements:

* Better execution analytics
* Advanced roadmap visualization
* Resume analysis
* Interview preparation modules
* Progress insights
* Improved mobile experience

---

## Contributors

* Ashkrit Rai — https://github.com/Askme007
* Abhishek Kumar — https://github.com/akabhi2311

---

## License

This project is currently not licensed for redistribution or commercial use.
