<div align="center">

<h1>Navixo</h1>

<p><em>Placement preparation is not an information problem. It is an execution problem.</em></p>

<p>Navixo is a placement execution engine that helps engineering students move from planning to consistent execution through —<br />personalized roadmaps, progress tracking, coding profile integrations, and structured preparation workflows.</p>

<br />

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white" />
</p>

<p>
  <a href="https://navixo.site"><img src="https://img.shields.io/badge/status-live-22c55e?style=flat-square" /></a>
  <img src="https://img.shields.io/badge/license-All_Rights_Reserved-6b7280?style=flat-square" />
</p>

<br />

<p>
  <a href="https://navixo.site">
    <img src="https://img.shields.io/badge/Live_Demo_%E2%86%92-F97316?style=for-the-badge&logoColor=white" height="36" />
  </a>
  &nbsp;
  <a href="https://github.com/Askme007/Navixo/issues/new?labels=bug">
    <img src="https://img.shields.io/badge/Report_a_Bug-1a1a2e?style=for-the-badge&logoColor=white" height="36" />
  </a>
  &nbsp;
  <a href="https://github.com/Askme007/Navixo/issues/new?labels=enhancement">
    <img src="https://img.shields.io/badge/Request_a_Feature-1a1a2e?style=for-the-badge&logoColor=white" height="36" />
  </a>
</p>

<br />

<p>
  <a href="#overview">Overview</a> &nbsp;·&nbsp;
  <a href="#features">Features</a> &nbsp;·&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;·&nbsp;
  <a href="#screenshots">Screenshots</a> &nbsp;·&nbsp;
  <a href="#tech-stack">Tech Stack</a> &nbsp;·&nbsp;
  <a href="#getting-started">Getting Started</a> &nbsp;·&nbsp;
  <a href="#environment-variables">Environment</a> &nbsp;·&nbsp;
  <a href="#roadmap">Roadmap</a> &nbsp;·&nbsp;
  <a href="#contributors">Contributors</a>
</p>

<br />


</div>

---

## Overview

Most engineering students approaching placement season have access to the same resources — LeetCode grind lists, YouTube playlists, blog roadmaps, and PDF guides. The information is abundant. The problem has never been access.

The real bottleneck is **execution** — showing up consistently, knowing what to do *today*, and being able to measure whether you're actually getting closer to placement-ready.

Navixo is built around this distinction. It is not a resource aggregator or a course platform. Navixo is an **AI-powered execution layer** — a focused workspace that translates preparation intent into structured, trackable daily action.
  
### The Problem

| Challenge | What actually happens |
|---|---|
| **Resource overload** | Dozens of DSA sheets, conflicting roadmaps, no clear path for your specific background |
| **No execution system** | You know what to study but have no structure for *how* to study it daily |
| **Fragmented tools** | LeetCode stats here, notes in Notion, roadmaps in a doc, Codeforces in another tab |
| **No mentor access** | Most students prepare without any personalised guidance or feedback loop |
| **No visibility** | You don't know whether this week's effort actually moved the needle |

### What Navixo Does

Navixo gives every engineering student access to a structured preparation system — one that generates a personalised roadmap based on their background, tracks execution at the task and milestone level, syncs real-time data from their coding profiles, and provides an AI mentor to unblock them when they're stuck.

---

## Features

### Planning

| Feature | Description |
|---|---|
| **Personalised Onboarding** | Captures preparation background, goals, target companies, and current skill level to calibrate the experience |
| **AI Roadmap Generation** | Produces structured preparation roadmaps across DSA, Core CS, Development, and Placement Prep — driven by Google Gemini |
| **Roadmap Persistence** | All generated roadmaps are stored and accessible across sessions and devices |

### Execution

| Feature | Description |
|---|---|
| **Execution Dashboard** | Central view of active roadmaps, completed milestones, current focus areas, and progress percentages |
| **Progress Tracking** | Topic-level and milestone-level execution logging with completion states |
| **Platform Statistics** | Aggregated view of coding activity from all connected profiles |

### Intelligence

