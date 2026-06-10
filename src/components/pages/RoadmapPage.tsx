// src/components/pages/RoadmapPage.tsx

import { supabase } from "../../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { authService } from "../../services/auth.service";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Code,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  Loader2,
  LogOut,
  MessageSquare,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Youtube,
} from "lucide-react";
import { ShareButton } from "../ShareButton";
import { DownloadPDFButton } from "../DownloadPDFButton";
import { SaveRoadmapButton } from "../SaveRoadmapButton";
import { SavedConfirmationPopup } from "../SavedConfirmationPopup";

type GenerationStatus =
  | "idle"
  | "creating"
  | "processing"
  | "completed"
  | "failed";

type RoadmapStatus = "not-started" | "in-progress" | "done";
type RoadmapLevel = "beginner" | "intermediate" | "advanced";
type ResourceType = "youtube" | "course" | "docs" | "project";

interface RoadmapPageProps {
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToChat?: (message: string) => void;
}

interface RoadmapResource {
  type: ResourceType;
  title: string;
  provider: string;
  url: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: RoadmapLevel;
  status: RoadmapStatus;
  resources?: RoadmapResource[];
  mentorTip?: string;
}

const processingMessages = [
  "Warming up the roadmap engine…",
  "Mapping your preparation phases…",
  "Selecting the next best steps…",
  "Attaching curated resources…",
  "Finalizing your roadmap…",
];

const examplePrompts = [
  "Full Stack Web Developer",
  "AI/ML Engineer",
  "Data Analyst",
  "Android Developer",
  "DevOps Engineer",
  "Product Designer",
];

const generationCopy: Record<GenerationStatus, string> = {
  idle: "Ready to generate",
  creating: "Creating roadmap…",
  processing: "Processing roadmap…",
  completed: "Roadmap ready",
  failed: "Generation failed",
};

function normalizeStatus(value: unknown): RoadmapStatus {
  if (value === "in-progress" || value === "done") return value;
  return "not-started";
}

function normalizeLevel(value: unknown): RoadmapLevel {
  if (value === "intermediate" || value === "advanced") return value;
  return "beginner";
}

function normalizeResourceType(value: unknown): ResourceType {
  if (value === "youtube" || value === "course" || value === "project") {
    return value;
  }
  return "docs";
}

function getStatusIcon(status: RoadmapStatus) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "in-progress":
      return <PlayCircle className="h-4 w-4 text-sky-400" />;
    default:
      return <Circle className="h-4 w-4 text-slate-500" />;
  }
}

function getResourceIcon(type: ResourceType) {
  switch (type) {
    case "youtube":
      return <Youtube className="h-4 w-4 text-red-400" />;
    case "course":
      return <BookOpen className="h-4 w-4 text-sky-400" />;
    case "project":
      return <Code className="h-4 w-4 text-violet-400" />;
    default:
      return <FileText className="h-4 w-4 text-slate-300" />;
  }
}

function levelBadgeClass(level: RoadmapLevel) {
  switch (level) {
    case "beginner":
      return "border-sky-500/20 bg-sky-500/10 text-sky-100";
    case "intermediate":
      return "border-amber-500/20 bg-amber-500/10 text-amber-100";
    case "advanced":
      return "border-violet-500/20 bg-violet-500/10 text-violet-100";
  }
}

function statusBadgeClass(status: RoadmapStatus) {
  switch (status) {
    case "done":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
    case "in-progress":
      return "border-sky-500/20 bg-sky-500/10 text-sky-100";
    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-200";
  }
}

