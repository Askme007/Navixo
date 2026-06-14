import { LeetcodeService } from "../services/platform/leetcode.service.js";

export async function syncLeetcode(req, res) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: "Username is required",
      });
    }

    const profile = await LeetcodeService.syncProfile(
      req.user.id,
      username
    );

    res.json(profile);  
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message || "Failed to sync LeetCode profile",
    });
  }
}