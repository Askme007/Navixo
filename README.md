# Navixo

AI-powered career navigation platform that helps students and early professionals discover career paths, generate personalized learning roadmaps, identify skill gaps, and interact with an AI mentor.

## Overview

Navixo combines roadmap generation, AI guidance, and progress tracking into a single platform designed to help users make informed career decisions.

The platform enables users to:

* Generate personalized career roadmaps
* Explore learning paths and milestones
* Chat with an AI mentor for guidance
* Track progress over time
* Identify skills required for target roles
* Receive structured recommendations based on goals

## Live Demo

https://navixo.site

---

## Features

### AI Mentor

Interactive AI-powered mentor capable of answering career-related questions and providing personalized guidance.

### Personalized Roadmaps

Generates structured learning plans based on a user's target career path and current skill level.

### Progress Tracking

Track roadmap completion and monitor learning progress.

### Career Navigation

Explore possible career directions and understand required skills, technologies, and milestones.

### Authentication

Secure authentication using Supabase Auth with support for:

* Email & Password
* Google OAuth

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Shadcn UI

### Backend

* Node.js
* Express.js

### Database & Auth

* Supabase
* PostgreSQL
* Row Level Security (RLS)

### Deployment

* Vercel
* Render

---

## Project Structure

```text
src/
├── components/
├── pages/
├── services/
├── hooks/

backend/
├── server.js
├── routes/
├── services/

supabase/
├── migrations/
```

---

## Architecture

Frontend (React)
↓
Supabase Authentication
↓
Node/Express API
↓
Supabase PostgreSQL
↓
Roadmap & AI Services

---

## Current Status

Active development.

Upcoming improvements:

* Conversation history
* Resume analysis
* Interview preparation
* Advanced roadmap analytics
* Learning recommendations
* User profile enhancements

---

## Screenshots

<img width="1883" height="1066" alt="Screenshot 2026-06-06 033145" src="https://github.com/user-attachments/assets/54cade4b-478b-45a9-85af-ba6276aade8b" />

---

<img width="1918" height="1078" alt="Screenshot 2026-06-06 033638" src="https://github.com/user-attachments/assets/26c4cfa2-6197-4575-98b6-baf6f156a326" />

---

<img width="1892" height="1077" alt="Screenshot 2026-06-06 033709" src="https://github.com/user-attachments/assets/557a05d1-5c8e-488f-9448-7b29ff907d20" />

---
<img width="1898" height="1077" alt="Screenshot 2026-06-06 033847" src="https://github.com/user-attachments/assets/a70bcb0a-e59a-46dc-b568-60e6a1a2b427" />

---
<img width="1918" height="1078" alt="Screenshot 2026-06-06 033915" src="https://github.com/user-attachments/assets/fdd7f8db-6b12-4518-a3b1-9332def38485" />

---
<img width="1908" height="1078" alt="Screenshot 2026-06-06 035322" src="https://github.com/user-attachments/assets/ec140fa9-e17a-44db-adf1-b029e702192e" />


---

## License

MIT License

---

Built as part of the journey from the Pathfinder AI prototype to Navixo.