function GenerationPill({
  generationStatus,
  message,
}: {
  generationStatus: GenerationStatus;
  message: string;
}) {
  const isLoading =
    generationStatus === "creating" || generationStatus === "processing";

  const pillClass =
    generationStatus === "failed"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
      : generationStatus === "completed"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
        : "border-white/10 bg-white/5 text-slate-200";

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm ${pillClass}`}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-current shrink-0" />
      )}
      <span className="truncate">{message}</span>
    </div>
  );
}

function RoadmapStepCard({
  step,
  index,
  expanded,
  onToggle,
  onStatusChange,
  onAskMentor,
  statusUpdating,
}: {
  step: RoadmapNode;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (
    stepId: string,
    newStatus: RoadmapStatus,
  ) => Promise<void> | void;
  onAskMentor?: () => void;
  statusUpdating: boolean;
}) {
  const resources = step.resources ?? [];

  return (
    <Card className="overflow-hidden border-white/10 bg-white/5 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950/70">
          {getStatusIcon(step.status)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Step {index + 1}
            </span>
            <Badge
              variant="secondary"
              className={`rounded-full border px-2.5 py-0.5 text-[11px] ${levelBadgeClass(
                step.level,
              )}`}
            >
              {step.level}
            </Badge>
            <Badge
              variant="secondary"
              className={`rounded-full border px-2.5 py-0.5 text-[11px] ${statusBadgeClass(
                step.status,
              )}`}
            >
              {step.status.replace("-", " ")}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {step.duration}
            </span>
          </div>

          <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">
            {step.title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {step.description}
          </p>
        </div>

        <div className="shrink-0 pt-1 text-slate-400">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {expanded && (
        <CardContent className="border-t border-white/10 p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                Update status
              </p>
              <div className="flex flex-wrap gap-2">
                {(["not-started", "in-progress", "done"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => onStatusChange(step.id, status)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        step.status === status
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {status === "not-started"
                        ? "Not started"
                        : status === "in-progress"
                          ? "In progress"
                          : "Done"}
                    </button>
                  ),
                )}
              </div>
            </div>

            {step.mentorTip && (
              <div className="rounded-2xl border border-amber-500/15 bg-amber-500/8 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-300" />
                  <span className="text-sm font-medium text-white">
                    Mentor tip
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-200">
                  {step.mentorTip}
                </p>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-white">Resources</h4>
                <span className="text-xs text-slate-500">
                  {resources.length} linked
                </span>
              </div>

              {resources.length > 0 ? (
                <div className="grid gap-2">
                  {resources.map((resource, resourceIndex) => (
                    <button
                      key={`${resource.title}-${resourceIndex}`}
                      type="button"
                      onClick={() => {
                        const query = encodeURIComponent(
                          `${resource.title} ${resource.provider} ${resource.type}`,
                        );

                        window.open(
                          `https://www.google.com/search?q=${query}`,
                          "_blank",
                        );
                      }}
                      className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-left transition hover:border-white/20 hover:bg-white/5"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        {getResourceIcon(resource.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {resource.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {resource.provider}
                        </p>
                      </div>

                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                  No resources linked yet.
                </div>
              )}
            </div>

            {onAskMentor && (
              <Button
                type="button"
                onClick={onAskMentor}
                className="w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-200"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI Mentor about this step
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function RoadmapPage({
  userName,
  onBack,
  onLogout,
  onNavigateToChat,
}: RoadmapPageProps) {
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>("idle");
  const [input, setInput] = useState("");
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [processMsgIndex, setProcessMsgIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "";

  const isLoading =
    generationStatus === "creating" || generationStatus === "processing";
  const generationLocked = isLoading || roadmapNodes.length > 0;
  const hasRoadmap = roadmapNodes.length > 0;

  const completedCount = roadmapNodes.filter(
    (node) => node.status === "done",
  ).length;
  const totalCount = roadmapNodes.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const loadLatestRoadmap = useCallback(async () => {
    if (!roadmapId) return;
    
    const { data } = await supabase.auth.getUser();
    
    const { data: roadmap, error: roadmapError } = await supabase
      .from("user_roadmaps")
      .select("*")
      .eq("id", roadmapId)
      .single();



    if (roadmapError || !roadmap) {
      setGenerationStatus("failed");
      setRoadmapNodes([]);
      setExpandedStepId(null);
      return;
    }
    if (roadmap.generation_status === "completed") {
      setGenerationStatus("completed");
    }
    const nextGenerationStatus: GenerationStatus =
      roadmap.generation_status === "creating" ||
      roadmap.generation_status === "processing" ||
      roadmap.generation_status === "completed" ||
      roadmap.generation_status === "failed"
        ? roadmap.generation_status
        : "idle";


    setGenerationStatus(nextGenerationStatus);
    console.log(
      "ROADMAP STATUS =",
      nextGenerationStatus
    );
    setInput(roadmap.title ?? roadmap.career_goal ?? "");

    const { data: steps, error: stepsError } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("step_order");
    
    if (stepsError) {
      console.error("Failed to load roadmap steps:", stepsError);
      setGenerationStatus("failed");
      return;
    }

    if (!steps?.length) {
      setRoadmapNodes([]);
      setExpandedStepId(null);
      return;
    }

    const { data: resources, error: resourcesError } = await supabase
      .from("step_resources")
      .select("*")
      .in(
        "step_id",
        steps.map((step) => step.id),
      );

    

    const rebuiltNodes: RoadmapNode[] = steps.map((step) => ({
      id: step.id,
      title: step.title ?? "",
      description: step.description ?? "",
      duration: step.duration ?? "",
      level: normalizeLevel(step.level),
      status: normalizeStatus(step.status),
      mentorTip: step.mentor_tip ?? "",
      resources: (resources ?? [])
        .filter((resource) => resource.step_id === step.id)
        .map((resource) => ({
          type: normalizeResourceType(resource.type),
          title: resource.title ?? "",
          provider: resource.provider ?? "",
          url: resource.url ?? "",
        })),
    }));
    setRoadmapNodes(rebuiltNodes);
    useEffect(() => {
      console.log("ROADMAP NODES CHANGED", roadmapNodes);
    }, [roadmapNodes]);
    setExpandedStepId((current) =>
      current && rebuiltNodes.some((node) => node.id === current)
        ? current
        : (rebuiltNodes[0]?.id ?? null),
    );
  }, [roadmapId]);

  useEffect(() => {
    setShowPopup(false);
    setProcessMsgIndex(0);
    if (!roadmapId) {
      setGenerationStatus("idle");
      setInput("");
    }
  }, [roadmapId]); 

  useEffect(() => {
    if (!roadmapId) return;

    const timer = setInterval(async () => {
      await loadLatestRoadmap();
    }, 2000);

    return () => clearInterval(timer);
  }, [roadmapId, loadLatestRoadmap]);

  useEffect(() => {
    if (!isLoading) {
      setProcessMsgIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setProcessMsgIndex((prev) => (prev + 1) % processingMessages.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  const handleGenerate = async () => {
    console.log("GENERATE CLICKED");
    if (!input.trim() || generationLocked) return;

    try {
      setGenerationStatus("creating");

      const token = authService.getToken();

        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await fetch(
          `${API_URL}/api/roadmap/generate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              career: input.trim(),
            }),
          }
        );

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.error || "Failed to generate roadmap.");
      }

      if (!body?.roadmapId) {
        throw new Error("Roadmap ID was not returned.");
      }

      setGenerationStatus("processing");
      navigate(`/roadmap/${body.roadmapId}`);

    } catch (error: any) {
      console.error("Generate failed:", error);
      setGenerationStatus("failed");
      alert(error?.message || "Failed to generate roadmap.");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleGenerate();
    }
  };

  const handleStatusChange = async (
    stepId: string,
    newStatus: RoadmapStatus,
  ) => {
    setStatusUpdatingId(stepId);

    try {
      setRoadmapNodes((prev) =>
        prev.map((node) =>
          node.id === stepId ? { ...node, status: newStatus } : node,
        ),
      );

      const { error } = await supabase
        .from("roadmap_steps")
        .update({ status: newStatus })
        .eq("id", stepId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Failed to update step status:", error);
      await loadLatestRoadmap();
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!roadmapNodes.length || generationLocked) return;

    try {
      setIsSaving(true);
      const user = authService.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: roadmap, error: roadmapError } = await supabase
        .from("user_roadmaps")
        .insert({
          user_id: user.id,
          title: input.trim(),
          career_goal: input.trim(),
        })
        .select()
        .single();

      if (roadmapError || !roadmap) {
        throw roadmapError ?? new Error("Failed to save roadmap");
      }

      for (let index = 0; index < roadmapNodes.length; index += 1) {
        const node = roadmapNodes[index];

        const { data: step, error: stepError } = await supabase
          .from("roadmap_steps")
          .insert({
            roadmap_id: roadmap.id,
            step_order: index + 1,
            title: node.title,
            description: node.description,
            level: node.level,
            duration: node.duration,
            mentor_tip: node.mentorTip,
            status: node.status,
          })
          .select()
          .single();

        if (stepError || !step) {
          throw stepError ?? new Error("Failed to save step");
        }

        if (node.resources?.length) {
          const resourceRows = node.resources.map((resource) => ({
            step_id: step.id,
            type: resource.type,
            title: resource.title,
            provider: resource.provider,
            url: resource.url,
          }));

          const { error: resourceError } = await supabase
            .from("step_resources")
            .insert(resourceRows);

          if (resourceError) {
            throw resourceError;
          }
        }
      }

      setShowPopup(true);
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(error?.message || "Failed to save roadmap.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = async () => {
    try {
      if (roadmapId) {
        await supabase
          .from("user_roadmaps")
          .update({ generation_status: "idle" })
          .eq("id", roadmapId);
      }

      setGenerationStatus("idle");
      setRoadmapNodes([]);
      setExpandedStepId(null);
      setProcessMsgIndex(0);
    } catch (error) {
      console.error("Retry failed:", error);
      setGenerationStatus("idle");
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleViewDashboard = () => {
    setShowPopup(false);
    onBack();
  };

  const handleNewRoadmap = () => {
    setInput("");
    setGenerationStatus("idle");
    setRoadmapNodes([]);
    setExpandedStepId(null);
    setProcessMsgIndex(0);
    navigate("/roadmap", { replace: true });
  };

  
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/5 via-[#0B0B0F] to-violet-500/5" />

      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-10 gap-2 border border-transparent px-3 text-sm text-white hover:border-white/10 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                  Roadmap
                </h1>
              </div>
              <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                Execution-first roadmap generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[140px] truncate text-sm text-slate-300 md:block">
              {userName}
            </span>
            <Button
              variant="outline"
              onClick={onLogout}
              className="h-10 gap-2 border-white/15 bg-transparent px-3 text-sm text-white hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-4 sm:space-y-5">
          <Card className="border-white/10 bg-white/5 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-400">
                        Generate or continue a roadmap
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        What do you want to prepare for?
                      </h2>
                    </div>

                    <GenerationPill
                      generationStatus={generationStatus}
                      message={generationCopy[generationStatus]}
                    />
                  </div>

                  {isLoading && (
                    <p className="text-sm text-slate-400">
                      {processingMessages[processMsgIndex]}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={input}
                    disabled={generationLocked}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g. Full Stack Web Developer, AI/ML Engineer, Data Analyst"
                    className="h-12 min-w-0 rounded-2xl border-white/10 bg-[#050816]/80 px-4 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30"
                  />

                  <Button
                    onClick={handleGenerate}
                    disabled={generationLocked || !input.trim()}
                    className="h-12 rounded-2xl bg-white px-5 text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Generate</span>
                      </span>
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!generationLocked &&
                    examplePrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                      >
                        {prompt}
                      </button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {hasRoadmap && (
            <Card className="border-white/10 bg-white/5 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Roadmap progress</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-white">
                        {progressPercentage}%
                      </span>
                      <span className="pb-1 text-sm text-slate-400">
                        {completedCount}/{totalCount} steps done
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    {generationStatus === "completed"
                      ? "Roadmap ready"
                      : generationStatus === "processing"
                        ? "Processing"
                        : generationStatus === "creating"
                          ? "Creating"
                          : generationStatus === "failed"
                            ? "Failed"
                            : "Loaded"}
                  </Badge>
                </div>

                <Progress
                  value={progressPercentage}
                  className="mt-4 h-2.5 bg-white/10"
                />
              </CardContent>
            </Card>
          )}

          {isLoading && !hasRoadmap && (
            <div className="space-y-3">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 rounded bg-white/10" />
                      <div className="h-5 w-3/4 rounded bg-white/10" />
                      <div className="h-4 w-full rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {generationStatus === "idle" && !roadmapId && !hasRoadmap && (
            <Card className="border-white/10 bg-white/5 shadow-sm">
              <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center sm:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Sparkles className="h-7 w-7 text-cyan-300" />
                </div>
                <div className="max-w-xl space-y-1">
                  <h3 className="text-lg font-semibold text-white">
                    Start with a target role
                  </h3>
                  <p className="text-sm leading-6 text-slate-400">
                    Generate a roadmap for the role you want to prepare for. The
                    roadmap will be shown as steps with expandable resources,
                    status controls, and mentor tips.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {generationStatus === "failed" && !hasRoadmap && (
            <Card className="border-rose-500/15 bg-rose-500/8 shadow-sm">
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center sm:p-8">
                <p className="text-lg font-semibold text-rose-100">
                  Roadmap generation failed
                </p>
                <p className="max-w-xl text-sm leading-6 text-rose-100/80">
                  Try again after checking your input or request a fresh
                  roadmap.
                </p>
                <Button
                  onClick={handleRetry}
                  className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {hasRoadmap && (
            <div className="space-y-3 sm:space-y-4">
              {roadmapNodes.map((step, index) => {
                const expanded = expandedStepId === step.id;

                return (
                  <RoadmapStepCard
                    key={step.id}
                    step={step}
                    index={index}
                    expanded={expanded}
                    statusUpdating={statusUpdatingId === step.id}
                    onToggle={() =>
                      setExpandedStepId((current) =>
                        current === step.id ? null : step.id,
                      )
                    }
                    onStatusChange={handleStatusChange}
                    onAskMentor={
                      onNavigateToChat
                        ? () =>
                            onNavigateToChat(
                              `I need help with this roadmap step.\n\nStep: ${step.title}\nDescription: ${step.description}\nDuration: ${step.duration}\nLevel: ${step.level}\n\nGive me a short action plan and common mistakes to avoid.`,
                            )
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}

          {generationStatus === "completed" && !hasRoadmap && (
            <Card className="border-white/10 bg-white/5 shadow-sm">
              <CardContent className="p-6 text-sm text-slate-300">
                Roadmap status is complete, but no steps were returned yet.
                Refresh or generate a new roadmap.
              </CardContent>
            </Card>
          )}

          {(hasRoadmap || roadmapId) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400">Actions</p>
                  <p className="text-base font-medium text-white">
                    Save, export, or share this roadmap
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!roadmapId && hasRoadmap && (
                    <SaveRoadmapButton
                      isSaving={isSaving}
                      onClick={handleSaveRoadmap}
                      className="rounded-2xl border border-white/10 bg-transparent text-white hover:bg-white/5"
                    />
                  )}

                  <DownloadPDFButton className="rounded-2xl border border-white/10 bg-transparent text-white hover:bg-white/5" />
                  <ShareButton className="rounded-2xl border border-white/10 bg-transparent text-white hover:bg-white/5" />

                  {hasRoadmap && (
                    <Button
                      variant="outline"
                      onClick={handleNewRoadmap}
                      className="rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5"
                    >
                      New roadmap
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <SavedConfirmationPopup
          onClose={handleClosePopup}
          onViewDashboard={handleViewDashboard}
        />
      )}
    </div>
  );
}
