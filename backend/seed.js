import dotenv from "dotenv";
dotenv.config();
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  },
);

async function seedTelemetry() {
  console.log("Initiating telemetry backfill sequence...");

  // CHANGE THIS TO YOUR EXACT LOGIN EMAIL
  const targetEmail = "vrai5216@gmail.com";

  const { data: users, error: userError } =
    await supabase.auth.admin.listUsers();

  if (userError || !users.users.length) {
    console.error("Critical Failure: No users found.");
    return;
  }

  // Find the exact user by email
  const targetUser = users.users.find((u) => u.email === targetEmail);

  if (!targetUser) {
    console.error(
      `Could not find user with email: ${targetEmail}. Please check the email string.`,
    );
    return;
  }

  const userId = targetUser.id;
  console.log(`Target locked: ${targetEmail} (ID: ${userId})`);

  const historyPayload = [];
  let currentStreak = 0;
  let currentMode = "progression";

  // Generate 30 days of history (stopping at yesterday, so we don't overwrite your real check-in today)
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const isSkipDay = Math.random() > 0.85;
    let completionRate = 0;

    if (!isSkipDay) {
      completionRate = Math.floor(Math.random() * (100 - 50 + 1) + 50);
      currentStreak += 1;
      if (currentStreak >= 3) currentMode = "progression";
    } else {
      currentStreak = 0;
      currentMode = "recovery";
    }

    historyPayload.push({
      user_id: userId,
      date: dateString,
      phase: "Development",
      streak_at_time: currentStreak,
      mode_at_time: currentMode,
      completion_rate: completionRate,
    });
  }

  console.log("Writing execution_history...");
  const { error: historyError } = await supabase
    .from("execution_history")
    .upsert(historyPayload, { onConflict: "user_id, date" });

  if (historyError) {
    console.error("Telemetry injection failed:", historyError.message);
    return;
  }

  console.log("Backfill complete. Refresh your frontend.");
}

seedTelemetry();
