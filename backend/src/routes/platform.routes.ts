import { Router } from "express";
import { syncLeetcode } from "../controllers/leetcode.controller";
import { syncCodeforces } from "../controllers/codeforces.controller";
import { requireAuth } from "../middleware/auth.middleware"; // Presumed JWT middleware

const router = Router();

// POST /api/platforms/leetcode/sync
router.post("/leetcode/sync", requireAuth, syncLeetcode);

// POST /api/platforms/codeforces/sync
router.post("/codeforces/sync", requireAuth, syncCodeforces);

export default router;
