import express from "express";
import authenticate from "../middleware/auth.js";
import { syncLeetcode } from "../controllers/leetcode.controller.js";
import { syncCodeforces } from "../controllers/codeforces.controller.js";

const router = express.Router();

router.post("/leetcode/sync", authenticate, syncLeetcode);

router.post("/codeforces/sync", authenticate, syncCodeforces);

export default router;