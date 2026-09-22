import { CodeforcesService } from "../services/platform/codeforces.service.js";

export async function syncCodeforces(req, res) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.json({
        success: false,
        error: "Codeforces handle is required",
      });
    }

    const profile = await CodeforcesService.syncProfile(
      req.user.id,
      username
    );

    res.json({ success: true, ...profile });
  } catch (err) {
    console.warn("Codeforces sync notice:", err.message);

    res.json({
      success: false,
      error: err.message || "Failed to sync Codeforces profile",
    });
  }
}