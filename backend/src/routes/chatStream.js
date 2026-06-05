import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Role Mapper
const mapRoleToGemini = (dbRole) => {
  const role = dbRole?.toLowerCase();
  if (role === "user") return "user";
  if (role === "assistant" || role === "model") return "model";
  return "user";
};

// -------------------------------------
// 🔥 SECURE STREAMING ENDPOINT (POST)
// -------------------------------------
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 REAL AUTHENTICATED USER
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res
        .status(400)
        .json({ error: "conversationId and message required" });
    }

    // -----------------------------------------------
    // 🔐 1. Verify that conversation belongs to user
    // -----------------------------------------------
    const { data: convo, error: convoErr } = await supabase
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversationId)
      .single();

    if (convoErr || !convo) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (convo.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized conversation access" });
    }

    // -----------------------------------------------
    // 🔐 2. Fetch conversation history
    // -----------------------------------------------
    const { data: history, error: histErr } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (histErr) {
      console.error("History Fetch Error:", histErr);
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    const pastMessages = history.map((m) => ({
      role: mapRoleToGemini(m.role),
      parts: [{ text: m.content }],
    }));

    // -----------------------------------------------
    // Save user message immediately
    // -----------------------------------------------
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: message,
    });

    // Prepare Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const contents = [
      ...pastMessages,
      { role: "user", parts: [{ text: message }] },
    ];

    // -----------------------------------------------
    // SSE STREAM START
    // -----------------------------------------------
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const result = await model.generateContentStream({ contents });

    let aiResponse = "";

    for await (const chunk of result.stream) {
      let token = chunk.text ? chunk.text() : "";

      // Fallback in rare cases
      if (!token && chunk.candidates?.length) {
        const parts = chunk.candidates[0]?.content?.parts;
        parts?.forEach((p) => p.text && (token += p.text));
      }

      if (!token) continue;

      aiResponse += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    // -----------------------------------------------
    // Save AI response
    // -----------------------------------------------
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: aiResponse,
    });

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("STREAM ERROR:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

export default router;
