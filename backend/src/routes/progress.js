import express from 'express';
import { prisma } from '../config/prisma.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/progress - Fetch aggregated user progress and metrics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Execute queries in parallel using verified schema models
    const [
      roadmaps,
      dailyTasks,
      taskCheckins,
      leetcodeProfile,
      codeforcesProfile,
    ] = await Promise.all([
      prisma.userRoadmap.findMany({
        where: { userId },
        include: { steps: true },
      }),
      prisma.daily_tasks.findMany({
        where: { user_id: userId },
      }),
      prisma.task_checkins.findMany({
        where: { user_id: userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.leetcodeProfile.findUnique({
        where: { userId },
      }),
      prisma.codeforcesProfile.findUnique({
        where: { userId },
      }),
    ]);

    // Calculate dynamic progress metrics for the frontend
    const totalRoadmaps = roadmaps.length;
    const completedRoadmaps = roadmaps.filter(
      (r) => r.generationStatus === 'completed'
    ).length;

    // Calculate step-level completion
    let totalSteps = 0;
    let completedSteps = 0;
    roadmaps.forEach((roadmap) => {
      if (roadmap.steps) {
        totalSteps += roadmap.steps.length;
        completedSteps += roadmap.steps.filter(
          (s) => s.status === 'completed' || s.status === 'done'
        ).length;
      }
    });

    const roadmapProgressPercentage =
      totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

    // Calculate task metrics based on checkins
    const checkinDays = taskCheckins.length;
    let totalCompletedTasks = 0;
    taskCheckins.forEach((c) => {
      if (Array.isArray(c.tasks_completed)) {
        totalCompletedTasks += c.tasks_completed.length;
      }
    });

    const averageCompletionRate =
      checkinDays > 0
        ? Math.round(
            taskCheckins.reduce(
              (acc, c) => acc + Number(c.completion_rate || 0),
              0
            ) / checkinDays
          )
        : 0;

    // Construct the final payload mirroring what frontend consumers expect
    const progressData = {
      overview: {
        roadmapProgressPercentage,
        taskProgressPercentage: averageCompletionRate,
        totalRoadmaps,
        completedRoadmaps,
        totalTasksGenerated: dailyTasks.length,
        totalTasksCompleted: totalCompletedTasks,
        checkinDays,
      },
      platforms: {
        leetcode: leetcodeProfile
          ? {
              solved: leetcodeProfile.solved || 0,
              easy: leetcodeProfile.easy || 0,
              medium: leetcodeProfile.medium || 0,
              hard: leetcodeProfile.hard || 0,
            }
          : null,
        codeforces: codeforcesProfile
          ? {
              rating: codeforcesProfile.rating || 0,
              rank: codeforcesProfile.rank || 'Unrated',
              maxRating: codeforcesProfile.maxRating || 0,
            }
          : null,
      },
      recentActivity: taskCheckins,
    };

    return res.status(200).json(progressData);
  } catch (error) {
    console.error('[Progress API] Error fetching progress metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch progress metrics.' });
  }
});

export default router;