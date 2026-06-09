import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useDashboard } from "../../hooks/useDashboard";
import { DashboardHeader } from "../dashboard/DashboardHeader";
import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { LogoutModal } from "../dashboard/LogoutModal";
import { HeroSection } from "../dashboard/HeroSection";
import { CurrentFocusSection } from "../dashboard/CurrentFocusSection";
import { RoadmapsCard } from "../dashboard/RoadmapsCard";
import { CompletedStepsCard } from "../dashboard/CompletedStepsCard";
import { LeetcodeCard } from "../dashboard/LeetcodeCard";
import { CodeforcesCard } from "../dashboard/CodeforcesCard";

// Analytics & UI Imports
import { MetricsGrid } from "../analytics/MetricsGrid";
import { ExecutionChart } from "../analytics/ExecutionChart";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { TaskCheckinCard } from "../dashboard/TaskCheckinCard";

interface DashboardProps {
  userName: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function Dashboard({ userName, onNavigate, onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // --- New Analytics Telemetry State ---
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // --- Existing Dashboard Data Hook ---
  const {
    activeRoadmap,
    savedRoadmaps,
    progressValue,
    activity,
    focusSteps,
    loading,
  } = useDashboard();

  // Extract this function so we can pass it down to the Check-in Card
  const fetchTelemetry = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      // Inside fetchTelemetry in Dashboard.tsx
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";

      const res = await fetch(`${baseUrl}/api/progress/history`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error("Failed to sync execution telemetry.");

      const data = await res.json();
      setTelemetryData(data);
    } catch (err: any) {
      setTelemetryError(err.message);
    } finally {
      setTelemetryLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchTelemetry();
  }, []);

  // --- DEFENSIVE UX: HIGH-FIDELITY SKELETON SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-white selection:bg-[#8B5CF6]/30">
        <DashboardHeader
          userName={userName}
          onSidebarToggle={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
          onLogoutClick={() => setLogoutModalOpen(true)}
        />

        <div className="flex pt-16 h-screen overflow-hidden">
          <DashboardSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNavigate={onNavigate}
            currentPath="dashboard"
          />

          <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {/* COMPETITIVE PROGRAMMING SKELETON */}
              <div className="pt-6">
                <Skeleton className="h-4 w-48 bg-white/5 mb-4 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Skeleton className="h-[200px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />
                  <Skeleton className="h-[200px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />
                </div>
              </div>

              {/* ROADMAP HERO SKELETON */}
              <div className="w-full">
                <Skeleton className="h-[280px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />
              </div>

              {/* TELEMETRY SKELETON */}
              <div className="pt-2">
                <Skeleton className="h-4 w-40 bg-white/5 mb-4 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-[104px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]"
                    />
                  ))}
                </div>
                <Skeleton className="h-[300px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f] mb-6" />
              </div>

              {/* CURRENT FOCUS SKELETON */}
              <Skeleton className="h-[180px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />

              {/* BOTTOM CARDS SKELETON */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-[300px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />
                  <Skeleton className="h-[300px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />
                </div>
                <div className="lg:col-span-1">
                  <Skeleton className="h-[300px] w-full rounded-3xl bg-[#0F1117]/80 border border-[#2f2f2f]" />
                </div>
              </div>
            </div>
            <div className="h-24" />
          </main>
        </div>
      </div>
    );
  }

  // --- ACTUAL LOADED STATE ---
  return (
    <div className="min-h-screen bg-[#0B0D12] text-white selection:bg-[#8B5CF6]/30">
      <DashboardHeader
        userName={userName}
        onSidebarToggle={() => setSidebarOpen(true)}
        onNavigate={onNavigate}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      <div className="flex pt-16 h-screen overflow-hidden">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={onNavigate}
          currentPath="dashboard"
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* COMPETITIVE PROGRAMMING SECTION */}
            <div className="pt-6">
              <p className="text-white/30 text-xs tracking-[0.2em] font-bold mb-4 ml-1">
                COMPETITIVE PROGRAMMING
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeetcodeCard />
                <CodeforcesCard />
              </div>
            </div>

            {/* ROADMAP HERO SECTION */}
            <div className="w-full">
              <HeroSection
                userName={userName}
                activeRoadmap={activeRoadmap}
                progressValue={progressValue}
                onOpenRoadmap={() =>
                  activeRoadmap
                    ? onNavigate(`roadmap/${activeRoadmap.id}`)
                    : onNavigate("roadmap")
                }
                onAskNavixo={() => onNavigate("chat")}
              />
            </div>

            {/* --- NEW EXECUTION TELEMETRY SECTION --- */}
            <div className="pt-2">
              <p className="text-white/30 text-xs tracking-[0.2em] font-bold mb-4 ml-1">
                EXECUTION TELEMETRY
              </p>

              {telemetryError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{telemetryError}</span>
                </div>
              )}

              <MetricsGrid
                metrics={telemetryData?.metrics}
                loading={telemetryLoading}
              />
              <ExecutionChart
                data={telemetryData?.trend}
                loading={telemetryLoading}
              />
            </div>

            {/* CURRENT FOCUS SECTION */}
            <CurrentFocusSection
              focusSteps={focusSteps}
              onGenerateRoadmap={() => onNavigate("roadmap")}
              onViewStep={() => onNavigate(`roadmap/${activeRoadmap?.id}`)}
            />

            {/* ROADMAPS, COMPLETED STEPS, & SYNC TERMINAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <RoadmapsCard
                  roadmaps={savedRoadmaps}
                  onOpenRoadmap={(id) => onNavigate(`roadmap/${id}`)}
                  onGenerateRoadmap={() => onNavigate("roadmap")}
                />
                <CompletedStepsCard completedSteps={activity} />
              </div>

              {/* This is the new Interactive Terminal */}
              <div className="lg:col-span-1">
                <TaskCheckinCard onCheckinComplete={fetchTelemetry} />
              </div>
            </div>
          </div>

          <div className="h-24" />
        </main>
      </div>

      <LogoutModal
        isOpen={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          onLogout();
        }}
      />
    </div>
  );
}
