import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// 1. GET /api/tasks/today -> Fetch or Generate Morning Draft
router.get("/today", async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const { data: checkinRecord, error: checkErr } = await supabase
      .from("task_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (checkErr) throw checkErr;
    const isCheckedIn = !!checkinRecord;

    const { data: existingTasks, error: taskErr } = await supabase
      .from("daily_tasks")
      .select("tasks")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (taskErr) throw taskErr;

    if (existingTasks) {
      return res.json({
        success: true,
        data: existingTasks.tasks,
        isCheckedIn,
      });
    }

    let { data: state, error: stateErr } = await supabase
      .from("user_state")
      .select("current_phase, mode")
      .eq("user_id", userId)
      .maybeSingle();

    if (stateErr) throw stateErr;
    if (!state) state = { current_phase: "Foundation", mode: "progression" };

    let dailyLoad =
      state.mode === "recovery"
        ? [
            {
              id: `dsa-${Date.now()}-rec1`,
              title: "Review 1 Easy Array problem",
              category: "DSA",
              completed: false,
            },
            {
              id: `dev-${Date.now()}-rec2`,
              title: "Read architecture documentation",
              category: "Development",
              completed: false,
            },
          ]
        : [
            {
              id: `dsa-${Date.now()}-1`,
              title: "Solve 2 Medium DP constraints",
              category: "DSA",
              completed: false,
            },
            {
              id: `dev-${Date.now()}-2`,
              title: "Implement JWT Auth Middleware",
              category: "Development",
              completed: false,
            },
            {
              id: `cs-${Date.now()}-3`,
              title: "Review OS Process Scheduling",
              category: "Core CS",
              completed: false,
            },
          ];

    const { error: insertErr } = await supabase
      .from("daily_tasks")
      .insert([{ user_id: userId, date: today, tasks: dailyLoad }]);

    if (insertErr) throw insertErr;

    res.json({ success: true, data: dailyLoad, isCheckedIn });
  } catch (err) {
    console.error("GET /today Error:", err);
    res.status(500).json({ error: "Failed to generate daily load." });
  }
});

// 2. PUT /api/tasks/today -> Auto-Save Draft Edits
router.put("/today", async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];
    const { tasks } = req.body;

    const { error } = await supabase
      .from("daily_tasks")
      .update({ tasks })
      .eq("user_id", userId)
      .eq("date", today);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /today Error:", err);
    res.status(500).json({ error: "Failed to sync draft." });
  }
});

// 3. POST /api/tasks/checkin -> Final Lock
router.post("/checkin", async (req, res) => {
  try {
    const userId = req.user.id;
    const { completionRate, completedTasks, notes } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // ABSOLUTE TRUTH CHECK
    const { data: existingCheckin, error: checkinErr } = await supabase
      .from("task_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (checkinErr) throw checkinErr;
    if (existingCheckin) {
      return res
        .status(400)
        .json({ error: "Execution already locked for today." });
    }

    let { data: state, error: stateErr } = await supabase
      .from("user_state")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (stateErr) throw stateErr;

    if (!state) {
      const { data: newState, error: insertErr } = await supabase
        .from("user_state")
        .insert([
          {
            user_id: userId,
            streak: 0,
            mode: "progression",
            current_phase: "Foundation",
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;
      state = newState;
    }

    let newStreak = state.streak;
    let newMode = state.mode;
    let consecutiveSkips = state.consecutive_skips;

    if (state.last_checkin_date && state.last_checkin_date !== today) {
      const diffDays = Math.ceil(
        Math.abs(new Date(today) - new Date(state.last_checkin_date)) /
          (1000 * 60 * 60 * 24),
      );
      if (diffDays > 1) {
        consecutiveSkips += diffDays - 1;
        newStreak = 0;
        if (consecutiveSkips >= 2) newMode = "recovery";
      } else {
        consecutiveSkips = 0;
        if (completionRate >= 50) newStreak += 1;
        if (newStreak >= 3) newMode = "progression";
      }
    } else if (!state.last_checkin_date) {
      if (completionRate >= 50) newStreak += 1;
    }

    const updates = await Promise.all([
      supabase
        .from("user_state")
        .update({
          streak: newStreak,
          last_checkin_date: today,
          consecutive_skips: consecutiveSkips,
          mode: newMode,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId),
      supabase.from("task_checkins").insert([
        {
          user_id: userId,
          date: today,
          tasks_completed: completedTasks || [],
          completion_rate: completionRate,
          notes: notes || "",
        },
      ]),
      supabase.from("execution_history").insert([
        {
          user_id: userId,
          date: today,
          phase: state.current_phase,
          streak_at_time: newStreak,
          mode_at_time: newMode,
          completion_rate: completionRate,
        },
      ]),
    ]);

    for (const update of updates) {
      if (update.error) throw update.error;
    }

    res.json({
      success: true,
      message: "Telemetry logged.",
      data: { streak: newStreak, mode: newMode, completionRate },
    });
  } catch (err) {
    console.error("POST /checkin Error:", err);
    res.status(500).json({ error: "Failed to process execution data." });
  }
});

export default router;
