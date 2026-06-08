// backend\src\routes\roadmapGenerate.js


import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", async (req, res) => {
  const userId = req.user.id;
  const { career } = req.body;

  const { data, error } = await supabase
    .from("user_roadmaps")
    .insert({
      user_id: userId,
      title: career,
      career_goal: career,
      generation_status: "pending",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: "Init failed" });

  res.json({ roadmapId: data.id });
});

export default router;
