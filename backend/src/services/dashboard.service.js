import prisma from "../lib/prisma.js";
import { EmbeddingService } from "./embedding.service.js";
import { CodeforcesService } from "./platform/codeforces.service.js";

export class DashboardService {
  static async getDashboard(userId) {
    const today = new Date().toISOString().split("T")[0];

    // Parallel fetch of all essential dashboard dependencies in ONE roundtrip batch
    const [
      userState,
      allRoadmaps,
      checkins,
      leetcode,
      codeforces,
      todayTasksRecord,
      profile,
      memoryCount,
    ] = await Promise.all([
      prisma.user_state?.findUnique({ where: { user_id: userId } }).catch(() => null),
      prisma.userRoadmap
        .findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: {
            steps: {
              orderBy: { stepOrder: "asc" },
            },
          },
        })
        .catch(() => []),
      prisma.task_checkins
        ?.findMany({
          where: { user_id: userId },
          orderBy: { date: "asc" },
          take: 30,
          select: { date: true, completion_rate: true },
        })
        .catch(() => []),
      prisma.leetcodeProfile.findUnique({ where: { userId } }).catch(() => null),
      prisma.codeforcesProfile.findUnique({ where: { userId } }).catch(() => null),
      prisma.daily_tasks
        ?.findUnique({
          where: { user_id_date: { user_id: userId, date: new Date(today) } },
        })
        .catch(() => null),
      prisma.profiles
        ?.findUnique({
          where: { id: userId },
          select: { full_name: true, onboarding: true },
        })
        .catch(() => null),
      EmbeddingService.getEmbeddingCount(userId).catch(() => 0),
    ]);

    // 1. Resolve active or latest roadmap from eager roadmaps array
    let latestRoadmap = null;
    const activeRoadmapId = userState?.active_roadmap_id;

    if (activeRoadmapId) {
      latestRoadmap = allRoadmaps.find((r) => r.id === activeRoadmapId) || null;
    }

    if (!latestRoadmap && allRoadmaps.length > 0) {
      latestRoadmap = allRoadmaps[0];
    }

    // 2. Compute roadmap progress, focus steps, and recent activity
    let progress = { percentage: 0 };
    let activity = [];
    let focusSteps = [];

    if (latestRoadmap && latestRoadmap.steps) {
      const steps = latestRoadmap.steps;
      const done = steps.filter((s) => s.status === "done").length;

      progress = {
        percentage: steps.length === 0 ? 0 : Math.round((done / steps.length) * 100),
      };

      activity = steps
        .filter((s) => s.status === "done")
        .slice(-5)
        .reverse()
        .map((s) => ({
          id: s.id,
          title: s.title,
          level: s.level,
          status: s.status,
          step_order: s.stepOrder,
        }));

      focusSteps = steps
        .filter((s) => s.status === "in-progress" || s.status === "not-started")
        .slice(0, 3)
        .map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          level: s.level,
          duration: s.duration,
          mentor_tip: s.mentorTip,
          step_order: s.stepOrder,
          status: s.status,
        }));
    }

    // 3. Saved roadmaps overview (strip heavy steps relation for clean response)
    const savedRoadmaps = allRoadmaps.map((r) => ({
      id: r.id,
      title: r.title,
      careerGoal: r.careerGoal,
      generationStatus: r.generationStatus,
      createdAt: r.createdAt,
      isPublic: r.isPublic,
      stepCount: r.steps ? r.steps.length : 0,
      completedCount: r.steps ? r.steps.filter((s) => s.status === "done").length : 0,
    }));

    // 4. Telemetry aggregation
    const currentStreak = userState?.streak || 0;
    const maxStreak = userState?.streak || 0;
    let avgCompletion = 0;
    let trend = [];

    if (checkins && checkins.length > 0) {
      const total = checkins.reduce(
        (sum, item) => sum + Number(item.completion_rate || 0),
        0
      );
      avgCompletion = Math.round(total / checkins.length);
      trend = checkins.map((item) => ({
        date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
        completionRate: Number(item.completion_rate || 0),
      }));
    }

    // 5. Build consolidated payload
    const payload = {
      latestRoadmap: latestRoadmap
        ? {
            id: latestRoadmap.id,
            title: latestRoadmap.title,
            careerGoal: latestRoadmap.careerGoal,
            generationStatus: latestRoadmap.generationStatus,
            createdAt: latestRoadmap.createdAt,
            isPublic: latestRoadmap.isPublic,
          }
        : null,
      savedRoadmaps,
      progress,
      activity,
      focusSteps,
      telemetry: {
        currentStreak,
        maxStreak,
        avgCompletion,
        trend,
        mode: userState?.mode || "progression",
      },
      streak: { current: currentStreak, max: maxStreak },
      stats: { avgCompletion },
      platforms: {
        leetcode: leetcode || null,
        codeforces: CodeforcesService.formatProfile(codeforces),
      },
      todayTasks: todayTasksRecord?.tasks || null,
      userState: {
        streak: currentStreak,
        mode: userState?.mode || "progression",
        activeRoadmapId: userState?.active_roadmap_id || null,
      },
      profile: profile
        ? {
            fullName: profile.full_name,
            targetRole:
              profile.onboarding?.careerPath ||
              profile.onboarding?.domain ||
              "Software Development Engineer (SDE)",
            targetCompanies: Array.isArray(profile.onboarding?.targetCompanies)
              ? profile.onboarding.targetCompanies
              : typeof profile.onboarding?.targetCompanies === "string"
                ? profile.onboarding.targetCompanies
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                : [],
            primaryLanguage: profile.onboarding?.primaryLanguage || "C++",
            graduationBatch:
              profile.onboarding?.graduationYear ||
              profile.onboarding?.graduationBatch ||
              null,
            onboarding: profile.onboarding,
          }
        : null,
      memoryMetrics: {
        vectorsCount: memoryCount || 0,
        indexedSnippets: memoryCount || 0,
        semanticEngineActive: true,
      },
    };

    // Safely serialize BigInt fields
    return JSON.parse(
      JSON.stringify(payload, (_, v) => (typeof v === "bigint" ? Number(v) : v))
    );
  }
}