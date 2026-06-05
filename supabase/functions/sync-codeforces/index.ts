import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    if (!username) throw "Missing username";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw "Missing auth header";

    const token = authHeader.replace("Bearer ", "");

    // 🔐 VERIFY USER WITH ANON KEY
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: authData, error: authError } =
      await authClient.auth.getUser();

    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = authData.user.id;

    // 🛠 SERVICE ROLE FOR DB WRITE
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cfRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    const cf = await cfRes.json();

    if (cf.status !== "OK") {
      return new Response(
        JSON.stringify({ error: "Invalid Codeforces username" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const u = cf.result[0];

    const profile = {
  user_id: userId,
  username,
  rating: u.rating || 0,
  max_rating: u.maxRating || 0,
  rank: u.rank || "unrated",
  contests: u.friendOfCount || 0,
};

await db.from("codeforces_profiles").upsert(profile, { onConflict: "user_id" });

return new Response(JSON.stringify({ profile }), {
  headers: corsHeaders,
});


  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
