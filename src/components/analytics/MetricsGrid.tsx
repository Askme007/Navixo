import { Card, CardContent } from "../ui/card";
import { Flame, Target, TrendingUp } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface MetricsProps {
  metrics: {
    currentStreak: number;
    longestStreak?: number;
    maxStreak?: number;
    avgCompletion: number;
  } | null;
  loading: boolean;
}

export function MetricsGrid({ metrics, loading }: MetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-[104px] w-full rounded-3xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  const data = metrics || {
    currentStreak: 0,
    maxStreak: 0,
    avgCompletion: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500 border border-orange-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.1em]">
              Current Streak
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {data.currentStreak} Days
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.1em]">
              Max Streak
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {data.maxStreak || data.longestStreak || 0} Days
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.1em]">
              Avg Completion
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {data.avgCompletion}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
