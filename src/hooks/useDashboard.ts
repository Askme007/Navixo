// src/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboard.service";
import { authService } from "../services/auth.service";

export type RoadmapStatus =
  | "idle"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

// Replace lines 12-18 with this:
export interface SavedRoadmap {
  id: string;
  title: string;
  careerGoal: string; // Changed from career_goal
  generationStatus: string; // Changed from generation_status
  createdAt: string; // Changed from created_at
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
  trend?: any[]; 
}

interface DashboardResponse {
  latestRoadmap: SavedRoadmap | null;
  savedRoadmaps: SavedRoadmap[];
  progress: { percentage: number };
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  telemetry?: TelemetryData; // <--- Add this
}

// Update UseDashboardReturn
interface UseDashboardReturn {
  activeRoadmap: SavedRoadmap | null;
  roadmapStatus: RoadmapStatus;
  savedRoadmaps: SavedRoadmap[];
  progressValue: number;
  activity: ActivityItem[];
  focusSteps: FocusStep[];
  loading: boolean;
  telemetry: TelemetryData | null;
  refreshDashboard: () => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [activeRoadmap, setActiveRoadmap] =
    useState<SavedRoadmap | null>(null);

  const [roadmapStatus, setRoadmapStatus] =
    useState<RoadmapStatus>("idle");

  const [savedRoadmaps, setSavedRoadmaps] =
    useState<SavedRoadmap[]>([]);

  const [progressValue, setProgressValue] =
    useState(0);

  const [activity, setActivity] =
    useState<ActivityItem[]>([]);


  const [focusSteps, setFocusSteps] =
    useState<FocusStep[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const data: DashboardResponse =
        await dashboardService.getDashboard();

      setActiveRoadmap(data.latestRoadmap);

      setSavedRoadmaps(data.savedRoadmaps ?? []);

      setProgressValue(
        data.progress?.percentage ?? 0
      );

      setActivity(data.activity ?? []);

      setFocusSteps(data.focusSteps ?? []);
      setTelemetry(data.telemetry ?? null);

      setRoadmapStatus(
        (data.latestRoadmap?.generationStatus ??
          "idle") as RoadmapStatus
      );
    } catch (err) {
      console.error("Dashboard load failed:", err);

      setActiveRoadmap(null);
      setSavedRoadmaps([]);
      setProgressValue(0);
      setActivity([]);
      setFocusSteps([]);
      setRoadmapStatus("idle");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Don't forget to import authService at the top if it isn't there!

// Replace your deleteRoadmap function with this:
  const deleteRoadmap = async (id: string) => {
    try {
      // Optimistically remove it from UI
      setSavedRoadmaps(prev => prev.filter(rm => rm.id !== id));
      if (activeRoadmap?.id === id) setActiveRoadmap(null);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3001";
      
      // FIXED: Changed "roadmaps" to "roadmap" and used authService
      const res = await fetch(`${baseUrl}/api/roadmap/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete roadmap");
      
    } catch (err) {
      console.error("Delete failed:", err);
      refreshDashboard(); // Re-fetch if it failed
    }
  };

  return {
    activeRoadmap,
    roadmapStatus,
    savedRoadmaps,
    progressValue,
    activity,
    focusSteps,
    loading,
    telemetry,
    refreshDashboard,
    deleteRoadmap,
  };
}