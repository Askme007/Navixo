import { useEffect, useRef, useState } from "react";
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

interface CodeforcesCache {
  userId: string;
  profile: CodeforcesProfile | null;
}

let codeforcesCache: CodeforcesCache | null = null;

function getUserId() {
  return authService.getUser()?.id ?? null;
}

function getCachedProfile(userId: string | null) {
  return userId && codeforcesCache?.userId === userId
    ? codeforcesCache.profile
    : null;
}

export function useCodeforcesSync() {
  const mountedRef = useRef(true);
  const userId = getUserId();
  const cachedProfile = getCachedProfile(userId);
  const [cfProfile, setCfProfile] = useState<CodeforcesProfile | null>(
    () => cachedProfile,
  );
  const [cfUsername, setCfUsername] = useState(
    () => cachedProfile?.username ?? "",
  );
  const [editingCf, setEditingCf] = useState(false);
  const [syncingCf, setSyncingCf] = useState(false);
  const [cfError, setCfError] = useState<string | null>(null);

  useEffect(() => {
    setCfError(null);
  }, [cfUsername]);

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      try {
        const data = (await dashboardService.getCodeforcesProfile()) as CodeforcesProfile | null;
        const currentUserId = getUserId();

        if (currentUserId) {
          codeforcesCache = { userId: currentUserId, profile: data };
        }

        if (mountedRef.current) {
          setCfProfile(data);
          setCfUsername(data?.username ?? "");
        }
      } catch (error) {
        // Keep cached data on a transient background-refresh failure.
        console.error(error);
      }
    };

    // Fetch fresh profile data without replacing the cached card with its
    // disconnected default while a user moves between routes.
    load();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const syncCodeforces = async (onSuccess?: () => void): Promise<void> => {
    if (!cfUsername.trim() || syncingCf) return;

    try {
      setSyncingCf(true);
      setCfError(null);

      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/platforms/codeforces/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: cfUsername.trim() }),
        },
      );

      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error ?? "Codeforces sync failed");
      }

      const profile = (await dashboardService.getCodeforcesProfile()) as CodeforcesProfile;
      const currentUserId = getUserId();
      if (currentUserId) {
        codeforcesCache = { userId: currentUserId, profile };
      }

      setCfProfile(profile);
      setCfUsername(profile.username ?? "");
      setEditingCf(false);
      onSuccess?.();
    } catch (error: unknown) {
      setCfError(error instanceof Error ? error.message : "Codeforces sync failed");
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
