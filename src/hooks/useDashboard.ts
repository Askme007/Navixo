import { useCallback, useEffect, useRef, useState } from "react";
import { dashboardService } from "../services/dashboard.service";
import { authService } from "../services/auth.service";

export type RoadmapStatus =
  | "idle"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SavedRoadmap {
  id: string;
  title: string;
  careerGoal: string;
  generationStatus: string;
  createdAt: string;
  isPublic?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  level: string;
  status: string;
  step_order: number;
}

export interface FocusStep {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  mentor_tip: string;
  step_order: number;
  status: string;
}

interface TelemetryData {
  currentStreak: number;
  maxStreak: number;
  avgCompletion: number;
  trend?: unknown[];
  mode?: string;
}

interface DashboardResponse {
  latestRoadmap: SavedRoadmap | null;
  savedRoadmaps: SavedRoadmap[];
  progress: { percentage: number };
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  telemetry?: TelemetryData;
  platforms?: {
    leetcode: any;
    codeforces: any;
  };
  todayTasks?: any[] | null;
  userState?: {
    streak: number;
    mode: string;
    activeRoadmapId: string | null;
  };
  profile?: any;
  memoryMetrics?: {
    indexedSnippets: number;
    semanticEngineActive: boolean;
  } | null;
}

export interface DashboardSnapshot {
  activeRoadmap: SavedRoadmap | null;
  roadmapStatus: RoadmapStatus;
  savedRoadmaps: SavedRoadmap[];
  progressValue: number;
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  telemetry: TelemetryData | null;
  platforms?: {
    leetcode: any;
    codeforces: any;
  } | null;
  todayTasks?: any[] | null;
  userState?: {
    streak: number;
    mode: string;
    activeRoadmapId: string | null;
  } | null;
  profile?: any;
  memoryMetrics?: {
    indexedSnippets: number;
    semanticEngineActive: boolean;
  } | null;
}

interface DashboardCache {
  userId: string;
  snapshot: DashboardSnapshot;
}

export interface UseDashboardReturn extends DashboardSnapshot {
  loading: boolean;
  refreshDashboard: () => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
  activateRoadmap: (id: string) => Promise<void>;
}

const emptySnapshot: DashboardSnapshot = {
  activeRoadmap: null,
  roadmapStatus: "idle",
  savedRoadmaps: [],
  progressValue: 0,
  activity: [],
  focusSteps: [],
  telemetry: null,
  platforms: null,
  todayTasks: null,
  userState: null,
  profile: null,
  memoryMetrics: null,
};

let dashboardCache: DashboardCache | null = null;

function getUserId() {
  return authService.getUser()?.id ?? null;
}

function getCachedSnapshot(userId: string | null): DashboardSnapshot | null {
  if (!userId) return null;
  if (dashboardCache?.userId === userId) {
    return dashboardCache.snapshot;
  }

  // Hydrate from localStorage for 0ms frame-1 paint
  try {
    const raw = localStorage.getItem(`navixo_dashboard_cache_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      dashboardCache = { userId, snapshot: parsed };
      return parsed;
    }
  } catch {
    // Non-fatal
  }

  return null;
}

function saveCachedSnapshot(userId: string, snapshot: DashboardSnapshot) {
  dashboardCache = { userId, snapshot };
  try {
    localStorage.setItem(`navixo_dashboard_cache_${userId}`, JSON.stringify(snapshot));
  } catch {
    // Non-fatal quota or privacy error
  }
}

function toSnapshot(data: DashboardResponse): DashboardSnapshot {
  return {
    activeRoadmap: data.latestRoadmap ?? null,
    roadmapStatus: (data.latestRoadmap?.generationStatus ?? "idle") as RoadmapStatus,
    savedRoadmaps: data.savedRoadmaps ?? [],
    progressValue: data.progress?.percentage ?? 0,
    activity: data.activity ?? [],
    focusSteps: data.focusSteps ?? [],
    telemetry: data.telemetry ?? null,
    platforms: data.platforms ?? null,
    todayTasks: data.todayTasks ?? null,
    userState: data.userState ?? null,
    profile: data.profile ?? null,
    memoryMetrics: data.memoryMetrics ?? null,
  };
}

export function useDashboard(): UseDashboardReturn {
  const mountedRef = useRef(true);
  const initialCache = getCachedSnapshot(getUserId());
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(
    () => initialCache ?? emptySnapshot,
  );
  const [loading, setLoading] = useState(() => !initialCache);

  const refreshDashboard = useCallback(async () => {
    const userId = getUserId();
    const cachedSnapshot = getCachedSnapshot(userId);

    // Only set loading true if there is no cache at all
    if (!cachedSnapshot && mountedRef.current) {
      setLoading(true);
    }

    try {
      const data: DashboardResponse = await dashboardService.getDashboard();
      const nextSnapshot = toSnapshot(data);

      if (userId) {
        saveCachedSnapshot(userId, nextSnapshot);
      }

      if (mountedRef.current) {
        setSnapshot(nextSnapshot);
      }
    } catch (error) {
      console.error("Dashboard load failed:", error);
      if (!cachedSnapshot && mountedRef.current) {
        setSnapshot(emptySnapshot);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refreshDashboard();

    return () => {
      mountedRef.current = false;
    };
  }, [refreshDashboard]);

  const deleteRoadmap = async (id: string) => {
    const previousSnapshot = snapshot;
    const nextSnapshot: DashboardSnapshot = {
      ...snapshot,
      activeRoadmap: snapshot.activeRoadmap?.id === id ? null : snapshot.activeRoadmap,
      savedRoadmaps: snapshot.savedRoadmaps.filter((roadmap) => roadmap.id !== id),
    };

    setSnapshot(nextSnapshot);
    const userId = getUserId();
    if (userId) {
      saveCachedSnapshot(userId, nextSnapshot);
    }

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/roadmap/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete roadmap");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setSnapshot(previousSnapshot);
      if (userId) {
        saveCachedSnapshot(userId, previousSnapshot);
      }
      throw error;
    }
  };

  const activateRoadmap = async (id: string) => {
    const target = snapshot.savedRoadmaps.find((r) => r.id === id);
    if (!target) return;

    const previousSnapshot = snapshot;
    const nextSnapshot: DashboardSnapshot = {
      ...snapshot,
      activeRoadmap: target,
      userState: snapshot.userState
        ? { ...snapshot.userState, activeRoadmapId: id }
        : { streak: 0, mode: "progression", activeRoadmapId: id },
    };

    setSnapshot(nextSnapshot);
    const userId = getUserId();
    if (userId) {
      saveCachedSnapshot(userId, nextSnapshot);
    }

    try {
      const rawBase =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:3001";
      const baseUrl = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
      const response = await fetch(`${baseUrl}/api/roadmap/${id}/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to activate roadmap");
      }

      await refreshDashboard();
    } catch (error) {
      console.error("Activate failed:", error);
      setSnapshot(previousSnapshot);
      if (userId) {
        saveCachedSnapshot(userId, previousSnapshot);
      }
      throw error;
    }
  };

  return {
    ...snapshot,
    loading,
    refreshDashboard,
    deleteRoadmap,
    activateRoadmap,
  };
}
