import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  CheckSquare,
  Square,
  X,
  Plus,
  Save,
  RefreshCw,
  FileText,
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

function getCategoryLabel(category: string): string {
  if (category.includes("Roadmap")) return "Roadmap";
  if (category.includes("DSA")) return "DSA";
  if (category.includes("System Design")) return "System Design";
  if (category.includes("Core CS")) return "Core CS";
  if (category.includes("Revision")) return "Revision";
  if (category.includes("Custom")) return "Custom";
  return category;
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
  };

  const handleAddCustomTask = () => {
    if (newTaskTitle.trim() === "") return;

    const customTask: Task = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: "Custom",
      completed: false,
    };
    const newTasks = [...tasks, customTask];
    syncDraftToDatabase(newTasks);
    setNewTaskTitle("");
    setIsAdding(false);
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
          ? "Daily check-in logged! Streak extended."
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
    <div className="bg-[#0F1117] border border-[#2f2f2f] rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] flex flex-col h-full min-h-[500px]">
      {/* ========================================================= */}
      {/* 1. HEADER: CLEAN, RESTRAINED MINIMALISM                    */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#8B5CF6]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-base font-semibold text-white tracking-tight"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Daily Execution Plan
                </h2>
                {saveState === "saving" && (
                  <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Save className="w-3 h-3 animate-pulse" /> Saving
                  </span>
                )}
                {saveState === "saved" && (
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Target milestones aligned with your active roadmap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCheckedInToday ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Checked in</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>In progress</span>
              </span>
            )}

            {!loadingTasks && tasks.length > 0 && (
              <button
                type="button"
                onClick={handleRegenerateTasks}
                disabled={isRegenerating}
                title="Re-align daily tasks with current active roadmap"
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/40 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-white" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Linked Roadmap Context */}
        {activeRoadmapTitle && (
          <div className="flex items-center justify-between text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/60">
            <span className="truncate flex items-center gap-1.5">
              <span className="text-white/40">Roadmap:</span>
              <strong className="text-white font-medium truncate">{activeRoadmapTitle}</strong>
            </span>
            {onNavigateToRoadmap && (
              <button
                onClick={onNavigateToRoadmap}
                className="text-[#8B5CF6] hover:text-purple-300 font-medium ml-2 shrink-0 transition-colors cursor-pointer"
              >
                View &rarr;
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. PROGRESS BAR: CLEAN SINGLE-ACCENT                      */}
      {/* ========================================================= */}
      <div className="py-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70 font-medium">
            Progress: {completedCount} of {totalCount} completed
          </span>
          <span className="font-semibold text-white font-mono">
            {calculatedRate}%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8B5CF6] rounded-full transition-all duration-300"
            style={{ width: `${calculatedRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/50">
          <span>
            {calculatedRate >= 50
              ? "Streak target met (+1 streak day)"
              : `Complete at least 50% to extend streak (${currentStreak} day streak)`}
          </span>
          {calculatedRate === 100 && (
            <span className="text-white/80 font-medium">100% Complete</span>
          )}
        </div>
      </div>

      {/* Checked-in Info Banner */}
      {isCheckedInToday && (
        <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-white">
              Today's execution logged ({calculatedRate}%).
            </p>
            <p className="text-white/50 text-[11px]">
              Telemetry synced with AI Mentor. You can still add tasks or update below.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mb-3 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TASK ITEMS LIST: CLEAN MINIMAL ROWS                    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#07090e] rounded-2xl p-3 border border-white/5 space-y-2">
        {loadingTasks ? (
          <div className="space-y-2 flex-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[240px] pr-1 custom-scrollbar">
            {tasks.length === 0 && !isAdding && (
              <div className="text-center py-6 px-4 space-y-2">
                <p className="text-white/40 text-xs">
                  No tasks scheduled for today.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerateTasks}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-colors"
                >
                  Generate Plan from Roadmap
                </button>
              </div>
            )}

            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  task.completed
                    ? "bg-white/[0.01] border-white/5 opacity-70"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 focus:outline-none shrink-0"
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-[#8B5CF6]" />
                  ) : (
                    <Square className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs sm:text-sm font-medium leading-snug ${
                      task.completed ? "line-through text-white/40" : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/50 text-[10px] font-mono">
                      {getCategoryLabel(task.category)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => removeTask(task.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 hover:bg-white/5 rounded transition-all shrink-0"
                  title="Remove task"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {isAdding && (
              <div className="flex items-center gap-2 p-2 rounded-xl border border-white/20 bg-white/5">
                <input
                  autoFocus
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDownAdd}
                  placeholder="Type task and press Enter..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTask}
                  className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium transition-colors shrink-0"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskTitle("");
                  }}
                  className="p-1 text-white/40 hover:text-white rounded transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {!loadingTasks && !isAdding && (
          <div className="pt-2 flex items-center gap-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
            <button
              type="button"
              onClick={handleRegenerateTasks}
              disabled={isRegenerating}
              title="Re-align daily protocol with your current active roadmap"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/20 rounded-xl text-white/50 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-white" : ""}`}
              />
              <span className="hidden sm:inline">Sync Roadmap</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. NOTES / ROADBLOCKS (OPTIONAL)                          */}
      {/* ========================================================= */}
      <div className="mt-3">
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{notes ? "Edit Roadblock Notes" : "+ Add Notes / Roadblocks"}</span>
          </button>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Roadblock Notes (Saved with Check-in)</span>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                className="text-[11px] text-white/40 hover:text-white"
              >
                Hide
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Reviewed Process Scheduling; solved LC 15..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. PRIMARY BUTTON: CLEAN NAVIXO PURPLE / MINIMALIST      */}
      {/* ========================================================= */}
      <div className="mt-4">
        <Button
          onClick={handleCheckin}
          disabled={status === "loading" || loadingTasks}
          className={`w-full rounded-xl h-11 text-xs sm:text-sm font-medium transition-all ${
            isCheckedInToday
              ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/20"
          }`}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Check-in...</span>
            </span>
          ) : isCheckedInToday ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Update Check-in ({calculatedRate}%)</span>
            </span>
          ) : tasks.length === 0 ? (
            <span>Generate Plan from Roadmap</span>
          ) : completedCount === 0 ? (
            <span>Check off tasks to log check-in</span>
          ) : (
            <span>Log Daily Check-in ({calculatedRate}%)</span>
          )}
        </Button>
      </div>
    </div>
  );
}
