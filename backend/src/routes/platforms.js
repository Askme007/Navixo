import express from "express";
import prisma from "../lib/prisma.js";
import authenticate from "../middleware/auth.js";
import { LeetcodeService } from "../services/platform/leetcode.service.js";
import { CodeforcesService } from "../services/platform/codeforces.service.js";

const router = express.Router();

// Apply authentication middleware globally to all platform routes
router.use(authenticate);

/* ==========================================================================
   LEETCODE ROUTES
   ========================================================================== */

/* ---------------- GET LeetCode Profile ---------------- */
router.get("/leetcode", async (req, res) => {
  try {
    const profile = await prisma.leetcodeProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    res.json(
      JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint" ? Number(value) : value
        )
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch LeetCode profile" });
  }
});

/* ---------------- POST LeetCode Sync ---------------- */
router.post("/leetcode/sync", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const profile = await LeetcodeService.syncProfile(req.user.id, username);

    res.json(
      JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint" ? Number(value) : value
        )
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


/* ==========================================================================
   CODEFORCES ROUTES
   ========================================================================== */

/* ---------------- GET Codeforces Profile ---------------- */
// Supports both initial load layout variations: /codeforces OR /codeforces/profile
router.get(["/codeforces", "/codeforces/profile"], async (req, res) => {
  try {
    const profile = await CodeforcesService.getProfile(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ error: "No Codeforces profile connected yet" });
    }
    
    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to retrieve platform data" });
  }
});

/* ---------------- POST Codeforces Sync/Connect ---------------- */
// Supports both action submission variants: /codeforces OR /codeforces/sync
router.post(["/codeforces", "/codeforces/sync"], async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Handle required" });
    }

    // Delegate execution to our robust service layer
    const profile = await CodeforcesService.syncProfile(req.user.id, username);

    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;