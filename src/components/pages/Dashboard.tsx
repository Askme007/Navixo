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

interface DashboardProps {
  userName: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function Dashboard({ userName, onNavigate, onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const {
    activeRoadmap,
    savedRoadmaps,
    progressValue,
    activity,
    focusSteps,
    loading,
  } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <div className="pt-6">
              <p className="text-white/30 text-xs tracking-[0.2em] font-bold mb-4 ml-1">
                COMPETITIVE PROGRAMMING
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeetcodeCard />
                <CodeforcesCard />
              </div>
            </div>

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

            <CurrentFocusSection
              focusSteps={focusSteps}
              onGenerateRoadmap={() => onNavigate("roadmap")}
              onViewStep={() => onNavigate(`roadmap/${activeRoadmap?.id}`)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoadmapsCard
                roadmaps={savedRoadmaps}
                onOpenRoadmap={(id) => onNavigate(`roadmap/${id}`)}
                onGenerateRoadmap={() => onNavigate("roadmap")}
              />
              <CompletedStepsCard completedSteps={activity} />
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
