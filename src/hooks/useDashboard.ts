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
}

interface DashboardResponse {
  latestRoadmap: SavedRoadmap | null;
  savedRoadmaps: SavedRoadmap[];
  progress: { percentage: number };
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  telemetry?: TelemetryData;
}

interface DashboardSnapshot {
  activeRoadmap: SavedRoadmap | null;
  roadmapStatus: RoadmapStatus;
  savedRoadmaps: SavedRoadmap[];
  progressValue: number;
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  telemetry: TelemetryData | null;
}

interface DashboardCache {
  userId: string;
  snapshot: DashboardSnapshot;
}

interface UseDashboardReturn extends DashboardSnapshot {
  loading: boolean;
  refreshDashboard: () => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
}

const emptySnapshot: DashboardSnapshot = {
  activeRoadmap: null,
  roadmapStatus: "idle",
  savedRoadmaps: [],
  progressValue: 0,
  activity: [],
  focusSteps: [],
  telemetry: null,
};

// Route changes unmount Dashboard. Keep the latest user-specific snapshot at
// module scope so returning from Roadmap or Chat can paint immediately.
let dashboardCache: DashboardCache | null = null;

function getUserId() {
  return authService.getUser()?.id ?? null;
}

function getCachedSnapshot(userId: string | null) {
  return userId && dashboardCache?.userId === userId
    ? dashboardCache.snapshot
    : null;
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

    // Skeletons are reserved for the first load. On every later visit we keep
    // the last complete dashboard visible and update it in the background.
    if (!cachedSnapshot && mountedRef.current) {
      setLoading(true);
    }

    try {
      const data: DashboardResponse = await dashboardService.getDashboard();
      const nextSnapshot = toSnapshot(data);

      if (userId) {
        dashboardCache = { userId, snapshot: nextSnapshot };
      }

      if (mountedRef.current) {
        setSnapshot(nextSnapshot);
      }
    } catch (error) {
      console.error("Dashboard load failed:", error);

      // A transient refresh failure should never erase an already visible
      // dashboard. Only the first load falls back to its empty state.
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
      dashboardCache = { userId, snapshot: nextSnapshot };
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
        dashboardCache = { userId, snapshot: previousSnapshot };
      }
      await refreshDashboard();
    }
  };

  return {
    ...snapshot,
    loading,
    refreshDashboard,
    deleteRoadmap,
  };
}
