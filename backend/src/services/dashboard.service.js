import prisma from "../lib/prisma.js";

export class DashboardService {
  static async getDashboard(userId) {
    const latestRoadmap = await prisma.userRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const savedRoadmaps = await prisma.userRoadmap.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let progress = { percentage: 0 };
    let activity = [];
    let focusSteps = [];

    if (latestRoadmap) {
      const steps = await prisma.roadmapStep.findMany({
        where: { roadmapId: latestRoadmap.id },
        orderBy: { stepOrder: "asc" },
      });

      const done = steps.filter((s) => s.status === "done").length;

      progress = {
        percentage: steps.length === 0 ? 0 : Math.round((done / steps.length) * 100),
      };

      activity = steps
        .filter((s) => s.status === "done")
        .slice(-5)
        .reverse();

      focusSteps = steps
        .filter((s) => s.status === "in-progress" || s.status === "not-started")
        .slice(0, 3);
    }

    let currentStreak = 0;
    let maxStreak = 0;
    let avgCompletion = 0;

    try {
      // 1. Get streaks from user_state using the verified snake_case user_id
      const userState = await prisma.user_state?.findUnique({
        where: { user_id: userId } 
      });

      if (userState) {
        currentStreak = userState.streak || 0;
        maxStreak = userState.streak || 0; 
      }

      // 2. Compute aggregate average directly from task_checkins historical metrics
      const checkins = await prisma.task_checkins?.findMany({
        where: { user_id: userId },
        select: { completion_rate: true }
      });

      if (checkins && checkins.length > 0) {
        // Average out all recorded completion rates
        const total = checkins.reduce((sum, item) => sum + Number(item.completion_rate || 0), 0);
        avgCompletion = Math.round(total / checkins.length);
      }
    } catch (telemetryError) {
      console.warn("Telemetry aggregate processing error:", telemetryError.message);
    }

    // Return payload to satisfy what frontend might read
    const payloadData = {
      currentStreak,
      maxStreak,
      avgCompletion
    };

    return {
      latestRoadmap,
      savedRoadmaps,
      progress,
      activity,
      focusSteps,
      telemetry: payloadData,
      streak: { current: currentStreak, max: maxStreak },
      stats: { avgCompletion }
    };
  }
}