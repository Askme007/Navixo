// 1. MUST load dotenv BEFORE any other imports to fix JWT_SECRET = undefined
import 'dotenv/config'; 

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authenticate from "./src/middleware/auth.js";

import authRoutes from "./src/routes/auth.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import platformRoutes from "./src/routes/platforms.js";
import profileRoutes from "./src/routes/profile.js";
import progressRoute from "./src/routes/progress.js";
import tasksRoute from "./src/routes/tasks.js";

import chatStreamRoute from "./src/routes/chatStream.js";
import conversationsRoutes from "./src/routes/conversations.js";
import messagesRoute from "./src/routes/messages.js";

import roadmapRoutes from "./src/routes/roadmap.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://navixo.site",
  "https://www.navixo.site",
  "https://navixo.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Navixo Backend Running",
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/tasks", authenticate, tasksRoute);

// NOTE: Ensure your frontend is calling /api/stream and not /api/chat/stream 
// based on how this is mounted!
app.use("/api/stream", authenticate, chatStreamRoute);

app.use(
  "/api/conversations",
  authenticate,
  conversationsRoutes
);

app.use(
  "/api/messages",
  authenticate,
  messagesRoute
);

app.use(
  "/api/progress",
  authenticate,
  progressRoute
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/platforms",
  platformRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

/*
|--------------------------------------------------------------------------
| Roadmap
|--------------------------------------------------------------------------
*/

app.use(
  "/api/roadmap",
  roadmapRoutes
);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

// FIX: Express 5 requires a named parameter for wildcards or a specific regex format.
app.use(/(.*)/, (_req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});