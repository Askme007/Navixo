import { Request, Response } from "express";
import { CodeforcesService } from "../services/platform/codeforces.service";

export const syncCodeforces = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({ error: "Codeforces handle is required" });
    }

    const profile = await CodeforcesService.syncProfile(userId, username);
    return res.status(200).json({ profile });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Failed to sync Codeforces profile" });
  }
};
