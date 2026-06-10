// backend/src/routes/conversations.js

import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body || {};

    const finalTitle = title?.trim() || "New Conversation";

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: finalTitle,
      })
      .select("id, title, created_at")
      .single();

    if (error) {
      console.error("Conversation create error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      conversationId: data.id,
      title: data.title,
      created_at: data.created_at,
    });
  } catch (err) {
    console.error("Conversation create error:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/list", async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Conversation list error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      conversations: data || [],
    });
  } catch (err) {
    console.error("Conversation list error:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
});

export default router;