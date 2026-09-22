import { LeetcodeService } from "../services/platform/leetcode.service.js";

export async function syncLeetcode(req, res) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.json({
        success: false,
        error: "Username is required",
      });
    }

    const profile = await LeetcodeService.syncProfile(
      req.user.id,
      username
    );

    res.json({ success: true, ...profile });  
  } catch (err) {
    console.warn("LeetCode sync notice:", err.message);

    res.json({
      success: false,
      error: err.message || "Failed to sync LeetCode profile",
    });
  }
}