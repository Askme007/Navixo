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
      try {
        const data = await dashboardService.getLeetcodeProfile();

        if (data) {
          setLeetcodeProfile(data as LeetcodeProfile);
          setLeetcodeUsername(data?.username ?? "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  const syncLeetcode = async (
    onSuccess?: () => void
  ): Promise<void> => {
    if (!leetcodeUsername.trim() || syncingLeetcode) return;

    try {
      setSyncingLeetcode(true);
      setLcError(null);

      const token = authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/platforms/leetcode/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: leetcodeUsername.trim(),
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "LeetCode sync failed");
      }

      const profile = await dashboardService.getLeetcodeProfile();

      setLeetcodeProfile(profile);

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