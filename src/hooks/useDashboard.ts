/**
 * useDashboard.ts
 *
 * Owns all dashboard data state: roadmap, progress, activity, focus steps.
 * All Supabase queries delegated to dashboardService.
 * Auth delegated to authService.
 */
import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth.service";
import { dashboardService } from "../services/dashboard.service";

export type RoadmapStatus =
  | "idle"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SavedRoadmap {
  id: string;
  title: string;
  career_goal: string;
  generation_status: string;
  created_at: string;
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

interface UseDashboardReturn {
  activeRoadmap: SavedRoadmap | null;
  roadmapStatus: RoadmapStatus;
  savedRoadmaps: SavedRoadmap[];
  progressValue: number;
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  loading: boolean;
  refreshDashboard: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [activeRoadmap, setActiveRoadmap] = useState<SavedRoadmap | null>(null);
  const [roadmapStatus, setRoadmapStatus] = useState<RoadmapStatus>("idle");
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [progressValue, setProgressValue] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [focusSteps, setFocusSteps] = useState<FocusStep[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    const user = await authService.getUser();
    if (!user) return;

    const userId = user.id;

    const [{ data: rm }, { data: rms }] = await Promise.all([
      dashboardService.getLatestRoadmap(userId),
      dashboardService.getSavedRoadmaps(userId),
    ]);

    if (rm) {
      setActiveRoadmap(rm as SavedRoadmap);
      setRoadmapStatus((rm.generation_status ?? "idle") as RoadmapStatus);
    } else {
      setActiveRoadmap(null);
      setRoadmapStatus("idle");
    }

    setSavedRoadmaps(
      ((rms ?? []) as SavedRoadmap[]).filter(
        (r) => typeof r.id === "string" && r.title?.length > 0,
      ),
    );

    if (rm?.generation_status === "completed") {
      const { data: steps } = await dashboardService.getRoadmapProgress(userId);
      const done = steps?.filter((s: any) => s.status === "done").length ?? 0;
      const total = steps?.length ?? 0;
      setProgressValue(total > 0 ? Math.round((done / total) * 100) : 0);
    } else {
      setProgressValue(0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const loadSecondary = async () => {
      const user = await authService.getUser();
      if (!user) return;
      const [{ data: activityData }, stepsData] = await Promise.all([
        dashboardService.getRecentActivity(user.id),
        dashboardService.getCurrentFocusSteps(user.id),
      ]);
      setActivity((activityData ?? []) as ActivityItem[]);
      setFocusSteps(stepsData as FocusStep[]);
    };
    loadSecondary();
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    activeRoadmap,
    roadmapStatus,
    savedRoadmaps,
    progressValue,
    activity,
    focusSteps,
    loading,
    refreshDashboard,
  };
}
