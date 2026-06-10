// backend/src/routes/messages.js

import express from "express";
import authenticate from "../middleware/auth.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:conversationId", authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Messages fetch error:", error);
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      messages: data || [],
    });
  } catch (err) {
    console.error("Messages fetch error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;