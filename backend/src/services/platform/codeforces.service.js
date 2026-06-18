import prisma from "../../lib/prisma.js";

export class CodeforcesService {
  static async syncProfile(userId, username) {
    // 1. Fetch basic profile from Codeforces
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

    // 2. Fetch contest history length
    const ratingRes = await fetch(
      `https://codeforces.com/api/user.rating?handle=${username}`
    );

    let contests = 0;
    if (ratingRes.ok) {
      const rating = await ratingRes.json();
      if (rating.status === "OK" && Array.isArray(rating.result)) {
        contests = rating.result.length;
      }
    }

    // 3. Compute structural helpers for frontend compatibility
    const realName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const avatar = user.titlePhoto || user.avatar || null;

    // 4. Save or update profile data in database
    const profile = await prisma.codeforcesProfile.upsert({
      where: {
        userId,
      },
      update: {
        username: user.handle,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        avatarUrl: avatar,
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
        avatarUrl: avatar,
        titlePhotoUrl: user.titlePhoto ?? null,
        rating: user.rating ?? 0,
        maxRating: user.maxRating ?? 0,
        rank: user.rank ?? "unrated",
        maxRank: user.maxRank ?? "unrated",
        contests,
      },
    });

    // 5. Return a sanitized object with both naming variants to guarantee frontend compatibility
    const responsePayload = {
      ...profile,
      realName: realName || null,
      fullName: realName || null,
      max_rating: profile.maxRating,
      avatar_url: profile.avatarUrl,
    };

    // Convert BigInt values cleanly before returning over Express JSON channels
    return JSON.parse(
      JSON.stringify(responsePayload, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );
  }

  // 📍 NEW METHOD: Fetches saved profile details on dashboard initial load
  static async getProfile(userId) {
    const profile = await prisma.codeforcesProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    const realName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

    const responsePayload = {
      ...profile,
      realName: realName || null,
      fullName: realName || null,
      max_rating: profile.maxRating,
      avatar_url: profile.avatarUrl,
    };

    return JSON.parse(
      JSON.stringify(responsePayload, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );
  }
}