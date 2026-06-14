// backend\src\routes\roadmapGenerate.js


import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";
import { processRoadmap } from "./roadmapWorker.js";
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

import authenticate from "../middleware/auth.js";

router.post(
  "/generate",
  authenticate,
  async (req, res) => {  
  console.log("GENERATE API HIT");
  console.log("TIME =", new Date().toISOString());
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

  processRoadmap(data.id);

    res.json({
      roadmapId: data.id,
    });
}
);

export default router;
