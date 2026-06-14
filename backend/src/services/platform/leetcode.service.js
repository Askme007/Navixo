import prisma from "../../lib/prisma.js";

export class LeetcodeService {
  static async syncProfile(userId, username) {
    // Fetch profile
    const profileRes = await fetch(
      `https://alfa-leetcode-api.onrender.com/userProfile/${username}`
    );

    if (!profileRes.ok) {
      throw new Error("Unable to fetch LeetCode profile");
    }

    const profileData = await profileRes.json();

    // Fetch solved stats
    const solvedRes = await fetch(
      `https://alfa-leetcode-api.onrender.com/${username}/solved`
    );

    if (!solvedRes.ok) {
      throw new Error("Unable to fetch LeetCode solved stats");
    }

    const solvedData = await solvedRes.json();

    const profile = await prisma.leetcodeProfile.upsert({
      where: {
        userId,
      },
      update: {
        username,
        solved:
          solvedData.solvedProblem ??
          solvedData.totalSolved ??
          0,
        easy:
          solvedData.easySolved ??
          0,
        medium:
          solvedData.mediumSolved ??
          0,
        hard:
          solvedData.hardSolved ??
          0,
        ranking:
          profileData.ranking ??
          0,
      },
      create: {
        userId,
        username,
        solved:
          solvedData.solvedProblem ??
          solvedData.totalSolved ??
          0,
        easy:
          solvedData.easySolved ??
          0,
        medium:
          solvedData.mediumSolved ??
          0,
        hard:
          solvedData.hardSolved ??
          0,
        ranking:
          profileData.ranking ??
          0,
      },
    });

    return profile;
  }
}