import express from "express";
import prisma from "../lib/prisma.js";
import authenticate from "../middleware/auth.js";
import { LeetcodeService } from "../services/platform/leetcode.service.js";

const router = express.Router();

router.use(authenticate);

/* ---------------- GET LeetCode ---------------- */

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
          typeof value === "bigint"
            ? Number(value)
            : value
        )
      )
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch LeetCode profile",
    });
  }
});

/* ---------------- GET Codeforces ---------------- */

router.get("/codeforces", async (req, res) => {
  try {
    const profile = await prisma.codeforcesProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    res.json(
      JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint"
            ? Number(value)
            : value
        )
      )
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch Codeforces profile",
    });
  }
});

/* ---------------- POST LeetCode Sync ---------------- */

router.post("/leetcode/sync", async (req, res) => {
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

    res.json(
      JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint"
            ? Number(value)
            : value
        )
      )
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- POST Codeforces Sync ---------------- */

router.post("/codeforces/sync", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: "Handle required",
      });
    }

    const infoRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    const info = await infoRes.json();

    if (info.status !== "OK") {
      return res.status(400).json({
        error: "Invalid Codeforces handle",
      });
    }

    const user = info.result[0];

    const ratingRes = await fetch(
      `https://codeforces.com/api/user.rating?handle=${username}`
    );

    const rating = await ratingRes.json();

    const contests =
      rating.status === "OK"
        ? rating.result.length
        : 0;

    const profile =
      await prisma.codeforcesProfile.upsert({
        where: {
          userId: req.user.id,
        },
        update: {
          username: user.handle,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          avatarUrl: user.avatar ?? null,
          titlePhotoUrl: user.titlePhoto ?? null,
          rating: user.rating ?? 0,
          maxRating: user.maxRating ?? 0,
          rank: user.rank ?? "unrated",
          maxRank: user.maxRank ?? "unrated",
          contests,
        },
        create: {
          userId: req.user.id,
          username: user.handle,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          avatarUrl: user.avatar ?? null,
          titlePhotoUrl: user.titlePhoto ?? null,
          rating: user.rating ?? 0,
          maxRating: user.maxRating ?? 0,
          rank: user.rank ?? "unrated",
          maxRank: user.maxRank ?? "unrated",
          contests,
        },
      });

    res.json(
      JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint"
            ? Number(value)
            : value
        )
      )
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;