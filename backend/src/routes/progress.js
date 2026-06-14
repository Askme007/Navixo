import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/progress - Fetch aggregated user progress and metrics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Execute Prisma queries in parallel using your updated schema models
    const [
      roadmaps,
      dailyTasks,
      executionHistory,
      leetcodeProfile,
      codeforcesProfile
    ] = await Promise.all([
      prisma.userRoadmap.findMany({
        where: { userId },
        include: { steps: true }
      }),
      prisma.dailyTask.findMany({
        where: { userId }
      }),
      prisma.executionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.leetcodeProfile.findUnique({
        where: { userId }
      }),
      prisma.codeforcesProfile.findUnique({
        where: { userId }
      })
    ]);

    // Calculate dynamic progress metrics for the frontend
    const totalRoadmaps = roadmaps.length;
    const completedRoadmaps = roadmaps.filter(r => r.generationStatus === 'completed').length;
    
    // Calculate step-level completion
    let totalSteps = 0;
    let completedSteps = 0;
    roadmaps.forEach(roadmap => {
      if (roadmap.steps) {
        totalSteps += roadmap.steps.length;
        completedSteps += roadmap.steps.filter(s => s.status === 'completed' || s.status === 'done').length;
      }
    });

    const roadmapProgressPercentage = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

    // Calculate Task Metrics (Based on DailyTask records)
    const totalTasks = dailyTasks.length;
    const completedTasks = dailyTasks.length; 
    const taskProgressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Construct the final payload mirroring what the frontend expects
    const progressData = {
      overview: {
        roadmapProgressPercentage,
        taskProgressPercentage,
        totalRoadmaps,
        completedRoadmaps,
        totalTasks,
        completedTasks
      },
      platforms: {
        leetcode: leetcodeProfile ? {
          solved: leetcodeProfile.solved || 0,
          easy: leetcodeProfile.easy || 0,
          medium: leetcodeProfile.medium || 0,
          hard: leetcodeProfile.hard || 0
        } : null,
        codeforces: codeforcesProfile ? {
          rating: codeforcesProfile.rating || 0,
          rank: codeforcesProfile.rank || 'Unrated',
          maxRating: codeforcesProfile.maxRating || 0
        } : null
      },
      recentActivity: executionHistory
    };

    return res.status(200).json(progressData);

  } catch (error) {
    console.error('[Progress API] Error fetching progress metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch progress metrics.' });
  }
});

export default router;