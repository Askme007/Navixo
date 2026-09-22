import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  Zap,
  AlertTriangle,
  CheckSquare,
  Square,
  X,
  Plus,
  Save,
  RefreshCw,
  Flame,
  Rocket,
  Code2,
  BookOpen,
  Sparkles,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { authService } from "../../services/auth.service";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

function getCategoryConfig(category: string) {
  if (category.includes("Roadmap")) {
    return {
      label: "Roadmap Focus",
      icon: <Rocket className="w-3 h-3 text-cyan-400" />,
      badgeClass: "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
    };
  }
  if (category.includes("DSA")) {
    return {
      label: "DSA / LeetCode",
      icon: <Code2 className="w-3 h-3 text-emerald-400" />,
      badgeClass: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    };
  }
  if (
    category.includes("Core CS") ||
    category.includes("System Design") ||
    category.includes("Revision") ||
    category.includes("Interview Prep")
  ) {
    return {
      label: category.includes("System Design") ? "System Design" : category.includes("Revision") ? "Revision" : "Core CS",
      icon: <BookOpen className="w-3 h-3 text-violet-400" />,
      badgeClass: "text-violet-300 bg-violet-500/10 border-violet-500/25",
    };
  }
  if (category === "Custom Override" || category.includes("Custom")) {
    return {
      label: "Custom Target",
      icon: <Sparkles className="w-3 h-3 text-amber-400" />,
      badgeClass: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    };
  }
  return {
    label: category,
    icon: <Sparkles className="w-3 h-3 text-[#A78BFA]" />,
    badgeClass: "text-[#A78BFA] bg-[#8B5CF6]/10 border-[#8B5CF6]/25",
  };
}

interface TaskCheckinCardProps {
  onCheckinComplete: () => void;
  initialTasks?: Task[] | null;
  activeRoadmapTitle?: string;
  currentStreak?: number;
  onNavigateToRoadmap?: () => void;
}

