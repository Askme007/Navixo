import express from "express";
import prisma from "../lib/prisma.js";
import authenticate from "../middleware/auth.js";
import { processRoadmap } from "../services/roadmapWorker.js";
import { generateIntelligentTasks } from "./tasks.js";
import { EmbeddingService } from "../services/embedding.service.js";
import { LeetcodeService } from "../services/platform/leetcode.service.js";
import { CodeforcesService } from "../services/platform/codeforces.service.js";

const router = express.Router();

router.use(authenticate);

/**
 * 1. GET /api/profile
 * Retrieves complete placement profile, onboarding metadata, user state, and memory metrics
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      profile,
      userState,
      leetcode,
      codeforces,
      memoryCount,
    ] = await Promise.all([
      prisma.profiles.findUnique({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          email: true,
          city: true,
          age: true,
          onboarding: true,
          onboarding_completed: true,
          leetcodeUsername: true,
          codeforcesUsername: true,
          created_at: true,
        },
      }),
      prisma.user_state?.findUnique({
        where: { user_id: userId },
      }).catch(() => null),
      prisma.leetcodeProfile.findUnique({
        where: { userId },
      }).catch(() => null),
      prisma.codeforcesProfile.findUnique({
        where: { userId },
      }).catch(() => null),
      EmbeddingService.getEmbeddingCount(userId),
    ]);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Retrieve active roadmap if exists
    let activeRoadmap = null;
    if (userState?.active_roadmap_id) {
      activeRoadmap = await prisma.userRoadmap.findFirst({
        where: { id: userState.active_roadmap_id, userId },
        select: {
          id: true,
          title: true,
          careerGoal: true,
          generationStatus: true,
        },
      }).catch(() => null);
    }

    const payload = {
      profile,
      userState: userState || {
        streak: 0,
        mode: "progression",
        current_phase: "Foundation",
        active_roadmap_id: null,
      },
      activeRoadmap,
      platforms: {
        leetcode: leetcode || null,
        codeforces: CodeforcesService.formatProfile(codeforces),
      },
      memoryMetrics: {
        vectorsCount: memoryCount || 0,
        indexedSnippets: memoryCount || 0,
        semanticEngineActive: true,
      },
    };

    // Serialize BigInt safely
    return res.json({
      success: true,
      data: JSON.parse(
        JSON.stringify(payload, (_, v) =>
          typeof v === "bigint" ? Number(v) : v
        )
      ),
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return res.status(500).json({ error: "Failed to load placement profile" });
  }
});

/**
 * 2. PUT /api/profile
 * Updates placement profile, target role, target companies, primary language, and platform handles
 */
router.put("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      city,
      targetRole,
      targetCompanies,
      primaryLanguage,
      dailyTime,
      skillLevel,
      weakTopics,
      graduationYear,
      graduationBatch,
      college,
      shortTermGoal,
      leetcodeUsername,
      codeforcesUsername,
    } = req.body;

    const gradYear = graduationYear !== undefined ? graduationYear : graduationBatch;

    // Fetch existing profile to preserve unchanged fields
    const existing = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    const currentOnboarding =
      existing?.onboarding && typeof existing.onboarding === "object"
        ? existing.onboarding
        : {};

    const updatedOnboarding = {
      ...currentOnboarding,
      domain: targetRole || currentOnboarding.domain || "Software Development",
      careerPath: targetRole || currentOnboarding.careerPath || "Software Development Engineer (SDE)",
      targetCompanies: Array.isArray(targetCompanies)
        ? targetCompanies
        : typeof targetCompanies === "string"
          ? targetCompanies.split(",").map((c) => c.trim()).filter(Boolean)
          : currentOnboarding.targetCompanies || [],
      primaryLanguage: primaryLanguage !== undefined ? primaryLanguage : currentOnboarding.primaryLanguage,
      dailyTime: dailyTime !== undefined ? dailyTime : currentOnboarding.dailyTime,
      skillLevel: skillLevel !== undefined ? Number(skillLevel) : currentOnboarding.skillLevel,
      weakTopics: weakTopics !== undefined ? weakTopics : currentOnboarding.weakTopics,
      graduationYear: gradYear !== undefined ? gradYear : currentOnboarding.graduationYear,
      graduationBatch: gradYear !== undefined ? gradYear : (currentOnboarding.graduationBatch || currentOnboarding.graduationYear),
      college: college !== undefined ? college : currentOnboarding.college,
      shortTermGoal: shortTermGoal !== undefined ? shortTermGoal : currentOnboarding.shortTermGoal,
    };

    const updateData = {
      onboarding: updatedOnboarding,
    };

    if (fullName) updateData.full_name = fullName.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (leetcodeUsername !== undefined) updateData.leetcodeUsername = leetcodeUsername.trim() || null;
    if (codeforcesUsername !== undefined) updateData.codeforcesUsername = codeforcesUsername.trim() || null;

    const updated = await prisma.profiles.update({
      where: { id: userId },
      data: updateData,
    });

    // Re-index memory embedding asynchronously
    EmbeddingService.embedUserProfile(userId, updatedOnboarding).catch(console.error);

    // If platform handles were updated, trigger background sync
    if (leetcodeUsername && leetcodeUsername !== existing?.leetcodeUsername) {
      LeetcodeService.syncProfile(userId, leetcodeUsername.trim()).catch(() => {});
    }
    if (codeforcesUsername && codeforcesUsername !== existing?.codeforcesUsername) {
      CodeforcesService.syncProfile(userId, codeforcesUsername.trim()).catch(() => {});
    }

    return res.json({
      success: true,
      data: updated,
      message: "Placement profile updated and semantic memory re-indexed.",
    });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return res.status(500).json({ error: "Failed to update placement profile" });
  }
});

