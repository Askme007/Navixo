import { supabaseAdmin } from "../../config/supabase";

export class CodeforcesService {
  static async syncProfile(userId: string, username: string) {
    // 1. Fetch User Info
    const infoResponse = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`,
    );
    const infoData = await infoResponse.json();

    if (
      infoData.status !== "OK" ||
      !infoData.result ||
      infoData.result.length === 0
    ) {
      throw new Error("Invalid Codeforces handle");
    }

    const u = infoData.result[0];

    // 2. Fetch Contest History (to get actual contest count)
    const ratingResponse = await fetch(
      `https://codeforces.com/api/user.rating?handle=${username}`,
    );
    const ratingData = await ratingResponse.json();

    const contestsCount =
      ratingData.status === "OK" ? ratingData.result.length : 0;

    // 3. Upsert into PostgreSQL with all new columns
    const { data: profileData, error } = await supabaseAdmin
      .from("codeforces_profiles")
      .upsert(
        {
          user_id: userId,
          username: u.handle,
          first_name: u.firstName ?? null,
          last_name: u.lastName ?? null,
          avatar_url: u.avatar ?? null,
          title_photo_url: u.titlePhoto ?? null,
          rating: u.rating ?? 0,
          max_rating: u.maxRating ?? 0,
          rank: u.rank ?? "unrated",
          max_rank: u.maxRank ?? "unrated",
          contests: contestsCount,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase Upsert Error:", error);
      throw new Error("Database insertion failed");
    }

    return profileData;
  }
}
