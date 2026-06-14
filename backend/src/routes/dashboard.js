import express from "express";
import authenticate from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getDashboard);

export default router;