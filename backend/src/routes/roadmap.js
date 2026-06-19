// backend/src/routes/roadmap.js

import express from "express";
import authenticateToken from '../middleware/auth.js';
import authenticate from "../middleware/auth.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import {
  generateRoadmap,
  getRoadmap,
  updateStepStatus,
  retryRoadmap,
  saveRoadmap,
  getRoadmapHistory,
} from "../controllers/roadmapController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All roadmap routes require authentication
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
| Get Roadmap
|--------------------------------------------------------------------------
*/

router.get("/:roadmapId", getRoadmap);

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
| Update Step Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/steps/:stepId/status",
  updateStepStatus
);

// DELETE /api/roadmaps/:id
// DELETE /api/roadmap/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user.id;

    // 1. Delete all attached steps FIRST to prevent SQL constraint errors
    await prisma.roadmapStep.deleteMany({
      where: { roadmapId: roadmapId }
    });

    // 2. Now delete the actual roadmap safely
    await prisma.userRoadmap.delete({
      where: { 
        id: roadmapId,
        userId: userId // Security check so users can't delete other people's roadmaps
      }
    });

    res.json({ success: true, message: "Roadmap deleted" });
  } catch (error) {
    console.error("Failed to delete roadmap:", error);
    res.status(500).json({ error: "Failed to delete roadmap" });
  }
});

export default router;