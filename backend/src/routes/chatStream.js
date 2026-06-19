import express from "express";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chatStream
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res
        .status(400)
        .json({ error: "Conversation ID and message are required." });
    }

    const convId = conversationId;

    // 1. Verify user owns the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
    });

    if (!conversation || conversation.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized or invalid conversation." });
    }

    // 2. Save the User's message to the database
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content: message,
      },
    });

    // 3. Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    // 4. Retrieve conversation history for context
    const history = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Format history for Gemini API
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 5. Initialize Gemini Model and Chat Session
    // FIX: Bumped deprecated 'gemini-1.5-pro' to the current 'gemini-2.5-pro' model
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" }); // or 'gemini-1.5-flash'

    const chat = model.startChat({
      history: formattedHistory.slice(0, -1),
    });

    // 6. Setup Server-Sent Events (SSE) Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 7. Request Streaming Content from Gemini
    const result = await chat.sendMessageStream(message);

    let fullAiResponse = "";

    // 8. Stream the chunks to the client
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullAiResponse += chunkText;

      res.write(`data: ${JSON.stringify({ token: chunkText })}\n\n`);
    }

    // 9. Streaming finished, send done signal
    res.write("data: [DONE]\n\n");
    res.end();

    // 10. Save the complete AI response to the database
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "assistant",
        content: fullAiResponse,
      },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process chat stream." });
    } else {
      res.write(
        `data: ${JSON.stringify({ token: "\n\n**[AI Connection Error]**" })}\n\n`,
      );
      res.end();
    }
  }
});

export default router;
