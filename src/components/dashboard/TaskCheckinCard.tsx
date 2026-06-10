import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { Skeleton } from "../ui/skeleton";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export function TaskCheckinCard({
  onCheckinComplete,
}: {
  onCheckinComplete: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // NEW: Visual indicator for the auto-save functionality
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

  useEffect(() => {
    const fetchTodayTasks = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`${baseUrl}/api/tasks/today`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        const json = await res.json();
        if (json.success) {
          setTasks(json.data);
          if (json.isCheckedIn) setStatus("success");
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTodayTasks();
  }, [baseUrl]);

  // --- PERSISTENT DRAFT AUTO-SAVE ---
  const syncDraftToDatabase = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    setSaveState("saving");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch(`${baseUrl}/api/tasks/today`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ tasks: updatedTasks }),
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000); // Clear the 'saved' message after 2s
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

  const handleAddCustomTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTaskTitle.trim() !== "") {
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
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const calculatedRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // --- END OF DAY FINAL SUBMISSION ---
  const handleCheckin = async () => {
    // Defensive check: Don't let users accidentally log 0% without explicitly confirming
    if (
      calculatedRate === 0 &&
      !window.confirm(
        "WARNING: You are about to log a 0% failure for today. Are you sure your day is over?",
      )
    ) {
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      const res = await fetch(`${baseUrl}/api/tasks/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          completionRate: calculatedRate,
          completedTasks: tasks,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution sync failed.");

      setStatus("success");
      onCheckinComplete();
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)] flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-3 px-6">
          <div className="w-16 h-16 bg-[#5cb85c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#5cb85c]" />
          </div>
          <p className="text-white font-bold text-xl tracking-tight">
            Execution Logged.
          </p>
          <p className="text-white/50 text-sm">
            Your telemetry for today has been written to the Decision Engine.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0F1117] border-[#2f2f2f] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)] h-full flex flex-col min-h-[500px]">
      <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xs text-white/30 font-bold tracking-[0.2em] uppercase">
            Today's Protocol
          </CardTitle>
          {/* Dynamic Save Indicator so the user knows they don't need to click the big button to save */}
          {saveState === "saving" && (
            <span className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
              <Save className="w-3 h-3 animate-pulse" /> Saving...
            </span>
          )}
          {saveState === "saved" && (
            <span className="text-[10px] text-[#5cb85c] uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
        <Zap
          className={`w-4 h-4 ${calculatedRate >= 80 ? "text-orange-500" : calculatedRate >= 50 ? "text-cyan-400" : "text-white/20"}`}
        />
      </CardHeader>

      <CardContent className="px-6 pb-6 flex-1 flex flex-col space-y-5">
        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-between items-end">
          <label className="text-sm font-medium text-white/80">
            Projected Rate
          </label>
          <span
            className="text-3xl font-bold text-white tracking-tighter"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {calculatedRate}%
          </span>
        </div>

        <div className="bg-[#05030a] rounded-2xl p-4 flex-1 border border-[#2f2f2f]/50 flex flex-col">
          {loadingTasks ? (
            <div className="space-y-3 flex-1">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
              {tasks.length === 0 && !isAdding && (
                <p className="text-white/40 text-sm text-center py-4">
                  Protocol is empty. Add a task.
                </p>
              )}

              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${task.completed ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                >
                  <button className="mt-0.5 text-[#8B5CF6] focus:outline-none flex-shrink-0">
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-white/30" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight truncate ${task.completed ? "text-white line-through opacity-70" : "text-white"}`}
                    >
                      {task.title}
                    </p>
                    <p
                      className={`text-[10px] uppercase tracking-wider mt-1 font-bold ${task.category === "Custom Override" ? "text-orange-400" : "text-[#8B5CF6]"}`}
                    >
                      {task.category}
                    </p>
                  </div>
                  <button
                    onClick={(e) => removeTask(task.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {isAdding && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#8B5CF6]/50 bg-[#8B5CF6]/5">
                  <Square className="w-5 h-5 text-[#8B5CF6]/30 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleAddCustomTask}
                    onBlur={() => {
                      if (!newTaskTitle) setIsAdding(false);
                    }}
                    placeholder="Type task and hit Enter..."
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-white/30"
                  />
                </div>
              )}
            </div>
          )}

          {!loadingTasks && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 border border-dashed border-white/10 hover:border-white/20 rounded-xl text-white/40 hover:text-white/60 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Task
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Log roadblock notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-[#05030a] border border-[#2f2f2f] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
        />

        {/* DYNAMIC BUTTON: Explicitly tells the user what will happen when clicked */}
        <Button
          onClick={handleCheckin}
          disabled={status === "loading" || loadingTasks || tasks.length === 0}
          className={`w-full rounded-xl h-12 font-bold tracking-wide transition-all ${
            calculatedRate === 0
              ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
              : "bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          }`}
        >
          {status === "loading"
            ? "Syncing to Engine..."
            : calculatedRate === 0
              ? "End Day: Log 0% Failure"
              : `End Day: Log ${calculatedRate}% Success`}
        </Button>
      </CardContent>
    </Card>
  );
}
