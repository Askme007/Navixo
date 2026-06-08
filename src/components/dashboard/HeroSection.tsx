// src\components\dashboard\HeroSection.tsx

import { motion } from "motion/react";
import { Map, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { SavedRoadmap } from "../../hooks/useDashboard";

interface HeroSectionProps {
  userName: string;
  activeRoadmap: SavedRoadmap | null;
  progressValue: number;
  onOpenRoadmap: () => void;
  onAskNavixo: () => void;
}

export function HeroSection({
  userName,
  activeRoadmap,
  progressValue,
  onOpenRoadmap,
  onAskNavixo,
}: HeroSectionProps) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const today = new Date().toLocaleDateString("en-US", dateOptions);

  return (
    <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div>
            <p
              className="text-white/50 text-sm font-medium mb-1 uppercase tracking-wider"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {today}
            </p>
            <h1
              className="text-2xl md:text-3xl text-white tracking-tight"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
              }}
            >
              Execution Control, {userName}.
            </h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block w-full max-w-md">
            <p className="text-white/60 text-xs mb-1 uppercase tracking-wider">
              Active Roadmap
            </p>
            <p className="text-white font-medium truncate">
              {activeRoadmap
                ? activeRoadmap.title
                : "No active roadmap initialized"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={onOpenRoadmap}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl gap-2 shadow-lg shadow-[#8B5CF6]/20"
            >
              <Map className="w-4 h-4" />
              Open Roadmap
            </Button>
            <Button
              onClick={onAskNavixo}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Ask Navixo
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full md:w-auto bg-[#0B0D12]/50 p-6 rounded-2xl border border-white/5">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-[#8B5CF6]"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 251" }}
                animate={{
                  strokeDasharray: `${(progressValue / 100) * 251} 251`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {Math.round(progressValue)}%
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest">
                Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
