import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/messages/:conversationId - Get all messages for a specific conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = req.params.conversationId; // Using pure UUID String

    // Verify ownership of the conversation first
    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this conversation.' });
    }

    // Fetch messages belonging to this conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'asc' },
    });

    // FIX: Wrap the array in a 'messages' key to match ChatbotPage.tsx line 125
    return res.status(200).json({
      messages: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

export default router;