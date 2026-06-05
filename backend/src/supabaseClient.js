// backend/src/supabaseClient.js

import dotenv from "dotenv";
dotenv.config(); // 🔥 Most important line in whole backend

import { createClient } from "@supabase/supabase-js";

// env must be loaded before accessing them
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: Missing Supabase environment variables.");
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
