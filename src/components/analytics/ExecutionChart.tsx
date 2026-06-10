import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface TrendData {
  date: string;
  completionRate: number;
}

export function ExecutionChart({
  data,
  loading,
}: {
  data: TrendData[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Skeleton className="h-[300px] w-full rounded-3xl bg-white/5 mb-6" />
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl h-[300px] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.35)] mb-6">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-white/40" />
        </div>
        <p className="text-white/60 text-sm font-medium">
          Insufficient telemetry.
        </p>
        <p className="text-white/40 text-xs mt-1">
          Execute tasks to generate visualization graph.
        </p>
      </Card>
    );
  }

  // Format dates for the X-axis (e.g., "2026-06-01" -> "Jun 01")
  const formattedData = data.map((d) => {
    const dateObj = new Date(d.date);
    return {
      ...d,
      displayDate: dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  return (
    <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)] mb-6">
      <CardHeader className="pb-2 pt-6 px-6">
        <CardTitle className="text-xs text-white/30 font-bold tracking-[0.2em] uppercase">
          30-Day Execution Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[220px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="displayDate"
                stroke="#4b5563"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#4b5563"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0B0D12",
                  borderColor: "#2f2f2f",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{ color: "#8B5CF6", fontWeight: "bold" }}
                formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRate)"
                activeDot={{
                  r: 6,
                  fill: "#8B5CF6",
                  stroke: "#0B0D12",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
