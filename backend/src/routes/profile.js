import express from "express";
import prisma from "../lib/prisma.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

// ... the rest of your router.put code stays exactly the same

router.put("/onboarding", async (req, res) => {
  try {
    const {
      education, currentStatus, domain, careerPath, shortTermGoal, skillLevel, dailyTime,
    } = req.body;

    // 1. Changed to prisma.profiles.update
    // 2. Wrapped the data perfectly into your JSON column
    const profile = await prisma.profiles.update({
      where: {
        id: req.user.id, // Match the exact custom ID we generated
      },
      data: {
        onboarding_completed: true,
        onboarding: {
          education,
          currentStatus,
          domain,
          careerPath,
          shortTermGoal,
          skillLevel: Number(skillLevel),
          dailyTime,
        },
      },
    });

    res.json(profile);
  } catch (err) {
    console.error("Onboarding Save Error:", err);
    res.status(500).json({ error: "Failed to save onboarding" });
  }
});

export default router;