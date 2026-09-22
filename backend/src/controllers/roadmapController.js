// backend/src/controllers/roadmapController.js

import { prisma } from "../config/prisma.js";
import { processRoadmap } from "../services/roadmapWorker.js";
import { isValidUUID } from "../utils/uuid.js";

export async function generateRoadmap(req, res) {
  try {
    const userId = req.user.id;
    const { career } = req.body;

    if (!career?.trim()) {
      return res.status(400).json({ error: "Career is required." });
    }

    const roadmap = await prisma.userRoadmap.create({
      data: {
        userId,
        title: career.trim(),
        careerGoal: career.trim(),
        generationStatus: "pending",
      },
    });

    processRoadmap(roadmap.id).catch(console.error);

    return res.status(201).json({
      roadmapId: roadmap.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate roadmap." });
  }
}

export async function getRoadmap(req, res) {
  try {
    const { roadmapId } = req.params;
    const userId = req.user?.id;

    if (!isValidUUID(roadmapId)) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    const roadmap = await prisma.userRoadmap.findFirst({
      where: {
        id: roadmapId,
      },
      include: {
        steps: {
          orderBy: {
            stepOrder: "asc",
          },
          include: {
            resources: true,
          },
        },
      },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    const isOwner = Boolean(userId && roadmap.userId === userId);

    // Retrieve is_public flag from PostgreSQL
    let isPublic = false;
    try {
      const pubRows = await prisma.$queryRawUnsafe(
        `SELECT is_public FROM "user_roadmaps" WHERE id = $1::uuid LIMIT 1`,
        roadmapId
      );
      isPublic = Boolean(pubRows?.[0]?.is_public);
    } catch {
      isPublic = Boolean(roadmap.is_public ?? roadmap.isPublic);
    }

    // Plan B: Roadmaps are private by default.
    // If visitor is NOT the owner and link sharing is NOT public, block with 404
    if (!isOwner && !isPublic) {
      return res.status(404).json({
        error: "This roadmap is private.",
        isPrivate: true,
      });
    }

    let isActive = false;
    if (isOwner) {
      try {
        const userState = await prisma.user_state?.findUnique({
          where: { user_id: userId },
        });

        if (userState?.active_roadmap_id) {
          isActive = userState.active_roadmap_id === roadmapId;
        } else {
          const latest = await prisma.userRoadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          });
          isActive = latest?.id === roadmapId;
        }
      } catch {
        try {
          const rows = await prisma.$queryRawUnsafe(
            `SELECT active_roadmap_id FROM "user_state" WHERE user_id = $1::uuid LIMIT 1`,
            userId
          );
          if (rows?.[0]?.active_roadmap_id) {
            isActive = rows[0].active_roadmap_id === roadmapId;
          } else {
            const latest = await prisma.userRoadmap.findFirst({
              where: { userId },
              orderBy: { createdAt: "desc" },
              select: { id: true },
            });
            isActive = latest?.id === roadmapId;
          }
        } catch {
          // Non-fatal fallback
        }
      }
    }

    return res.json({ ...roadmap, isPublic, isActive, isOwner });
  } catch (err) {
    if (err.code === "P2023") {
      return res.status(404).json({ error: "Roadmap not found." });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch roadmap." });
  }
}

export async function updateStepStatus(req, res) {
  try {
    const userId = req.user.id;
    const { stepId } = req.params;
    const { status } = req.body;

    if (!isValidUUID(stepId)) {
      return res.status(404).json({ error: "Roadmap step not found or unauthorized." });
    }

    if (!["not-started", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    // Security check: verify the step belongs to a roadmap owned by the requesting user
    const step = await prisma.roadmapStep.findFirst({
      where: {
        id: stepId,
        roadmap: {
          userId,
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: "Roadmap step not found or unauthorized." });
    }

    const updated = await prisma.roadmapStep.update({
      where: { id: stepId },
      data: { status },
    });

    return res.json(updated);
  } catch (err) {
    if (err.code === "P2023") {
      return res.status(404).json({ error: "Roadmap step not found or unauthorized." });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to update status." });
  }
}

export async function retryRoadmap(req, res) {
  try {
    const { roadmapId } = req.params;

    if (!isValidUUID(roadmapId)) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    await prisma.userRoadmap.update({
      where: { id: roadmapId },
      data: {
        generationStatus: "pending",
        generationError: null,
        generationStartedAt: null,
        generationFinishedAt: null,
      },
    });

    processRoadmap(roadmapId).catch(console.error);

    return res.json({ success: true });
  } catch (err) {
    if (err.code === "P2023") {
      return res.status(404).json({ error: "Roadmap not found." });
    }
    console.error(err);
    return res.status(500).json({ error: "Retry failed." });
  }
}

export async function saveRoadmap(req, res) {
  try {
    const userId = req.user.id;
    const { roadmapId } = req.params;

    if (!isValidUUID(roadmapId)) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id: roadmapId, userId },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    // Roadmap is already persisted in user_roadmaps; confirm save without creating duplicate clones
    return res.json({
      success: true,
      message: "Roadmap saved successfully.",
      roadmapId: roadmap.id,
    });
  } catch (err) {
    if (err.code === "P2023") {
      return res.status(404).json({ error: "Roadmap not found." });
    }
    console.error(err);
    return res.status(500).json({ error: "Save failed." });
  }
}

export async function setActiveRoadmap(req, res) {
  try {
    const userId = req.user.id;
    const { roadmapId } = req.params;

    if (!isValidUUID(roadmapId)) {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }

    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id: roadmapId, userId },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }

    try {
      await prisma.user_state.upsert({
        where: { user_id: userId },
        update: { active_roadmap_id: roadmapId, updated_at: new Date() },
        create: { user_id: userId, active_roadmap_id: roadmapId },
      });
    } catch (dbErr) {
      console.warn("Prisma upsert fallback to raw SQL:", dbErr.message);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "user_state" (user_id, active_roadmap_id, updated_at)
         VALUES ($1::uuid, $2::uuid, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET active_roadmap_id = EXCLUDED.active_roadmap_id, updated_at = NOW()`,
        userId,
        roadmapId
      );
    }

    return res.json({
      success: true,
      message: "Active roadmap updated successfully.",
      activeRoadmapId: roadmap.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to set active roadmap." });
  }
}

export async function getRoadmapHistory(req, res) {
  try {
    const userId = req.user.id;

    const history = await prisma.userRoadmap.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            steps: true,
          },
        },
      },
    });

    return res.json(history);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load history." });
  }
}

export async function toggleRoadmapVisibility(req, res) {
  try {
    const userId = req.user.id;
    const { roadmapId } = req.params;
    const { isPublic } = req.body;

    if (!isValidUUID(roadmapId)) {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }

    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id: roadmapId, userId },
      select: { id: true },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }

    let nextIsPublic = typeof isPublic === "boolean" ? isPublic : true;
    if (typeof isPublic !== "boolean") {
      const current = await prisma.$queryRawUnsafe(
        `SELECT is_public FROM "user_roadmaps" WHERE id = $1::uuid LIMIT 1`,
        roadmapId
      );
      nextIsPublic = !Boolean(current?.[0]?.is_public);
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "user_roadmaps" SET is_public = $1 WHERE id = $2::uuid`,
      nextIsPublic,
      roadmapId
    );

    return res.json({
      success: true,
      isPublic: nextIsPublic,
      message: nextIsPublic
        ? "Roadmap is now public. Anyone with the link can view."
        : "Roadmap is now private. Only you can view.",
    });
  } catch (err) {
    if (err.code === "P2023") {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }
    console.error("Failed to toggle visibility:", err);
    return res.status(500).json({ error: "Failed to update roadmap visibility." });
  }
}

