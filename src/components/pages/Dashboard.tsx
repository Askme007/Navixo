import { useState } from "react";
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
import { TaskCheckinCard } from "../dashboard/TaskCheckinCard";
import { MetricsGrid } from "../analytics/MetricsGrid";
import { ExecutionChart } from "../analytics/ExecutionChart";
import { Button } from "../ui/button";
import {
  Flame,
  ShieldAlert,
  Sparkles,
  Activity,
  Target,
  Building2,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react";

interface DashboardProps {
  userName: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function Dashboard({ userName, onNavigate, onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // --- Unified Dashboard Data Hook with Instant LocalStorage Hydration ---
  const {
    activeRoadmap,
    savedRoadmaps,
    progressValue,
    activity,
    focusSteps,
    loading,
    telemetry,
    platforms,
    todayTasks,
    userState,
    profile,
    memoryMetrics,
    refreshDashboard,
    deleteRoadmap,
    activateRoadmap,
  } = useDashboard();

  // Extract safe telemetry metrics
  const trendData = telemetry?.trend || [];
  const currentStreak = telemetry?.currentStreak ?? userState?.streak ?? 0;
  const avgCompletion = telemetry?.avgCompletion ?? 0;
  const mode = telemetry?.mode ?? userState?.mode ?? "progression";

  // Safe chart data
  const safeChartData =
    trendData.length > 0
      ? trendData
      : currentStreak > 0 || avgCompletion > 0
        ? [{ date: new Date().toISOString(), completionRate: avgCompletion }]
        : [];

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#8B5CF6]/30">
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

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative custom-scrollbar">
          <div className="max-w-[1440px] mx-auto space-y-7">
            {/* ========================================================= */}
            {/* 1. MISSION TELEMETRY HUD / STATUS BAR                     */}
            {/* ========================================================= */}
            <div className="bg-[#0F1117]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SYSTEM ACTIVE
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-300 text-xs font-mono font-medium">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  {currentStreak} DAY STREAK
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold ${
                    mode === "recovery"
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                      : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {mode === "recovery" ? "RECOVERY PROTOCOL" : "PROGRESSION MODE"}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Button
                  onClick={() => onNavigate("chat")}
                  size="sm"
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white rounded-xl gap-1.5 text-xs font-medium shadow-lg shadow-purple-900/30 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Mentor
                </Button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 1.5 PLACEMENT TARGETS & SEMANTIC MEMORY RIBBON            */}
            {/* ========================================================= */}
            <div className="bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-white font-medium">
                  <div className="p-1.5 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA]">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-white/90">
                    {profile?.targetRole || "Software Development Engineer (SDE)"}
                  </span>
                  {profile?.graduationBatch && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 text-[11px] font-mono">
                      Class of {profile.graduationBatch}
                    </span>
                  )}
                  {profile?.primaryLanguage && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-medium">
                      {profile.primaryLanguage}
                    </span>
                  )}
                </div>

                {/* Target Companies Chips */}
                {profile?.targetCompanies && profile.targetCompanies.length > 0 && (
                  <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                    <Building2 className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <div className="flex items-center gap-1 flex-wrap">
                      {profile.targetCompanies.slice(0, 4).map((comp: string) => (
                        <span
                          key={comp}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 text-[11px] font-medium hover:border-[#8B5CF6]/40 transition-colors"
                        >
                          {comp}
                        </span>
                      ))}
                      {profile.targetCompanies.length > 4 && (
                        <span className="text-[10px] text-white/40 font-mono">
                          +{profile.targetCompanies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                {/* Semantic Vector Memory Telemetry */}
                <div
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]"
                  title="Semantic Context Engine automatically retrieves user profile & strengths for AI Mentor chat."
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>
                    Memory:{" "}
                    <strong className="text-emerald-300">
                      {memoryMetrics?.vectorsCount ?? 0}
                    </strong>{" "}
                    vectors
                  </span>
                </div>

                {/* Quick Calibrate Profile Button */}
                <button
                  onClick={() => onNavigate("profile")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-medium cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#A78BFA]" />
                  <span>Calibrate Targets</span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. COMMAND DECK: ROADMAP TRAJECTORY & TODAY'S PROTOCOL   */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Columns: Hero Cockpit & Current Focus */}
              <div className="lg:col-span-7 space-y-6">
                <HeroSection
                  userName={userName}
                  activeRoadmap={activeRoadmap}
                  progressValue={progressValue}
                  onOpenRoadmap={() => {
                    const targetRoadmapId = activeRoadmap?.id || userState?.activeRoadmapId;
                    if (targetRoadmapId) {
                      onNavigate(`roadmap/${targetRoadmapId}`);
                    } else {
                      onNavigate("roadmap");
                    }
                  }}
                  onAskNavixo={() => onNavigate("chat")}
                />

                <CurrentFocusSection
                  focusSteps={focusSteps}
                  onGenerateRoadmap={() => onNavigate("roadmap")}
                  onViewStep={(stepId) => {
                    const targetRoadmapId = activeRoadmap?.id || userState?.activeRoadmapId;
                    if (targetRoadmapId) {
                      onNavigate(`roadmap/${targetRoadmapId}?stepId=${stepId}`);
                    } else {
                      onNavigate(`roadmap?stepId=${stepId}`);
                    }
                  }}
                />
              </div>

              {/* Right 5 Columns: Today's Actionable Protocol Deck */}
              <div className="lg:col-span-5 h-full">
                <TaskCheckinCard
                  initialTasks={todayTasks}
                  onCheckinComplete={refreshDashboard}
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. COMPETITIVE BATTLE STATIONS                           */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center gap-2 mb-4 ml-1">
                <Activity className="w-4 h-4 text-cyan-400" />
                <p className="text-white/40 text-xs tracking-[0.2em] font-bold uppercase font-mono">
                  Competitive Battle Stations
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeetcodeCard initialProfile={platforms?.leetcode} />
                <CodeforcesCard initialProfile={platforms?.codeforces} />
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. EXECUTION TELEMETRY & 30-DAY TRAJECTORY               */}
            {/* ========================================================= */}
            <div>
              <p className="text-white/40 text-xs tracking-[0.2em] font-bold mb-4 ml-1 uppercase font-mono">
                Execution Telemetry & Velocity
              </p>

              <MetricsGrid metrics={telemetry as any} loading={loading} />

              <div className="mt-4">
                <ExecutionChart data={safeChartData} loading={loading} />
              </div>
            </div>

            {/* ========================================================= */}
            {/* 5. ARCHIVE LEDGER: ROADMAPS & COMPLETED MILESTONES       */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoadmapsCard
                roadmaps={savedRoadmaps}
                activeRoadmapId={activeRoadmap?.id || userState?.activeRoadmapId}
                onOpenRoadmap={(id) => onNavigate(`roadmap/${id}`)}
                onGenerateRoadmap={() => onNavigate("roadmap")}
                onDeleteRoadmap={deleteRoadmap}
                onActivateRoadmap={activateRoadmap}
              />
              <CompletedStepsCard completedSteps={activity} />
            </div>
          </div>

          <div className="h-20" />
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
