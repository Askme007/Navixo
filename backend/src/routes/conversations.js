import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/**
 * POST /api/conversations/create
 * Body: { title?: string }
 * Auth: required (req.user.id from JWT middleware)
 */
router.post("/create", async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 Secure authenticated user
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

      return res.status(500).json({
        message: error.message,
        details: error,
      });
    }

    return res.json({
      conversationId: data.id,
      title: data.title,
      created_at: data.created_at,
    });
  } catch (err) {
    console.error("Unexpected create conversation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/conversations/list
 * Auth: required — user ID is from JWT
 */
router.get("/list", async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 real user from backend

    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Conversation list error:", error);
      return res.status(500).json({ error: "Failed to fetch conversations" });
    }

    return res.json({ conversations: data || [] });
  } catch (err) {
    console.error("Unexpected list conversation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