| Feature | Description |
|---|---|
| **AI Mentor Chat** | Conversational interface powered by Gemini for roadmap clarification, concept explanation, and study guidance |
| **Persistent Conversations** | Full chat history is preserved across sessions — pick up where you left off |

### Integrations

| Feature | Description |
|---|---|
| **LeetCode Sync** | Connect your LeetCode profile to surface problems solved, difficulty breakdown, and ranking data |
| **Codeforces Sync** | Connect your Codeforces account to track rating history and competitive programming activity |

### Authentication

| Feature | Description |
|---|---|
| **Email & Password** | Standard credential-based authentication with secure password handling |
| **Google OAuth 2.0** | One-click sign-in with Google |
| **JWT Architecture** | Separate access and refresh token lifecycle for secure, stateless API authorisation |

---

## Architecture

### System Overview

```mermaid
graph TB
    User((User))

    subgraph Frontend ["Frontend · Vercel"]
        FE["React · TypeScript · Vite\nTailwind CSS · Shadcn UI"]
    end

    subgraph Backend ["Backend · Render"]
        API["Express.js REST API"]
        MW["JWT Auth Middleware"]
    end

    subgraph Data ["Data Layer"]
        ORM["Prisma ORM"]
        PG[("PostgreSQL")]
        ORM --> PG
    end

    subgraph External ["External Services"]
        GEM["Google Gemini AI"]
        OAUTH["Google OAuth 2.0"]
        LC["LeetCode API"]
        CF["Codeforces API"]
    end

    User --> FE
    FE -->|"REST · JWT Bearer"| API
    API --> MW
    MW --> ORM
    API -->|"AI Requests"| GEM
    GEM -->|"Roadmap / Chat Response"| API
    API -->|"JSON Response"| FE
    FE --> OAUTH
    FE -->|"Profile Sync"| LC
    FE -->|"Profile Sync"| CF
```

### Roadmap Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as React Client
    participant API as Express API
    participant Auth as JWT Middleware
    participant AI as Gemini AI
    participant DB as PostgreSQL

    U->>FE: Initiate roadmap generation
    FE->>API: POST /api/roadmap/generate
    API->>Auth: Validate Bearer token
    Auth-->>API: Token verified · User context attached
    API->>AI: Generate roadmap with user profile context
    Note over AI: Processes preparation goals,<br/>background, and target areas
    AI-->>API: Structured roadmap JSON
    API->>DB: Persist roadmap via Prisma ORM
    DB-->>API: Saved record with ID
    API-->>FE: 201 { roadmap, id }
    FE-->>U: Render interactive roadmap view
```

---

## Screenshots

### Landing Page

<img src="https://github.com/user-attachments/assets/83262b28-1bf2-4989-a653-51ec3db8d18b" width="100%" alt="Navixo — Landing Page" />

<br />

### Execution Dashboard

<img src="https://github.com/user-attachments/assets/4a23a605-8d11-4b04-bc86-180203f1e65a" width="100%" alt="Navixo — Dashboard" />

<br />

### Roadmap View

<img src="https://github.com/user-attachments/assets/4995ceaf-64c5-40ef-ba6b-ee3aa5b3fd15" width="100%" alt="Navixo — Roadmap" />

<br />

### AI Chat Workspace

<img src="https://github.com/user-attachments/assets/513739f8-95cc-42dd-bd85-33dad6c37dd4" width="100%" alt="Navixo — AI Chat" />

---

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=flat-square&logo=shadcnui&logoColor=white)

**Authentication**

![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth_2.0-4285F4?style=flat-square&logo=google&logoColor=white)

</td>
<td valign="top" width="50%">

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)

**Database**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)

**AI & Deployment**

![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)

</td>
</tr>
</table>

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** database — local, or a hosted provider (Neon, Supabase, or Railway)
- **Google Cloud project** with OAuth 2.0 credentials configured
- **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/Askme007/Navixo.git
cd Navixo
```

### 2. Frontend setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your environment variables — see Environment Variables below

# Start the development server
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

