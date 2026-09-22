import { useEffect, useRef, useState } from "react";
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

interface LeetcodeCache {
  userId: string;
  profile: LeetcodeProfile | null;
}

let leetcodeCache: LeetcodeCache | null = null;

function getUserId() {
  return authService.getUser()?.id ?? null;
}

function getCachedProfile(userId: string | null): LeetcodeProfile | null {
  if (!userId) return null;
  if (leetcodeCache?.userId === userId) {
    return leetcodeCache.profile;
  }
  try {
    const raw = localStorage.getItem(`navixo_leetcode_cache_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      leetcodeCache = { userId, profile: parsed };
      return parsed;
    }
  } catch {}
  return null;
}

function saveCachedProfile(userId: string, profile: LeetcodeProfile | null) {
  leetcodeCache = { userId, profile };
  try {
    localStorage.setItem(`navixo_leetcode_cache_${userId}`, JSON.stringify(profile));
  } catch {}
}

export function useLeetcodeSync(initialProfile?: LeetcodeProfile | null) {
  const mountedRef = useRef(true);
  const userId = getUserId();
  const cachedProfile = initialProfile || getCachedProfile(userId);
  const [leetcodeProfile, setLeetcodeProfile] = useState<LeetcodeProfile | null>(
    () => cachedProfile,
  );
  const [leetcodeUsername, setLeetcodeUsername] = useState(
    () => cachedProfile?.username ?? "",
  );
  const [editingLc, setEditingLc] = useState(false);
  const [syncingLeetcode, setSyncingLeetcode] = useState(false);
  const [lcError, setLcError] = useState<string | null>(null);

  useEffect(() => {
    setLcError(null);
  }, [leetcodeUsername]);

  useEffect(() => {
    if (initialProfile) {
      setLeetcodeProfile(initialProfile);
      setLeetcodeUsername(initialProfile.username || "");
      if (userId) saveCachedProfile(userId, initialProfile);
    }
  }, [initialProfile, userId]);

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      try {
        const data = (await dashboardService.getLeetcodeProfile()) as LeetcodeProfile | null;
        const currentUserId = getUserId();

        if (currentUserId) {
          saveCachedProfile(currentUserId, data);
        }

        if (mountedRef.current) {
          setLeetcodeProfile(data);
          setLeetcodeUsername(data?.username ?? "");
        }
      } catch (error) {
        // Preserve a cached profile when a background refresh is unavailable.
        console.error(error);
      }
    };

    // The card paints from cache first, then refreshes quietly in the
    // background so returning to the dashboard never flashes its empty state.
    load();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const syncLeetcode = async (onSuccess?: () => void): Promise<void> => {
    if (!leetcodeUsername.trim() || syncingLeetcode) return;

    try {
      setSyncingLeetcode(true);
      setLcError(null);

      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/platforms/leetcode/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: leetcodeUsername.trim() }),
        },
      );

      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error ?? "LeetCode sync failed");
      }

      const profile = (await dashboardService.getLeetcodeProfile()) as LeetcodeProfile;
      const currentUserId = getUserId();
      if (currentUserId) {
        leetcodeCache = { userId: currentUserId, profile };
      }

      setLeetcodeProfile(profile);
      setLeetcodeUsername(profile.username ?? "");
      setEditingLc(false);
      onSuccess?.();
    } catch (error: unknown) {
      setLcError(error instanceof Error ? error.message : "LeetCode sync failed");
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
