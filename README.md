# Navixo

Navixo is an AI-powered career navigation platform built to help engineering students move from planning to consistent execution. Instead of overwhelming users with endless resources, Navixo generates structured preparation roadmaps, tracks progress, integrates coding platform performance, and provides a focused workflow for placement preparation.

**Live Demo:** https://navixo.site

---

## Why Navixo Exists

Most students already know what they should study.

The real challenge is execution:

- What should I do today?
- Am I making measurable progress?
- Which topics am I weak in?
- How close am I to being placement-ready?

Navixo is built to answer those questions through structured planning, progress tracking, and execution-focused workflows.

---

## Core Features

### Personalized Onboarding
Users provide their preparation background, goals, and current state.  
Navixo uses this information to generate a tailored preparation experience.

### Roadmap Generation
Generate structured learning roadmaps covering:

- Data Structures & Algorithms
- Core CS Subjects
- Development
- Placement Preparation

Roadmaps are saved and can be revisited anytime.

### Execution Dashboard
Track preparation through a centralized dashboard containing:

- Active roadmaps
- Completed milestones
- Current focus areas
- Platform statistics
- Progress summaries

### LeetCode Integration
Connect your LeetCode profile and track:

- Problems solved
- Easy / Medium / Hard breakdown
- Ranking information
- Sync status

### Codeforces Integration
Connect your Codeforces account and monitor:

- Rating
- Problem-solving activity
- Competitive programming progress

### AI Chat Workspace
Interactive chat interface for:

- Roadmap clarification
- Learning guidance
- Preparation questions
- Study support

Includes persistent conversation history.

### Authentication
Secure authentication architecture using:

- Email and password
- Google OAuth
- JWT-based authorization

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, Shadcn UI |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, Google OAuth |
| AI | Google Gemini |
| Deployment | Vercel (Frontend), Render (Backend) |
| Domain | navixo.site |

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

prisma/
└── schema.prisma
````

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
VITE_API_URL=
VITE_API_BASE_URL=
VITE_GOOGLE_CLIENT_ID=
```

Backend:

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PORT=
NODE_ENV=
```

---

## Screenshots

### Landing Page

<img width="1896" height="955" alt="Landing Page" src="https://github.com/user-attachments/assets/83262b28-1bf2-4989-a653-51ec3db8d18b" />

### Dashboard

<img width="1898" height="1070" alt="Dashboard" src="https://github.com/user-attachments/assets/4a23a605-8d11-4b04-bc86-180203f1e65a" />

### Roadmap

<img width="1907" height="1078" alt="Roadmap" src="https://github.com/user-attachments/assets/4995ceaf-64c5-40ef-ba6b-ee3aa5b3fd15" />

### Chat Workspace

<img width="1917" height="1078" alt="Chat Workspace" src="https://github.com/user-attachments/assets/513739f8-95cc-42dd-bd85-33dad6c37dd4" />

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

* Ashkrit Rai — [https://github.com/Askme007](https://github.com/Askme007)
* Abhishek Kumar — [https://github.com/akabhi2311](https://github.com/akabhi2311)

---

## License

This project is currently not licensed for redistribution or commercial use.

```
