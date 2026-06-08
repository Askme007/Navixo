/**
 * dashboard.service.ts
 *
 * All Supabase data queries for the Dashboard.
 * Schema verified against actual PostgreSQL tables.
 *
 * KNOWN SCHEMA GAPS (Workaround Active):
 * `roadmap_steps` lacks `updated_at` column.
 * `getRecentActivity` orders by `step_order` to maintain UI stability without DB migrations.
 */

import { supabase } from "../supabaseClient";

export const dashboardService = {
  // ── Roadmap ─────────────────────────────────────────────────────

  async getLatestRoadmap(userId: string) {
    return supabase
      .from("user_roadmaps")
      .select("id, title, career_goal, generation_status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  },

  async getSavedRoadmaps(userId: string) {
    return supabase
      .from("user_roadmaps")
      .select("id, title, career_goal, generation_status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  // ── Progress ────────────────────────────────────────────────────

  async getRoadmapProgress(userId: string) {
    return supabase
      .from("roadmap_steps")
      .select("status, user_roadmaps!inner(user_id)")
      .eq("user_roadmaps.user_id", userId);
  },

  // ── Current Focus ───────────────────────────────────────────────

  async getCurrentFocusSteps(userId: string) {
    const { data: rm } = await supabase
      .from("user_roadmaps")
      .select("id")
      .eq("user_id", userId)
      .eq("generation_status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rm) return [];

    const { data: inProgress } = await supabase
      .from("roadmap_steps")
      .select(
        "id, title, description, level, duration, mentor_tip, step_order, status",
      )
      .eq("roadmap_id", rm.id)
      .eq("status", "in-progress")
      .order("step_order", { ascending: true })
      .limit(2);

    const { data: notStarted } = await supabase
      .from("roadmap_steps")
      .select(
        "id, title, description, level, duration, mentor_tip, step_order, status",
      )
      .eq("roadmap_id", rm.id)
      .eq("status", "not-started")
      .order("step_order", { ascending: true })
      .limit(3);

    return [...(inProgress ?? []), ...(notStarted ?? [])].slice(0, 3);
  },

  // ── Activity ────────────────────────────────────────────────────

  async getRecentActivity(userId: string) {
    return supabase
      .from("roadmap_steps")
      .select(
        "id, title, level, status, step_order, user_roadmaps!inner(user_id)",
      )
      .eq("user_roadmaps.user_id", userId)
      .eq("status", "done")
      .order("step_order", { ascending: false }) // Fallback proxy for recency
      .limit(5);
  },

  // ── Platform Profiles ────────────────────────────────────────────

  async getLeetcodeProfile(userId: string) {
    return supabase
      .from("leetcode_profiles")
      .select(
        "id, user_id, username, solved, easy, medium, hard, ranking, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  },

  async getCodeforcesProfile(userId: string) {
    return (
      supabase
        .from("codeforces_profiles")
        // FIX: Added first_name, last_name, avatar_url, title_photo_url, max_rank
        .select(
          "id, user_id, username, first_name, last_name, avatar_url, title_photo_url, rating, max_rating, rank, max_rank, contests, last_synced_at",
        )
        .eq("user_id", userId)
        .order("last_synced_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    );
  },
};
