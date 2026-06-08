// backend/src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables in backend. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

// ⚠️ ADMIN CLIENT: Bypasses RLS.
// Only use this inside secure backend services, never expose to the frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