export function TaskCheckinCard({
  onCheckinComplete,
  initialTasks,
  activeRoadmapTitle,
  currentStreak = 0,
  onNavigateToRoadmap,
}: TaskCheckinCardProps) {
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks || []);
  const [loadingTasks, setLoadingTasks] = useState(() => !initialTasks || initialTasks.length === 0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

  // Synchronize when parent passes fresh initialTasks
  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      setTasks(initialTasks);
      setLoadingTasks(false);
    }
  }, [initialTasks]);

  useEffect(() => {
    const fetchTodayTasks = async () => {
      try {
        const token = authService.getToken();
        if (!token) return;

        const res = await fetch(`${baseUrl}/api/tasks/today`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success) {
          setTasks(json.data || []);
          if (json.isCheckedIn) {
            setIsCheckedInToday(true);
            setStatus("success");
          }
        }
      } catch (err) {
        console.error("Failed to fetch today's tasks", err);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTodayTasks();
  }, [baseUrl]);

  // Auto-save draft updates to backend
  const syncDraftToDatabase = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    setSaveState("saving");
    try {
      const token = authService.getToken();
      await fetch(`${baseUrl}/api/tasks/today`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks: updatedTasks }),
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      console.error("Failed to sync draft to DB.", err);
      setSaveState("idle");
    }
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    syncDraftToDatabase(newTasks);
  };

  const removeTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTasks = tasks.filter((t) => t.id !== id);
    syncDraftToDatabase(newTasks);
    toast.info("Task removed from today's plan");
  };

  const handleAddCustomTask = () => {
    if (newTaskTitle.trim() === "") return;

    const customTask: Task = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: "Custom Override",
      completed: false,
    };
    const newTasks = [...tasks, customTask];
    syncDraftToDatabase(newTasks);
    setNewTaskTitle("");
    setIsAdding(false);
    toast.success("Target task added to today's plan");
  };

  const handleKeyDownAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddCustomTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  const handleRegenerateTasks = async () => {
    try {
      setIsRegenerating(true);
      const token = authService.getToken();
      const res = await fetch(`${baseUrl}/api/tasks/regenerate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to regenerate tasks");

      setTasks(json.data || []);
      toast.success(json.message || "Daily tasks aligned with active roadmap!");
    } catch (err: any) {
      console.error("Regenerate failed:", err);
      toast.error(err?.message || "Failed to re-align tasks");
    } finally {
      setIsRegenerating(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const calculatedRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleCheckin = async () => {
    if (tasks.length === 0) {
      handleRegenerateTasks();
      return;
    }

    if (
      completedCount === 0 &&
      !window.confirm(
        "You haven't checked off any tasks yet today. Do you still want to log an empty check-in?",
      )
    ) {
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const token = authService.getToken();
      const res = await fetch(`${baseUrl}/api/tasks/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completionRate: calculatedRate,
          completedTasks: tasks,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution check-in failed.");

      setStatus("success");
      setIsCheckedInToday(true);
      toast.success(
        calculatedRate >= 50
          ? "🎉 Daily check-in logged! Streak extended."
          : "Daily check-in logged.",
      );
      onCheckinComplete();
    } catch (err: any) {
      setErrorMessage(err.message || "Check-in failed");
      setStatus("error");
      toast.error(err.message || "Check-in failed");
    }
  };

  return (
    <div className="bg-[#0B0F19]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col h-full min-h-[520px] shadow-[0_0_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
      {/* Subtle glowing ambient accent */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. CARD HEADER: CLEAR TITLE & EXPLANATION                 */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8B5CF6]/25 to-cyan-500/20 border border-[#8B5CF6]/30 text-cyan-300 shadow-sm">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Daily Execution Plan
                </h2>
                {/* Auto-save indicator */}
                {saveState === "saving" && (
                  <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1 font-mono">
                    <Save className="w-3 h-3 animate-pulse text-purple-400" /> Saving...
                  </span>
                )}
                {saveState === "saved" && (
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Target milestones aligned with your active roadmap & DSA practice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status indicator badge */}
            {isCheckedInToday ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Checked In</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>In Progress</span>
              </span>
            )}

            {/* Sync Roadmap Button */}
            {!loadingTasks && tasks.length > 0 && (
              <button
                type="button"
                onClick={handleRegenerateTasks}
                disabled={isRegenerating}
                title="Re-align daily tasks with current active roadmap"
                className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/30 bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-300 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-cyan-400" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Linked Roadmap Context Pill */}
        {activeRoadmapTitle && (
          <div className="flex items-center justify-between text-[11px] bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 text-slate-400">
            <span className="truncate flex items-center gap-1.5">
              <Rocket className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Linked to:</span>
              <strong className="text-white font-medium truncate">{activeRoadmapTitle}</strong>
            </span>
            {onNavigateToRoadmap && (
              <button
                onClick={onNavigateToRoadmap}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 ml-2 shrink-0 transition-colors cursor-pointer"
              >
                <span>View</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. PROGRESS METER & STREAK THRESHOLD                      */}
      {/* ========================================================= */}
      <div className="py-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white/90">
            Today's Target Progress:{" "}
            <span className="text-purple-300 font-mono">
              {completedCount} of {totalCount} Completed
            </span>
          </span>
          <span
            className="text-base font-bold text-white font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10"
          >
            {calculatedRate}%
          </span>
        </div>

        {/* Progress Bar with 50% Milestone Marker */}
        <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-[#8B5CF6] to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${calculatedRate}%` }}
          />
          {/* Subtle 50% Milestone Marker */}
          <div
            className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-10 pointer-events-none"
            title="50% Streak Threshold"
          />
        </div>

        {/* Streak Threshold Guideline */}
        <div className="flex items-center justify-between text-[11px]">
          {calculatedRate >= 50 ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Streak target reached! Minimum 50% fulfilled.</span>
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400/60 shrink-0" />
              <span>Complete at least 50% to maintain your streak ({currentStreak} Days 🔥)</span>
            </span>
          )}

          {calculatedRate === 100 && (
            <span className="text-cyan-300 font-medium font-mono text-[10px] uppercase tracking-wider">
              100% Sprint Complete 🚀
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CHECKED-IN CELEBRATORY BANNER (IF CHECKED IN)          */}
      {/* ========================================================= */}
      {isCheckedInToday && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Daily Execution Logged!</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {calculatedRate}% Rate
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Telemetry synchronized with your AI Mentor. You can still add bonus achievements below.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold shrink-0 font-mono">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Active</span>
          </div>
        </div>
      )}

      {/* Error notification if check-in failed */}
      {status === "error" && (
        <div className="mb-3 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TASK ITEMS LIST                                        */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#06080F] rounded-2xl p-3 sm:p-4 border border-white/5 space-y-2.5">
        {loadingTasks ? (
          <div className="space-y-2.5 flex-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[250px] pr-1.5 custom-scrollbar">
            {tasks.length === 0 && !isAdding && (
              <div className="text-center py-6 px-4 space-y-3">
                <p className="text-slate-400 text-xs">
                  No active tasks in today's execution plan.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerateTasks}
                  disabled={isRegenerating}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all"
                >
                  Generate Plan from Active Roadmap
                </button>
              </div>
            )}

            {tasks.map((task) => {
              const categoryConfig = getCategoryConfig(task.category);
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    task.completed
                      ? "bg-emerald-500/5 border-emerald-500/25 hover:border-emerald-500/40"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 focus:outline-none shrink-0"
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 transition-transform active:scale-95" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-medium leading-snug transition-all ${
                        task.completed
                          ? "text-slate-400 line-through opacity-75"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${categoryConfig.badgeClass}`}
                      >
                        {categoryConfig.icon}
                        <span>{categoryConfig.label}</span>
                      </span>
                      {task.completed && (
                        <span className="text-[10px] text-emerald-400 font-mono font-medium">
                          Done ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => removeTask(task.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                    title="Remove task"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Inline Add Task Form */}
            {isAdding && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-500/40 bg-purple-950/20">
                <input
                  autoFocus
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDownAdd}
                  placeholder="e.g. Solve 2 Two-Pointer questions..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTask}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shrink-0"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle("");
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions of the task list */}
        {!loadingTasks && !isAdding && (
          <div className="pt-2 flex items-center gap-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/10 hover:border-purple-500/30 bg-white/[0.02] hover:bg-purple-500/5 text-slate-400 hover:text-purple-300 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Target Task</span>
            </button>
            <button
              type="button"
              onClick={handleRegenerateTasks}
              disabled={isRegenerating}
              title="Re-align daily protocol with your current active roadmap"
              className="flex items-center justify-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/5 rounded-xl text-slate-400 hover:text-cyan-300 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-cyan-400" : ""}`}
              />
              <span className="hidden sm:inline">Sync Roadmap</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. NOTES & REFLECTION ACCORDION                          */}
      {/* ========================================================= */}
      <div className="mt-3">
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{notes ? "Edit Roadblock Notes" : "+ Add Notes & Learnings for AI Mentor"}</span>
          </button>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Daily Notes & Roadblocks (Fed into AI Mentor Context)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                className="text-[11px] text-slate-500 hover:text-white"
              >
                Hide
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g., Solved LC 15 (Two Pointers); struggled with DP memory optimization..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. PRIMARY CHECK-IN ACTION BUTTON                         */}
      {/* ========================================================= */}
      <div className="mt-4">
        <Button
          onClick={handleCheckin}
          disabled={status === "loading" || loadingTasks}
          className={`w-full rounded-xl h-11 text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg ${
            isCheckedInToday
              ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              : calculatedRate >= 50
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white shadow-purple-900/40"
                : calculatedRate > 0
                  ? "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
              <span>Syncing Check-in...</span>
            </span>
          ) : isCheckedInToday ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Update Today's Check-in ({calculatedRate}%)</span>
            </span>
          ) : tasks.length === 0 ? (
            <span>Generate Today's Plan from Roadmap</span>
          ) : completedCount === 0 ? (
            <span>Check off completed tasks above to log check-in</span>
          ) : calculatedRate >= 50 ? (
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Complete Daily Check-in & Extend Streak ({calculatedRate}%)</span>
            </span>
          ) : (
            <span>Log Check-in ({calculatedRate}% - 50% needed for streak)</span>
          )}
        </Button>
      </div>
    </div>
  );
}