/**
 * 3. PUT /api/profile/onboarding
 * Fully automated placement kickstarter: saves onboarding, creates starter roadmap,
 * initializes daily tasks, generates pgvector embeddings, and syncs competitive platforms.
 */
router.put("/onboarding", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      education,
      currentStatus,
      domain,
      careerPath,
      shortTermGoal,
      skillLevel,
      dailyTime,
      targetCompanies,
      primaryLanguage,
      weakTopics,
      graduationYear,
      college,
      leetcodeUsername,
      codeforcesUsername,
    } = req.body;

    const resolvedRole = (careerPath || domain || shortTermGoal || "Software Development Engineer (SDE)").trim();

    const onboardingPayload = {
      education: education || "bachelors",
      currentStatus: currentStatus || "studying",
      domain: domain || resolvedRole,
      careerPath: resolvedRole,
      shortTermGoal: shortTermGoal || "Land a high-growth tech placement",
      skillLevel: Number(skillLevel) || 5,
      dailyTime: dailyTime || "2-3",
      targetCompanies: Array.isArray(targetCompanies)
        ? targetCompanies
        : typeof targetCompanies === "string"
          ? targetCompanies.split(",").map((c) => c.trim()).filter(Boolean)
          : ["Google", "Microsoft", "Amazon", "Atlassian"],
      primaryLanguage: primaryLanguage || "C++",
      weakTopics: weakTopics || [],
      graduationYear: graduationYear || "2026",
      college: college || "",
    };

    // 1. Update profiles table
    const profileUpdate = {
      onboarding_completed: true,
      onboarding: onboardingPayload,
    };
    if (leetcodeUsername) profileUpdate.leetcodeUsername = leetcodeUsername.trim();
    if (codeforcesUsername) profileUpdate.codeforcesUsername = codeforcesUsername.trim();

    const profile = await prisma.profiles.update({
      where: { id: userId },
      data: profileUpdate,
    });

    // 2. Embed user profile in pgvector asynchronously
    EmbeddingService.embedUserProfile(userId, onboardingPayload).catch(console.error);

    // 3. Initialize or update user_state
    let userState = await prisma.user_state?.findUnique({
      where: { user_id: userId },
    }).catch(() => null);

    if (!userState) {
      userState = await prisma.user_state?.create({
        data: {
          user_id: userId,
          mode: "progression",
          streak: 0,
          current_phase: "Foundation",
        },
      }).catch(() => null);
    }

    // 4. Auto-kickstart starter Roadmap if user does not already have one
    let starterRoadmap = null;
    const existingRoadmap = await prisma.userRoadmap.findFirst({
      where: { userId },
    }).catch(() => null);

    if (!existingRoadmap) {
      try {
        starterRoadmap = await prisma.userRoadmap.create({
          data: {
            userId,
            title: resolvedRole,
            careerGoal: resolvedRole,
            generationStatus: "pending",
          },
        });

        // Trigger AI background roadmap generation
        processRoadmap(starterRoadmap.id).catch(console.error);

        // Set as active roadmap
        await prisma.user_state?.update({
          where: { user_id: userId },
          data: { active_roadmap_id: starterRoadmap.id },
        }).catch(() => {});
      } catch (roadmapErr) {
        console.warn("Starter roadmap creation error:", roadmapErr.message);
      }
    }

    // 5. Auto-generate first day's actionable task protocol in daily_tasks
    try {
      const today = new Date().toISOString().split("T")[0];
      const initialTasks = await generateIntelligentTasks(userId);

      await prisma.daily_tasks?.upsert({
        where: { user_id_date: { user_id: userId, date: new Date(today) } },
        update: { tasks: initialTasks },
        create: {
          user_id: userId,
          date: new Date(today),
          tasks: initialTasks,
        },
      });
    } catch (taskErr) {
      console.warn("Initial task generation error:", taskErr.message);
    }

    // 6. Platform profile initial sync (non-blocking)
    if (leetcodeUsername) {
      LeetcodeService.syncProfile(userId, leetcodeUsername.trim()).catch(() => {});
    }
    if (codeforcesUsername) {
      CodeforcesService.syncProfile(userId, codeforcesUsername.trim()).catch(() => {});
    }

    return res.json({
      success: true,
      profile,
      roadmapId: starterRoadmap?.id || existingRoadmap?.id || null,
      message: "Placement workspace initialized. Roadmap & daily protocol active.",
    });
  } catch (err) {
    console.error("Onboarding Save Error:", err);
    return res.status(500).json({ error: "Failed to initialize onboarding workspace." });
  }
});

export default router;