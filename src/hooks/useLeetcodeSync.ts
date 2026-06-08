// src\hooks\useLeetcodeSync.ts

/**
 * useLeetcodeSync.ts
 *
 * [TEMPORARY COMPATIBILITY LAYER]
 * Sync currently routes through legacy Supabase Edge Function: /functions/v1/sync-leetcode
 * * FUTURE MIGRATION:
 * Change `syncEndpoint` to `${import.meta.env.VITE_API_URL}/api/platforms/leetcode/sync`
 * once Express backend is deployed.
 */
import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import { dashboardService } from "../services/dashboard.service";

export interface LeetcodeProfile {
  id: string;
  user_id: string;
  username: string;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number;
  updated_at: string;
}

export function useLeetcodeSync() {
  const [leetcodeProfile, setLeetcodeProfile] =
    useState<LeetcodeProfile | null>(null);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [editingLc, setEditingLc] = useState(false);
  const [syncingLeetcode, setSyncingLeetcode] = useState(false);
  const [lcError, setLcError] = useState<string | null>(null);

  useEffect(() => {
    setLcError(null);
  }, [leetcodeUsername]);

  useEffect(() => {
    const load = async () => {
      const user = await authService.getUser();
      if (!user) return;
      const { data } = await dashboardService.getLeetcodeProfile(user.id);
      setLeetcodeProfile((data as LeetcodeProfile) ?? null);
      setLeetcodeUsername((data as any)?.username ?? "");
    };
    load();
  }, []);

  const syncLeetcode = async (onSuccess?: () => void): Promise<void> => {
    if (!leetcodeUsername.trim() || syncingLeetcode) return;

    try {
      setSyncingLeetcode(true);
      setLcError(null);

      const token = await authService.getToken();
      if (!token) throw new Error("Not authenticated");

      // TEMPORARY ENDPOINT: Supabase Edge Function
      const syncEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-leetcode`;

      const res = await fetch(syncEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: leetcodeUsername.trim() }),
      });

      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json.error ?? "LeetCode sync failed");

      const user = await authService.getUser();
      if (user) {
        const { data } = await dashboardService.getLeetcodeProfile(user.id);
        setLeetcodeProfile((data as LeetcodeProfile) ?? null);
      }

      setEditingLc(false);
      onSuccess?.();
    } catch (e: any) {
      setLcError(e.message ?? "LeetCode sync failed");
    } finally {
      setSyncingLeetcode(false);
    }
  };

  return {
    leetcodeProfile,
    leetcodeUsername,
    setLeetcodeUsername,
    editingLc,
    setEditingLc,
    syncingLeetcode,
    lcError,
    syncLeetcode,
  };
}
