import { useEffect, useRef, useState } from "react";
import { authService } from "../services/auth.service";
import { dashboardService } from "../services/dashboard.service";

export interface CodeforcesProfile {
  id?: number | string;
  user_id?: string;
  userId?: string;
  username: string;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  title_photo_url?: string | null;
  titlePhotoUrl?: string | null;
  rating: number;
  max_rating: number;
  maxRating?: number;
  rank: string;
  max_rank?: string | null;
  maxRank?: string | null;
  contests: number;
  last_synced_at?: string;
  lastSyncedAt?: string;
}

export function sanitizeCodeforcesUrl(url?: string | null): string | null {
  if (!url) return null;
  let clean = url.trim();
  if (clean.startsWith("//")) clean = `https:${clean}`;
  return clean.replace(
    /^https?:\/\/userpic\.codeforces\.org\//i,
    "https://codeforces.com/userpic/"
  );
}

export function normalizeCodeforcesProfile(p: any): CodeforcesProfile | null {
  if (!p || typeof p !== "object") return null;

  const currentRating = Number(p.rating || 0);
  const maxRating =
    p.max_rating !== undefined && p.max_rating !== null && Number(p.max_rating) !== 0
      ? Number(p.max_rating)
      : p.maxRating !== undefined && p.maxRating !== null && Number(p.maxRating) !== 0
      ? Number(p.maxRating)
      : currentRating;

  const cleanAvatar = sanitizeCodeforcesUrl(p.avatar_url || p.avatarUrl);
  const cleanTitle = sanitizeCodeforcesUrl(p.title_photo_url || p.titlePhotoUrl);
  const avatar = cleanAvatar || cleanTitle || null;
  const title = cleanTitle || cleanAvatar || null;

  return {
    ...p,
    username: p.username || "",
    rating: currentRating,
    max_rating: maxRating,
    maxRating: maxRating,
    title_photo_url: title,
    titlePhotoUrl: title,
    avatar_url: avatar,
    avatarUrl: avatar,
    first_name: p.first_name || p.firstName || null,
    firstName: p.firstName || p.first_name || null,
    last_name: p.last_name || p.lastName || null,
    lastName: p.lastName || p.last_name || null,
    rank: p.rank || "unrated",
    max_rank: p.max_rank || p.maxRank || p.rank || "unrated",
    maxRank: p.maxRank || p.max_rank || p.rank || "unrated",
    contests: Number(p.contests || 0),
  };
}

interface CodeforcesCache {
  userId: string;
  profile: CodeforcesProfile | null;
}

let codeforcesCache: CodeforcesCache | null = null;

function getUserId() {
  return authService.getUser()?.id ?? null;
}

function getCachedProfile(userId: string | null): CodeforcesProfile | null {
  if (!userId) return null;
  if (codeforcesCache?.userId === userId) {
    return codeforcesCache.profile;
  }
  try {
    const raw = localStorage.getItem(`navixo_cf_cache_${userId}`);
    if (raw) {
      const parsed = normalizeCodeforcesProfile(JSON.parse(raw));
      codeforcesCache = { userId, profile: parsed };
      return parsed;
    }
  } catch {}
  return null;
}

function saveCachedProfile(userId: string, profile: CodeforcesProfile | null) {
  const normalized = normalizeCodeforcesProfile(profile);
  codeforcesCache = { userId, profile: normalized };
  try {
    localStorage.setItem(`navixo_cf_cache_${userId}`, JSON.stringify(normalized));
  } catch {}
}

export function useCodeforcesSync(initialProfile?: CodeforcesProfile | null) {
  const mountedRef = useRef(true);
  const userId = getUserId();
  const normalizedInitial = normalizeCodeforcesProfile(initialProfile);
  const cachedProfile = normalizedInitial || getCachedProfile(userId);
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
    if (initialProfile) {
      const normalized = normalizeCodeforcesProfile(initialProfile);
      setCfProfile(normalized);
      setCfUsername(normalized?.username || "");
      if (userId) saveCachedProfile(userId, normalized);
    }
  }, [initialProfile, userId]);

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      try {
        const raw = await dashboardService.getCodeforcesProfile();
        const data = normalizeCodeforcesProfile(raw);
        const currentUserId = getUserId();

        if (currentUserId && data) {
          saveCachedProfile(currentUserId, data);
        }

        if (mountedRef.current && data) {
          setCfProfile(data);
          setCfUsername(data.username ?? "");
        }
      } catch {
        // Keep cached data on a transient background-refresh failure without console noise.
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
      if (!response.ok || json.error || json.success === false) {
        throw new Error(json.error ?? "Codeforces sync failed");
      }

      const raw = await dashboardService.getCodeforcesProfile();
      const profile = normalizeCodeforcesProfile(raw || json);
      const currentUserId = getUserId();
      if (currentUserId && profile) {
        saveCachedProfile(currentUserId, profile);
        try {
          const rawDash = localStorage.getItem(`navixo_dashboard_cache_${currentUserId}`);
          if (rawDash) {
            const parsed = JSON.parse(rawDash);
            if (!parsed.platforms) parsed.platforms = {};
            parsed.platforms.codeforces = profile;
            localStorage.setItem(`navixo_dashboard_cache_${currentUserId}`, JSON.stringify(parsed));
          }
        } catch {}
      }

      setCfProfile(profile);
      setCfUsername(profile?.username ?? "");
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