### 3. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your environment variables — see Environment Variables below

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the server
npm run dev
```

The API server runs at `http://localhost:8080` by default.

---

## Environment Variables

### Frontend

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `https://api.navixo.site` |
| `VITE_API_BASE_URL` | Alternate API base URL for prefixed routes | `https://api.navixo.site/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | `123456789.apps.googleusercontent.com` |

### Backend

| Variable | Description | Notes |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string | Used for runtime queries |
| `DIRECT_URL` | Direct PostgreSQL connection string | Used by Prisma for migrations |
| `JWT_SECRET` | Master JWT signing secret | Use a strong random value |
| `JWT_ACCESS_SECRET` | Access token signing secret | Short-lived tokens |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Long-lived tokens |
| `GEMINI_API_KEY` | Google Gemini API key | From Google AI Studio |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | |
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## Project Structure

```
Navixo/
│
├── src/                          # Frontend source
│   ├── components/
│   │   ├── dashboard/            # Dashboard widgets and analytics panels
│   │   ├── chat/                 # AI chat workspace components
│   │   ├── Markdown/             # Markdown rendering utilities
│   │   └── ui/                   # Shadcn UI base component library
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API service layer (axios/fetch wrappers)
│   ├── utils/                    # Shared utility functions
│   └── router.tsx                # Application route definitions
│
├── backend/
│   └── src/
│       ├── controllers/          # Route handler logic
│       ├── routes/               # Express route definitions
│       ├── services/             # Business logic and external integrations
│       ├── middleware/           # Auth validation, error handling
│       └── config/               # Environment config and app constants
│
└── prisma/
    └── schema.prisma             # Database schema definitions
```

---

## Roadmap

Navixo is under active development. The following capabilities are planned:

**Shipped**
- [x] Personalised onboarding workflow
- [x] AI-generated preparation roadmaps (Gemini)
- [x] Execution dashboard with progress tracking
- [x] LeetCode and Codeforces profile sync
- [x] AI mentor chat with persistent history
- [x] Google OAuth and JWT authentication
- [x] Responsive web interface

**Upcoming**
- [ ] Advanced execution analytics and trend visualisation
- [ ] Resume analyser with AI-generated feedback
- [ ] Interview preparation module with curated question banks
- [ ] Mock interview system with AI evaluation
- [ ] Daily execution reports and accountability nudges
- [ ] Placement analytics — offer tracking, company-wise preparation stats
- [ ] Mobile application

---

## Contributing

Contributions, bug reports, and feature requests are welcome.

Before submitting a pull request for a significant change, please open an issue first to discuss the proposed change and confirm it aligns with the project direction.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: describe your change"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a pull request against main
```

Please keep commits focused and pull requests scoped to a single concern.

---

## Contributors

<table>
<tr>
  <td align="center">
    <a href="https://github.com/Askme007">
      <img src="https://github.com/Askme007.png?size=80" width="72" style="border-radius:50%" /><br />
      <sub><b>Ashkrit Rai</b></sub>
    </a>
  </td>
  <td align="center">
    <a href="https://github.com/akabhi2311">
      <img src="https://github.com/akabhi2311.png?size=80" width="72" style="border-radius:50%" /><br />
      <sub><b>Abhishek Kumar</b></sub>
    </a>
  </td>
</tr>
</table>

---

## Support

| Channel | Purpose |
|---|---|
| [GitHub Issues](https://github.com/Askme007/Navixo/issues) | Bug reports and reproducible problems |
| [GitHub Issues](https://github.com/Askme007/Navixo/issues) | Feature requests — use the `enhancement` label |

When filing a bug report, please include your browser, Node.js version, and steps to reproduce the issue.

---

## License

This project is proprietary software.
Source code is provided for portfolio and demonstration purposes only.
No part of this repository may be copied, redistributed, modified, or used commercially without explicit written permission from the authors.

All rights reserved © 2026 Ashkrit Rai, Abhishek Kumar.

---

<div align="center">
  <sub>Built with focus. Shipped with purpose.</sub>
</div>
