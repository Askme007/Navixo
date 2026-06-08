// src\components\dashboard\CompletedStepsCard.tsx

import { CheckCircle2 } from "lucide-react";
import { Card } from "../ui/card";
import { ActivityItem } from "../../hooks/useDashboard";

interface CompletedStepsCardProps {
  completedSteps: ActivityItem[];
}

export function CompletedStepsCard({
  completedSteps,
}: CompletedStepsCardProps) {
  return (
    <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <h3
          className="text-white font-semibold"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Completed Steps
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {completedSteps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <p className="text-white/40 text-sm">No completed steps yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedSteps.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium leading-tight mb-1">
                    {item.title}
                  </p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">
                    Step {item.step_order}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
