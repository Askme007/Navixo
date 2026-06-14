import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/conversations/list - List all conversations
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    
    // FIX: Wrapped the array in a 'conversations' key to match ChatbotPage.tsx lines 57 and 220
    return res.status(200).json({
      conversations: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// POST /api/conversations/create - Create a new conversation
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const newConversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
    });

    return res.status(201).json({
      ...newConversation,
      conversationId: newConversation.id 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ error: 'Failed to create conversation.' });
  }
});

// DELETE /api/conversations/:id - Delete a conversation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = req.params.id; 

    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { conversationId: convId } }),
      prisma.conversation.delete({ where: { id: convId } })
    ]);

    return res.status(200).json({ message: 'Conversation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({ error: 'Failed to delete conversation.' });
  }
});

export default router;