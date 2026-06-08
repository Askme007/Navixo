import { Request, Response } from "express";
import { LeetcodeService } from "../services/platform/leetcode.service";

export const syncLeetcode = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const userId = req.user.id; // From JWT middleware

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const profile = await LeetcodeService.syncProfile(userId, username);
    return res.status(200).json({ profile });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Failed to sync LeetCode profile" });
  }
};
