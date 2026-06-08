// src\components\dashboard\RoadmapsCard.tsx

import { Map, ChevronRight, Plus } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { SavedRoadmap } from "../../hooks/useDashboard";

interface RoadmapsCardProps {
  roadmaps: SavedRoadmap[];
  onOpenRoadmap: (id: string) => void;
  onGenerateRoadmap: () => void;
}

export function RoadmapsCard({
  roadmaps,
  onOpenRoadmap,
  onGenerateRoadmap,
}: RoadmapsCardProps) {
  return (
    <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-[#8B5CF6]" />
          <h3
            className="text-white font-semibold"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Saved Roadmaps
          </h3>
        </div>
        <Button
          onClick={onGenerateRoadmap}
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {roadmaps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-white/40 text-sm mb-4">
              No roadmaps generated yet.
            </p>
          </div>
        ) : (
          roadmaps.map((rm) => (
            <button
              key={rm.id}
              onClick={() => onOpenRoadmap(rm.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-left group"
            >
              <div className="truncate pr-4">
                <p className="text-white text-sm font-medium truncate mb-1">
                  {rm.title}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      rm.generation_status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {rm.generation_status}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {new Date(rm.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 shrink-0" />
            </button>
          ))
        )}
      </div>
    </Card>
  );
}
