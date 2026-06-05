import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const lcRes = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}`
    );
    const stats = await lcRes.json();

    if (!stats.totalSolved) {
      return new Response(
        JSON.stringify({ error: "Invalid LeetCode username" }),
        { status: 400, headers: corsHeaders }
      );
    }



    const {
      data: { user },
    } = await supabase.auth.getUser(
      req.headers.get("Authorization")!.replace("Bearer ", "")
    );

    await supabase
    .from("leetcode_profiles")
    .upsert(
      {
        user_id: user.id,
        username,
        solved: stats.totalSolved,
        easy: stats.easySolved,
        medium: stats.mediumSolved,
        hard: stats.hardSolved,
        ranking: stats.ranking,
      },
      { onConflict: "user_id" }
    );


    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: corsHeaders }
    );
  }

});
