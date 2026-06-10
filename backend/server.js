// backend/server.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient.js";
import authenticate from "./src/middleware/auth.js";

import chatStreamRoute from "./src/routes/chatStream.js";
import conversationsRoutes from "./src/routes/conversations.js";
import roadmapGenerateRoute from "./src/routes/roadmapGenerate.js";
import { processRoadmap } from "./src/routes/roadmapWorker.js";
import messagesRoute from "./src/routes/messages.js";
<<<<<<< HEAD
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.js";
=======
import progressRoute from "./src/routes/progress.js";
import tasksRoute from "./src/routes/tasks.js";
>>>>>>> task-generator-merge

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
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// IMPORTANT: let preflight pass before auth middleware sees it
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

setInterval(async () => {
  try {
    const { data, error } = await supabase
      .from("user_roadmaps")
      .select("id")
      .eq("generation_status", "pending")
      .limit(1)
      .single();

    if (error) return;
    if (data?.id) processRoadmap(data.id);
  } catch (err) {
    console.error("WORKER LOOP FAILED:", err.message);
  }
}, 4000);

app.use("/api/auth", authRoutes);

app.use("/api/tasks", authenticate, tasksRoute);
app.use("/api/stream", authenticate, chatStreamRoute);
app.use("/api/conversations", authenticate, conversationsRoutes);
app.use("/api/roadmap", authenticate, roadmapGenerateRoute);
app.use("/api/messages", authenticate, messagesRoute);
app.use("/api/progress", authenticate, progressRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
