import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import { dashboardService } from "../services/dashboard.service";

export interface CodeforcesProfile {
  id: number;
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  title_photo_url: string | null;
  rating: number;
  max_rating: number;
  rank: string;
  max_rank: string | null;
  contests: number;
  last_synced_at: string;
}

export function useCodeforcesSync() {
  const [cfProfile, setCfProfile] =
    useState<CodeforcesProfile | null>(null);

  const [cfUsername, setCfUsername] = useState("");

  const [editingCf, setEditingCf] = useState(false);

  const [syncingCf, setSyncingCf] = useState(false);

  const [cfError, setCfError] = useState<string | null>(null);

  useEffect(() => {
    setCfError(null);
  }, [cfUsername]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await dashboardService.getCodeforcesProfile();

        if (data) {
          setCfProfile(data);
          setCfUsername(data.username ?? "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  const syncCodeforces = async (
    onSuccess?: () => void
  ): Promise<void> => {
    if (!cfUsername.trim() || syncingCf) return;

    try {
      setSyncingCf(true);
      setCfError(null);

      const token = authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/platforms/codeforces/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cfUsername.trim(),
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Codeforces sync failed");
      }

      const profile = await dashboardService.getCodeforcesProfile();

      setCfProfile(profile);

      setEditingCf(false);

      onSuccess?.();
    } catch (e: any) {
      setCfError(e.message ?? "Codeforces sync failed");
    } finally {
      setSyncingCf(false);
    }
  };

  return {
    cfProfile,
    cfUsername,
    setCfUsername,
    editingCf,
    setEditingCf,
    syncingCf,
    cfError,
    syncCodeforces,
  };
}