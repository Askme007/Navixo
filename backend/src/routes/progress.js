import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/history", async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the 30 NEWEST days of execution history
    const { data, error } = await supabase
      .from("execution_history")
      .select("date, completion_rate, mode_at_time, streak_at_time")
      .eq("user_id", userId)
      .order("date", { ascending: false }) // 👈 FIX: Descending order grabs the latest records
      .limit(30);

    if (error) throw error;

    // If no data exists, generate a safe zero-state response
    if (!data || data.length === 0) {
      return res.json({
        metrics: { currentStreak: 0, longestStreak: 0, avgCompletion: 0 },
        trend: [],
        isEmpty: true,
      });
    }

    // 👈 FIX: Reverse the array so the chart displays left-to-right (past to present)
    const chronologicalData = data.reverse();

    // Calculate metrics based on the properly sorted array
    const currentStreak =
      chronologicalData[chronologicalData.length - 1]?.streak_at_time || 0;
    const longestStreak = Math.max(
      ...chronologicalData.map((d) => d.streak_at_time || 0),
    );
    const avgCompletion =
      chronologicalData.reduce(
        (acc, curr) => acc + Number(curr.completion_rate),
        0,
      ) / chronologicalData.length;

    res.json({
      metrics: {
        currentStreak,
        longestStreak,
        avgCompletion: Number(avgCompletion.toFixed(1)),
      },
      trend: chronologicalData.map((d) => ({
        date: d.date,
        completionRate: Number(d.completion_rate),
        mode: d.mode_at_time,
      })),
      isEmpty: false,
    });
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve execution telemetry." });
  }
});

export default router;
