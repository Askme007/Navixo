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

    // 4. Telemetry aggregation & Accurate Streaks Calculation
    let currentStreak = userState?.streak || 0;
    let maxStreak = userState?.streak || 0;
    let avgCompletion = 0;

    const validCheckins = (checkins || []).filter((c) => c.date);

    if (validCheckins.length > 0) {
      // Calculate true all-time max streak and current streak
      const qualifyingCheckins = validCheckins.filter(
        (c) => Number(c.completion_rate || 0) >= 50
      );

      const qualifyingDateStrs = [
        ...new Set(
          qualifyingCheckins.map(
            (c) => new Date(c.date).toISOString().split("T")[0]
          )
        ),
      ].sort();

      if (qualifyingDateStrs.length > 0) {
        let longestRun = 1;
        let currentRun = 1;

        for (let i = 1; i < qualifyingDateStrs.length; i++) {
          const prev = new Date(qualifyingDateStrs[i - 1]);
          const curr = new Date(qualifyingDateStrs[i]);
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentRun += 1;
            if (currentRun > longestRun) longestRun = currentRun;
          } else {
            currentRun = 1;
          }
        }

        const lastQualifyingDate = qualifyingDateStrs[qualifyingDateStrs.length - 1];
        const daysSinceLastCheckin = Math.round(
          (new Date(today) - new Date(lastQualifyingDate)) / (1000 * 60 * 60 * 24)
        );

        // If last qualifying checkin was today (0) or yesterday (1), streak is alive!
        let activeCalculatedStreak = 0;
        if (daysSinceLastCheckin === 0 || daysSinceLastCheckin === 1) {
          activeCalculatedStreak = currentRun;
        }

        currentStreak = Math.max(activeCalculatedStreak, userState?.streak || 0);
        maxStreak = Math.max(longestRun, currentStreak, userState?.streak || 0);

        // Self-heal user_state in database if persisted streak is stale/incorrect
        if (userState && userState.streak !== currentStreak) {
          prisma.user_state
            ?.update({
              where: { user_id: userId },
              data: { streak: currentStreak },
            })
            .catch(() => null);
        }
      }
    }

    // Construct strict rolling 30-day execution trajectory
    const checkinMap = new Map();
    validCheckins.forEach((c) => {
      const dateKey = new Date(c.date).toISOString().split("T")[0];
      checkinMap.set(dateKey, Number(c.completion_rate || 0));
    });

    const thirtyDayTrend = [];
    let recentCompletedSum = 0;
    let recentCompletedCount = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const rate = checkinMap.get(dateKey) ?? 0;

      thirtyDayTrend.push({
        date: dateKey,
        completionRate: rate,
      });

      if (checkinMap.has(dateKey)) {
        recentCompletedSum += rate;
        recentCompletedCount++;
      }
    }

    // Average completion: prefer active days in last 30 days, fallback to historical average
    if (recentCompletedCount > 0) {
      avgCompletion = Math.round(recentCompletedSum / recentCompletedCount);
    } else if (validCheckins.length > 0) {
      const totalAll = validCheckins.reduce(
        (sum, item) => sum + Number(item.completion_rate || 0),
        0
      );
      avgCompletion = Math.round(totalAll / validCheckins.length);
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
        trend: thirtyDayTrend,
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