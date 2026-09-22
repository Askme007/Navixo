// backend/src/routes/roadmap.js

import express from "express";
import authenticate, { optionalAuthenticate } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";
import { isValidUUID } from "../utils/uuid.js";
import {
  generateRoadmap,
  getRoadmap,
  updateStepStatus,
  retryRoadmap,
  saveRoadmap,
  setActiveRoadmap,
  getRoadmapHistory,
  toggleRoadmapVisibility,
} from "../controllers/roadmapController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public / Shared Roadmap View (Optional Auth)
|--------------------------------------------------------------------------
*/

router.get("/:roadmapId", optionalAuthenticate, getRoadmap);

/*
|--------------------------------------------------------------------------
| All following roadmap routes require authentication
|--------------------------------------------------------------------------
*/

router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Generate Roadmap
|--------------------------------------------------------------------------
*/

router.post("/generate", generateRoadmap);

/*
|--------------------------------------------------------------------------
| Saved Roadmap History
|--------------------------------------------------------------------------
*/

router.get("/history", getRoadmapHistory);

/*
|--------------------------------------------------------------------------
| Retry Generation
|--------------------------------------------------------------------------
*/

router.post("/:roadmapId/retry", retryRoadmap);

/*
|--------------------------------------------------------------------------
| Save Snapshot
|--------------------------------------------------------------------------
*/

router.post("/:roadmapId/save", saveRoadmap);

/*
|--------------------------------------------------------------------------
| Set Active Roadmap
|--------------------------------------------------------------------------
*/

router.post("/:roadmapId/activate", setActiveRoadmap);

/*
|--------------------------------------------------------------------------
| Toggle Public Link Sharing (Owner Only)
|--------------------------------------------------------------------------
*/

router.patch("/:roadmapId/visibility", toggleRoadmapVisibility);

/*
|--------------------------------------------------------------------------
| Update Step Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/steps/:stepId/status",
  updateStepStatus
);

// DELETE /api/roadmap/:id
router.delete('/:id', async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    if (!isValidUUID(roadmapId)) {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }

    // Verify ownership before deleting
    const roadmap = await prisma.userRoadmap.findFirst({
      where: {
        id: roadmapId,
        userId,
      },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }

    // Cascade delete in strict order to avoid foreign key constraint errors
    await prisma.$transaction(async (tx) => {
      // 1. Delete all attached step resources first
      await tx.stepResource.deleteMany({
        where: {
          step: {
            roadmapId,
          },
        },
      });

      // 2. Delete all attached steps
      await tx.roadmapStep.deleteMany({
        where: {
          roadmapId,
        },
      });

      // 3. Now delete the actual roadmap record
      await tx.userRoadmap.delete({
        where: {
          id: roadmapId,
        },
      });

      // 4. Nullify active_roadmap_id if the deleted roadmap was currently active
      try {
        await tx.user_state?.updateMany({
          where: { user_id: userId, active_roadmap_id: roadmapId },
          data: { active_roadmap_id: null },
        });
      } catch {
        try {
          await tx.$executeRawUnsafe(
            `UPDATE "user_state" SET active_roadmap_id = NULL WHERE user_id = $1::uuid AND active_roadmap_id = $2::uuid`,
            userId,
            roadmapId
          );
        } catch {
          // Non-fatal
        }
      }
    });

    res.json({ success: true, message: "Roadmap deleted" });
  } catch (error) {
    if (error.code === 'P2023') {
      return res.status(404).json({ error: "Roadmap not found or unauthorized." });
    }
    console.error("Failed to delete roadmap:", error);
    res.status(500).json({ error: "Failed to delete roadmap" });
  }
});

export default router;