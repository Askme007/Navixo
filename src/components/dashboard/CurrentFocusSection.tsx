// src\components\dashboard\CurrentFocusSection.tsx

import { Target, CheckCircle2, Map } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { FocusStep } from "../../hooks/useDashboard";

interface CurrentFocusSectionProps {
  focusSteps: FocusStep[];
  onGenerateRoadmap: () => void;
  onViewStep: (stepId: string) => void;
}

export function CurrentFocusSection({
  focusSteps,
  onGenerateRoadmap,
  onViewStep,
}: CurrentFocusSectionProps) {
  if (!focusSteps || focusSteps.length === 0) {
    return (
      <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[#14F4C9]" />
          <h2
            className="text-white text-lg font-semibold"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Current Focus
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Map className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-white font-medium mb-2">No roadmap found</h3>
          <p className="text-white/50 text-sm max-w-sm mb-6">
            Generate a roadmap to get started.
          </p>
          <Button
            onClick={onGenerateRoadmap}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl"
          >
            Generate Roadmap
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-[#14F4C9]" />
        <h2
          className="text-white text-lg font-semibold"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Current Focus
        </h2>
      </div>

      <div className="space-y-3">
        {focusSteps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
              step.status === "in-progress"
                ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle2
                  className={`w-5 h-5 ${step.status === "in-progress" ? "text-[#8B5CF6]" : "text-white/30"}`}
                />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm md:text-base mb-1">
                  {step.title}
                </h4>
                <p className="text-white/50 text-xs md:text-sm line-clamp-1 mb-2">
                  {step.description}
                </p>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-wider">
                    {step.level}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-wider">
                    {step.duration}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => onViewStep(step.id)}
              variant="ghost"
              className="hidden md:flex bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 rounded-lg shrink-0"
            >
              View Node
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
