// supabase\functions\sync-codeforces\index.ts
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

    if (!username) {
      throw new Error("Missing username");
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("Missing auth header");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify user
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
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

    // Service role client
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // User Info
    const cfRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${username}`,
    );

    const cf = await cfRes.json();

    if (cf.status !== "OK") {
      return new Response(
        JSON.stringify({
          error: "Invalid Codeforces username",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const u = cf.result[0];

    // Contest History
    const contestRes = await fetch(
      `https://codeforces.com/api/user.rating?handle=${username}`,
    );

    const contestJson = await contestRes.json();

    const ratedContests =
      contestJson.status === "OK" ? contestJson.result.length : 0;

    const profile = {
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

      contests: ratedContests,

      contribution: u.contribution ?? 0,

      organization: u.organization ?? null,
      country: u.country ?? null,

      registration_time: u.registrationTimeSeconds ?? null,

      last_online_time: u.lastOnlineTimeSeconds ?? null,
    };

    const { error: upsertError } = await db
      .from("codeforces_profiles")
      .upsert(profile, {
        onConflict: "user_id",
      });

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : String(e),
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
