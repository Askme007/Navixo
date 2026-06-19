// backend/src/controllers/roadmapController.js

import { prisma } from "../config/prisma.js";
import { processRoadmap } from "../services/roadmapWorker.js";

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
    const userId = req.user.id;

    const roadmap = await prisma.userRoadmap.findFirst({
      where: {
        id: roadmapId,
        userId,
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

    return res.json(roadmap);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch roadmap." });
  }
}

export async function updateStepStatus(req, res) {
  try {
    const { stepId } = req.params;
    const { status } = req.body;

    if (!["not-started", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    const step = await prisma.roadmapStep.update({
      where: { id: stepId },
      data: { status },
    });

    return res.json(step);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update status." });
  }
}

export async function retryRoadmap(req, res) {
  try {
    const { roadmapId } = req.params;

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
    console.error(err);
    return res.status(500).json({ error: "Retry failed." });
  }
}

export async function saveRoadmap(req, res) {
  try {
    const userId = req.user.id;
    const { roadmapId } = req.params;

    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id: roadmapId, userId },
      include: {
        steps: {
          include: {
            resources: true,
          },
          orderBy: {
            stepOrder: "asc",
          },
        },
      },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    const snapshot = await prisma.$transaction(async (tx) => {
      const newRoadmap = await tx.userRoadmap.create({
        data: {
          userId,
          title: roadmap.title,
          careerGoal: roadmap.careerGoal,
          generationStatus: roadmap.generationStatus,
          generationError: roadmap.generationError,
          generationStartedAt: roadmap.generationStartedAt,
          generationFinishedAt: roadmap.generationFinishedAt,
        },
      });

      for (const step of roadmap.steps) {
        const newStep = await tx.roadmapStep.create({
          data: {
            roadmapId: newRoadmap.id,
            stepOrder: step.stepOrder,
            title: step.title,
            description: step.description,
            level: step.level,
            duration: step.duration,
            mentorTip: step.mentorTip,
            status: step.status,
          },
        });

        if (step.resources.length) {
          await tx.stepResource.createMany({
            data: step.resources.map(r => ({
              stepId: newStep.id,
              type: r.type,
              title: r.title,
              provider: r.provider,
              url: r.url,
            })),
          });
        }
      }

      return newRoadmap;
    });

    return res.json({ roadmapId: snapshot.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Save failed." });
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
