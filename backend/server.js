import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient.js"; // ← THIS WAS MISSING
import authenticate from "./src/middleware/auth.js";

import chatStreamRoute from "./src/routes/chatStream.js";
import conversationsRoutes from "./src/routes/conversations.js";
import roadmapGenerateRoute from "./src/routes/roadmapGenerate.js";
import { processRoadmap } from "./src/routes/roadmapWorker.js";
import messagesRoute from "./src/routes/messages.js";
setInterval(async () => {
  try {
    const { data } = await supabase
      .from("user_roadmaps")
      .select("id")
      .eq("generation_status", "pending")
      .limit(1)
      .single();

    if (data) processRoadmap(data.id);
  } catch (err) {
    console.error("WORKER LOOP FAILED:", err.message);
  }
}, 4000);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/stream", authenticate, chatStreamRoute);
app.use("/api/conversations", authenticate, conversationsRoutes);
app.use("/api/roadmap", authenticate, roadmapGenerateRoute);
app.use("/api/messages", authenticate, messagesRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`),
);
