import { supabaseAdmin } from "../../config/supabase";

export class LeetcodeService {
  static async syncProfile(userId: string, username: string) {
    const response = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}`,
    );
    const stats = await response.json();

    if (stats.status !== "success" || !stats.totalSolved) {
      throw new Error("Invalid LeetCode username or API unavailable");
    }

    const { data, error } = await supabaseAdmin
      .from("leetcode_profiles")
      .upsert(
        {
          user_id: userId,
          username: username,
          solved: stats.totalSolved,
          easy: stats.easySolved,
          medium: stats.mediumSolved,
          hard: stats.hardSolved,
          ranking: stats.ranking,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) throw new Error("Database insertion failed");
    return data;
  }
}
