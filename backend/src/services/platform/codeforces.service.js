import prisma from "../../lib/prisma.js";

export class CodeforcesService {
  static async syncProfile(userId, username) {
    // Fetch basic profile
    const infoRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    if (!infoRes.ok) {
      throw new Error("Unable to reach Codeforces API");
    }

    const info = await infoRes.json();

    if (
      info.status !== "OK" ||
      !info.result ||
      info.result.length === 0
    ) {
      throw new Error("Invalid Codeforces handle");
    }

    const user = info.result[0];

    // Fetch contest history
    const ratingRes = await fetch(
      `https://codeforces.com/api/user.rating?handle=${username}`
    );

    let contests = 0;

    if (ratingRes.ok) {
      const rating = await ratingRes.json();

      if (
        rating.status === "OK" &&
        Array.isArray(rating.result)
      ) {
        contests = rating.result.length;
      }
    }

    // Save or update profile
    const profile = await prisma.codeforcesProfile.upsert({
      where: {
        userId,
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
        userId,
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

    // Convert BigInt values before returning
    return JSON.parse(
      JSON.stringify(profile, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );
  }
}