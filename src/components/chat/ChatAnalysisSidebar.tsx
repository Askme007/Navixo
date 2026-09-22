// src/components/chat/ChatAnalysisSidebar.tsx
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  BarChart3,
  Sparkles,
  Flame,
  Code,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Target,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { authService } from "../../services/auth.service";

interface MentorContextData {
  activeRoadmapTitle: string | null;
  activeStepTitle: string | null;
  activeStepStatus: string | null;
  activeStepOrder: number | null;
  completedStepsCount: number;
  totalStepsCount: number;
  leetcode: {
    username: string;
    solved: number;
    easy: number;
    medium: number;
    hard: number;
    ranking: number | null;
  } | null;
  codeforces: {
    username: string;
    rating: number;
    rank: string;
    maxRating: number;
  } | null;
  streak: number;
  mode: string;
  isCheckedIn: boolean;
  todayTasksCount: number;
  todayCompletedTasksCount: number;
}

interface ChatAnalysisSidebarProps {
  onSelectPrompt?: (promptText: string) => void;
}

export function ChatAnalysisSidebar({ onSelectPrompt }: ChatAnalysisSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<MentorContextData | null>(null);

  const API_URL =
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "";

  const fetchContext = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/stream/context`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success && json.data) {
        setContext(json.data);
      }
    } catch (err) {
      console.error("Failed to load mentor analysis context:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchContext();
    }
  }, [isOpen]);

  const handlePromptClick = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
      setIsOpen(false);
    }
  };

  const progressPct =
    context && context.totalStepsCount > 0
      ? Math.round((context.completedStepsCount / context.totalStepsCount) * 100)
      : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white border border-white/10 bg-white/5 rounded-xl h-9 hover:bg-white/10 transition-colors"
        >
          <BarChart3 className="w-4 h-4 mr-2 text-cyan-400" />
          <span className="text-xs font-semibold">Mentor Cockpit</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[360px] sm:w-[400px] bg-[#0A0C13] border-l border-white/10 p-0 text-white flex flex-col h-full"
      >
        <SheetHeader className="p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <SheetTitle className="text-white text-left text-sm font-bold tracking-tight">
                  Placement Cockpit
                </SheetTitle>
                <p className="text-[11px] text-slate-400">
                  Live context shared with Navixo Mentor
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {loading && !context ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400">Syncing placement metrics...</p>
            </div>
          ) : (
            <>
              {/* 1. Active Roadmap Focus Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Active Target</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10 text-[10px]"
                  >
                    {context?.activeRoadmapTitle ? "In Progress" : "No Roadmap"}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {context?.activeRoadmapTitle || "No Active Roadmap"}
                  </h4>
                  {context?.activeStepTitle && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>
                        Current Step:{" "}
                        <strong className="text-slate-200">
                          {context.activeStepTitle}
                        </strong>
                      </span>
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                {context && context.totalStepsCount > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Curriculum Completion</span>
                      <span className="font-semibold text-white">
                        {context.completedStepsCount}/{context.totalStepsCount}{" "}
                        Phases ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Competitive Programming Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Code className="w-3.5 h-3.5 text-orange-400" />
                    <span>Competitive Programming</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* LeetCode */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        LeetCode
                      </span>
                      <span className="text-[10px] text-orange-400 font-bold">
                        {context?.leetcode ? `@${context.leetcode.username}` : "Unlinked"}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white tracking-tight">
                      {context?.leetcode?.solved || 0}{" "}
                      <span className="text-xs font-normal text-slate-500">solved</span>
                    </div>
                    {context?.leetcode && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="text-emerald-400">E: {context.leetcode.easy}</span>
                        <span>•</span>
                        <span className="text-amber-400">M: {context.leetcode.medium}</span>
                        <span>•</span>
                        <span className="text-red-400">H: {context.leetcode.hard}</span>
                      </div>
                    )}
                  </div>

                  {/* Codeforces */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Codeforces
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold capitalize">
                        {context?.codeforces?.rank || "Unranked"}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white tracking-tight">
                      {context?.codeforces?.rating || 0}{" "}
                      <span className="text-xs font-normal text-slate-500">rating</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Peak: {context?.codeforces?.maxRating || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Daily Execution & Streak Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Telemetry & Streak</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      context?.mode === "recovery"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {context?.mode === "recovery" ? "Recovery Mode" : "Progression"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {context?.streak || 0} Day Streak
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {context?.isCheckedIn ? "Today logged" : "Today pending"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">
                      Today: {context?.todayCompletedTasksCount || 0}/
                      {context?.todayTasksCount || 0} Tasks
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {context?.isCheckedIn ? "Checked in" : "Draft state"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Quick Actionable Prompt Shortcuts */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold px-1">
                  Ask Mentor About:
                </p>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick(
                        context?.activeStepTitle
                          ? `How do I best approach and master ${context.activeStepTitle}? Give me a concrete execution breakdown and common interview questions.`
                          : "How do I build a competitive placement preparation roadmap for my target domain?",
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-500/30 transition text-left flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate">
                        🎯 Approach Active Step
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {context?.activeStepTitle || "Roadmap guidance"}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick(
                        `Based on my LeetCode profile (${context?.leetcode?.solved || 0} solved problems), recommend a targeted DSA study strategy and 2 high-frequency placement questions.`,
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-500/30 transition text-left flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate">
                        💻 DSA Strategy for My Level
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Calibrated to LeetCode stats
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick(
                        "Review today's actionable task protocol with me. How can I efficiently complete all items today?",
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-500/30 transition text-left flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate">
                        ⚡ Review Today's Protocol
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Daily tasks & execution plan
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* 5. Direct AI Mentor Command Deck */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold px-1 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3 h-3" />
                  Autonomous Mentor Actions:
                </p>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick(
                        "Please assign a task to my dashboard today: Solve 2 LeetCode Tree BFS/DFS problems and analyze time complexity.",
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] hover:bg-cyan-500/[0.1] hover:border-cyan-400/40 transition text-left flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-cyan-200 group-hover:text-cyan-100 transition truncate">
                        ⚡ Assign Tree Practice Task
                      </p>
                      <p className="text-[10px] text-cyan-400/70 truncate">
                        Mutates your daily protocol
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick(
                        "Please add a task to my dashboard today: Study Operating System deadlock conditions and Banker's Algorithm.",
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] hover:bg-purple-500/[0.1] hover:border-purple-400/40 transition text-left flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-purple-200 group-hover:text-purple-100 transition truncate">
                        📚 Assign Core CS Task
                      </p>
                      <p className="text-[10px] text-purple-400/70 truncate">
                        Adds OS deadlock study to dashboard
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick(
                        "I have finished my DSA practice today! Please mark my DSA task as completed on my dashboard.",
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.1] hover:border-emerald-400/40 transition text-left flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-emerald-200 group-hover:text-emerald-100 transition truncate">
                        ✅ Complete Daily DSA Task
                      </p>
                      <p className="text-[10px] text-emerald-400/70 truncate">
                        Checks off task on dashboard
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
