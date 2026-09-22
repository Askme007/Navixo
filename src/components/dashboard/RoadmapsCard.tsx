import { Map, ChevronRight, Plus, X, Check } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { SavedRoadmap } from "../../hooks/useDashboard";

interface RoadmapsCardProps {
  roadmaps: SavedRoadmap[];
  activeRoadmapId?: string | null;
  onOpenRoadmap: (id: string) => void;
  onGenerateRoadmap: () => void;
  onDeleteRoadmap: (id: string) => void;
  onActivateRoadmap?: (id: string) => void;
}

export function RoadmapsCard({
  roadmaps,
  activeRoadmapId,
  onOpenRoadmap,
  onGenerateRoadmap,
  onDeleteRoadmap,
  onActivateRoadmap,
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
          roadmaps.map((rm) => {
            const isActive = activeRoadmapId === rm.id;

            return (
              <button
                key={rm.id}
                onClick={() => onOpenRoadmap(rm.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group border ${
                  isActive
                    ? "bg-purple-950/20 border-purple-500/30 hover:border-purple-500/50"
                    : "bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10"
                }`}
              >
                <div className="truncate pr-3">
                  <p className="text-white text-sm font-medium truncate mb-1">
                    {rm.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-500/25 text-purple-200 border border-purple-500/40 flex items-center gap-1 font-semibold">
                        <Check className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        rm.generationStatus === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {rm.generationStatus}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {rm.createdAt
                        ? new Date(rm.createdAt).toLocaleDateString()
                        : "Just now"}
                    </span>
                  </div>
                </div>

                {/* --- ACTIONS WRAPPER --- */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isActive &&
                    rm.generationStatus === "completed" &&
                    onActivateRoadmap && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActivateRoadmap(rm.id);
                        }}
                        className="px-2.5 py-1 text-[11px] rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all font-medium whitespace-nowrap"
                      >
                        Set Active
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoadmap(rm.id);
                    }}
                    className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 shrink-0" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
