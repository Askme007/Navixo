//src\components\pages\RoadmapPage.tsx

import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  LogOut,
  Sparkles,
  Download,
  Share2,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  PlayCircle,
  Clock,
  Lightbulb,
  Youtube,
  FileText,
  Code,
  MessageSquare,
  Save,
  TrendingUp,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { RoadmapStep } from "../RoadmapStep";
import { ShareButton } from "../ShareButton";
import { DownloadPDFButton } from "../DownloadPDFButton";
import { SaveRoadmapButton } from "../SaveRoadmapButton";
import { SavedConfirmationPopup } from "../SavedConfirmationPopup";

interface RoadmapPageProps {
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToChat?: (message: string) => void;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "not-started" | "in-progress" | "done";
  position: { x: number; y: number };
  resources?: Resource[];
  mentorTip?: string;
}

interface Resource {
  type: "youtube" | "course" | "docs" | "project";
  title: string;
  provider: string;
  url: string;
}

export function RoadmapPage({
  userName,
  onBack,
  onLogout,
  onNavigateToChat,
}: RoadmapPageProps) {
  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "creating" | "processing" | "completed" | "failed"
  >("idle");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);
  const [generatingText, setGeneratingText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const loadLatestRoadmap = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user || !roadmapId) return;

    const { data: roadmap } = await supabase
      .from("user_roadmaps")
      .select("*")
      .eq("id", roadmapId)
      .single();

    if (!roadmap) return;

    setGenerationStatus(roadmap.generation_status);
    setInput(roadmap.title);

    const { data: steps } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("step_order");

    // ⛔ REMOVE THIS LINE COMPLETELY
    // if (!steps?.length) return;

    if (!steps || steps.length === 0) {
      setRoadmapNodes([]);
      setRoadmapGenerated(false);
      return;
    }

    const { data: resources } = await supabase
      .from("step_resources")
      .select("*")
      .in(
        "step_id",
        steps.map((s) => s.id),
      );

    const rebuiltNodes: RoadmapNode[] = steps.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      duration: step.duration,
      level: step.level,
      status: step.status,
      position: { x: 50, y: 0 },
      mentorTip: step.mentor_tip,
      resources: resources
        ?.filter((r) => r.step_id === step.id)
        .map((r) => ({
          type: r.type,
          title: r.title,
          provider: r.provider,
          url: r.url,
        })),
    }));

    setRoadmapNodes(rebuiltNodes);
    setRoadmapGenerated(true);
    setSelectedNode(rebuiltNodes[0]);
    setVisibleNodes(rebuiltNodes.map((n) => n.id));
  };
  useEffect(() => {
    setRoadmapGenerated(false);
    setRoadmapNodes([]);
    setSelectedNode(null);
  }, [roadmapId]);

  useEffect(() => {
    if (roadmapId) loadLatestRoadmap();
  }, [roadmapId]);

  // Scroll reset on mount - always load at top
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!roadmapId) return;

    const timer = setInterval(async () => {
      const { data } = await supabase
        .from("user_roadmaps")
        .select("generation_status")
        .eq("id", roadmapId)
        .single();

      if (!data?.generation_status) return;

      setGenerationStatus(data.generation_status);

      if (data.generation_status === "completed") {
        clearInterval(timer);
        await loadLatestRoadmap();
        setRoadmapGenerated(true);
        setGenerationStatus("completed");
        return;
      }

      if (data.generation_status === "failed") {
        clearInterval(timer);
        setGenerationStatus("failed");
        return;
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [roadmapId]);
  const processingMessages = [
    "Warming up the neural engine…",
    "Mapping core skill clusters…",
    "Designing your learning path…",
    "Fetching curated resources…",
    "Structuring milestones…",
    "Finalizing roadmap intelligence…",
  ];

  const [processMsgIndex, setProcessMsgIndex] = useState(0);

  useEffect(() => {
    if (!["creating", "processing"].includes(generationStatus)) return;

    const timer = setInterval(() => {
      setProcessMsgIndex((prev) => (prev + 1) % processingMessages.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [generationStatus]);

  const examplePrompts = [
    "Full Stack Web Developer",
    "AI/ML Engineer",
    "Data Analyst",
    "Mobile App Developer",
    "DevOps Engineer",
    "UI/UX Designer",
  ];

  const handleStepStatusChange = async (
    stepId: string,
    newStatus: "not-started" | "in-progress" | "done",
  ) => {
    await supabase
      .from("roadmap_steps")
      .update({ status: newStatus })
      .eq("id", stepId);

    setRoadmapNodes((prev) =>
      prev.map((n) => (n.id === stepId ? { ...n, status: newStatus } : n)),
    );

    if (selectedNode?.id === stepId) {
      setSelectedNode({ ...selectedNode, status: newStatus });
    }
  };

  const handleSaveRoadmap = async () => {
    try {
      setIsSaving(true);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Not authenticated");

      const { data: roadmap, error: roadmapErr } = await supabase
        .from("user_roadmaps")
        .insert({
          user_id: user.id,
          title: input,
          career_goal: input,
        })
        .select()
        .single();

      if (roadmapErr) throw roadmapErr;

      for (let i = 0; i < roadmapNodes.length; i++) {
        const node = roadmapNodes[i];

        const { data: step, error: stepErr } = await supabase
          .from("roadmap_steps")
          .insert({
            roadmap_id: roadmap.id,
            step_order: i + 1,
            title: node.title,
            description: node.description,
            level: node.level,
            duration: node.duration,
            mentor_tip: node.mentorTip,
            status: node.status,
          })
          .select()
          .single();

        if (stepErr) throw stepErr;

        if (node.resources?.length) {
          const resources = node.resources.map((r) => ({
            step_id: step.id,
            type: r.type,
            title: r.title,
            provider: r.provider,
            url: r.url,
          }));

          const { error: resErr } = await supabase
            .from("step_resources")
            .insert(resources);

          if (resErr) throw resErr;
        }
      }

      setShowPopup(true);
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = async () => {
    if (!roadmapId) {
      setGenerationStatus("idle");
      return;
    }

    await supabase
      .from("user_roadmaps")
      .update({ generation_status: "idle" })
      .eq("id", roadmapId);

    setGenerationStatus("idle");
    setRoadmapGenerated(false);
    setRoadmapNodes([]);
    setSelectedNode(null);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleViewDashboard = () => {
    setShowPopup(false);
    onBack(); // Navigate to dashboard
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    if (generationStatus !== "idle") return;

    setGenerationStatus("creating");

    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const res = await fetch(`${API_URL}/api/roadmap/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ career: input }),
    });

    const { roadmapId } = await res.json();

    setGenerationStatus("processing");
    navigate("/roadmap/" + roadmapId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "from-blue-400 to-blue-600";
      case "intermediate":
        return "from-amber-400 to-amber-600";
      case "advanced":
        return "from-purple-400 to-purple-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "intermediate":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "advanced":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-500" />;
      case "course":
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case "docs":
        return <FileText className="w-4 h-4 text-gray-400" />;
      case "project":
        return <Code className="w-4 h-4 text-purple-400" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const completedCount = roadmapNodes.filter((n) => n.status === "done").length;
  const totalCount = roadmapNodes.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleStatusChange = async (
    id: string,
    newStatus: "not-started" | "in-progress" | "done",
  ) => {
    setRoadmapNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)),
    );

    if (selectedNode?.id === id) {
      setSelectedNode({ ...selectedNode, status: newStatus });
    }

    const { error } = await supabase
      .from("roadmap_steps")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("DB update failed:", error.message);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen bg-[#0B0B0F] text-white relative overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/8 via-[#0B0B0F] to-[#8B5CF6]/8" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#050816] via-[#050816] to-[#020617] border-b border-white/10 sticky top-0 z-20 backdrop-blur-md">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="gap-1 md:gap-2 text-white hover:bg-white/5 hover:border-white/20 text-xs sm:text-sm border border-transparent"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#14F4C9]" />
                  <h2
                    className="text-white text-base sm:text-lg"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    AI Roadmap Generator
                  </h2>
                  {["creating", "processing"].includes(generationStatus) && (
                    <span className="ml-3 text-xs text-[#14F4C9] tracking-wide animate-pulse">
                      AI is working…
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <span
                  className="text-[#E5E7EB] hidden sm:inline text-sm"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                >
                  {userName}
                </span>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="gap-1 md:gap-2 border-white/20 bg-transparent text-white hover:bg-white/5 hover:text-white text-xs sm:text-sm px-2 sm:px-4"
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 min-h-[calc(100vh-80px)]">
          <div className="flex flex-col gap-4 md:gap-5 pb-4 md:pb-6">
            {/* Top Section - Input Area */}
            <div className="bg-gradient-to-br from-[#13151B]/90 to-[#070814]/90 border border-white/10 rounded-2xl p-5 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <div className="max-w-4xl mx-auto">
                <h3
                  className="text-white mb-2 text-lg md:text-xl"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Ask Navixo
                </h3>
                <p
                  className="text-[#9CA3AF] text-sm md:text-base mb-5"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                >
                  What roadmap do you want to explore today?
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                  <Input
                    value={input}
                    disabled={generationStatus !== "idle" || roadmapGenerated}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Full Stack Web Developer, AI Researcher, Data Analyst..."
                    className="flex-1 bg-[#050816]/80 border-white/12 text-white placeholder:text-[#6B7280] h-12 rounded-2xl focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/30"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={generationStatus !== "idle" || roadmapGenerated}
                    className="h-12 px-6 sm:px-8 bg-gradient-to-r from-[#FFFFFF] via-[#F9FAFB] to-[#E5E7EB] text-black hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)] flex-1 sm:flex-none rounded-2xl disabled:opacity-50"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {["creating", "processing"].includes(generationStatus) ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-black animate-ping" />
                        <span className="hidden sm:inline ml-2">
                          Generating...
                        </span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span className="hidden sm:inline ml-2">Generate</span>
                      </>
                    )}
                  </Button>
                  {roadmapGenerated && (
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-2xl border-white/20 text-white"
                      onClick={() => {
                        setInput("");
                        setRoadmapGenerated(false);
                        setGenerationStatus("idle");
                        setRoadmapNodes([]);
                        setSelectedNode(null);
                        navigate("/roadmap", { replace: true });
                      }}
                    >
                      New Roadmap
                    </Button>
                  )}
                </div>
                {["creating", "processing"].includes(generationStatus) && (
                  <div className="mt-2 flex items-center gap-3 text-sm text-[#9CA3AF]">
                    <div className="w-2 h-2 rounded-full bg-[#14F4C9] animate-bounce" />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      {processingMessages[processMsgIndex]}
                    </span>
                  </div>
                )}

                {!roadmapGenerated && !roadmapId && (
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((prompt, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-[#050816]/80 text-[#E5E7EB] border border-white/10 cursor-pointer hover:bg-white/10 hover:text-white transition-colors px-3 py-1.5 rounded-full"
                        onClick={() => setInput(prompt)}
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
              {/* Left Section - Roadmap Visualization */}
              <div className="lg:col-span-8 bg-gradient-to-br from-[#13151B]/95 to-[#050816]/95 border border-white/10 rounded-2xl p-5 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                {/* 🟡 SHOW PROCESSING STATE */}
                {!roadmapGenerated &&
                  ["creating", "processing"].includes(generationStatus) && (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-gradient-to-r from-[#0B1120] via-[#1E293B] to-[#0B1120] rounded-xl border border-white/10"
                        />
                      ))}
                    </div>
                  )}

                {/* 🟣 SHOW EMPTY STATE */}
                {!roadmapGenerated &&
                  generationStatus === "idle" &&
                  !roadmapId && (
                    <div className="min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center text-center px-4">
                      ... Ready to Build UI ...
                    </div>
                  )}

                {/* 🟢 SHOW ROADMAP */}
                {roadmapGenerated && (
                  <div className="space-y-4">
                    {roadmapNodes.map((node, index) => {
                      const isVisible = visibleNodes.includes(node.id);
                      const prevNode =
                        index > 0 ? roadmapNodes[index - 1] : null;

                      return (
                        <div key={node.id}>
                          {prevNode && isVisible && (
                            <div className="flex justify-center mb-3">
                              <div
                                className={`w-0.5 h-8 bg-gradient-to-b ${getLevelColor(
                                  node.level,
                                )} opacity-60 rounded-full`}
                              />
                            </div>
                          )}

                          <RoadmapStep
                            id={node.id}
                            title={node.title}
                            description={node.description}
                            duration={node.duration}
                            level={node.level}
                            status={node.status}
                            isSelected={selectedNode?.id === node.id}
                            isVisible={isVisible}
                            index={index}
                            onClick={() => setSelectedNode(node)}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                {generationStatus === "failed" && (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-red-400">
                    Generation failed. Try again in a few seconds.
                    <Button className="mt-4" onClick={handleRetry}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Section - Resource & Mentorship Panel */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#111827]/95 to-[#020617]/95 border border-white/10 rounded-2xl p-5 md:p-7 shadow-lg backdrop-blur-2xl">
                {selectedNode ? (
                  <div className="space-y-5 md:space-y-6">
                    {/* Selected Node Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#14F4C9]" />
                        <h3
                          className="text-white text-sm md:text-base"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          AI Recommendations
                        </h3>
                      </div>
                      <div className="p-4 md:p-5 bg-[#050816]/90 border border-white/10 rounded-xl">
                        <h4
                          className="text-white mb-1 text-sm md:text-base"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          {selectedNode.title}
                        </h4>
                        <p
                          className="text-xs md:text-sm text-[#9CA3AF]"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                          }}
                        >
                          {selectedNode.duration} • {selectedNode.level}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Resources */}
                    <div>
                      <h4
                        className="text-white mb-3 flex items-center gap-2 text-sm md:text-base"
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
                        Top Resources
                      </h4>
                      <div className="space-y-2.5">
                        {selectedNode.resources?.map((resource, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              const q = encodeURIComponent(
                                `${resource.title} ${resource.provider} ${resource.type}`,
                              );
                              window.open(
                                `https://www.google.com/search?q=${q}`,
                                "_blank",
                              );
                            }}
                            className="block cursor-pointer"
                          >
                            <div className="p-3 md:p-4 bg-[#050816]/90 hover:bg-[#0B1120] border border-white/10 rounded-xl transition-all cursor-pointer group">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    resource.type === "youtube"
                                      ? "bg-gradient-to-br from-red-500/20 to-red-600/20"
                                      : resource.type === "course"
                                        ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20"
                                        : resource.type === "docs"
                                          ? "bg-gradient-to-br from-gray-500/20 to-gray-600/20"
                                          : "bg-gradient-to-br from-purple-500/20 to-purple-600/20"
                                  }`}
                                >
                                  {getResourceIcon(resource.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="text-sm md:text-base text-white group-hover:text-[#14F4C9] transition-colors"
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {resource.title}
                                  </p>
                                  <p
                                    className="text-xs text-[#9CA3AF]"
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: 400,
                                    }}
                                  >
                                    {resource.provider}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#14F4C9] transition-colors flex-shrink-0" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Mentor Tip */}
                    {selectedNode.mentorTip && (
                      <div className="p-4 md:p-5 bg-gradient-to-br from-[#FBBF24]/10 via-[#F97316]/10 to-transparent border border-[#FBBF24]/40 rounded-2xl">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-[#FBBF24]" />
                          </div>
                          <div>
                            <h4
                              className="text-white text-sm md:text-base mb-2"
                              style={{
                                fontFamily: "Space Grotesk, sans-serif",
                                fontWeight: 600,
                              }}
                            >
                              AI Mentor Tip
                            </h4>
                            <p
                              className="text-sm md:text-base text-[#E5E7EB] italic"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 400,
                              }}
                            >
                              "{selectedNode.mentorTip}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ask AI Mentor Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-[#3B82F6] via-[#14F4C9] to-[#8B5CF6] hover:scale-105 transition-transform text-white gap-2 text-sm md:text-base rounded-2xl"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                      }}
                      onClick={() => {
                        if (onNavigateToChat) {
                          const roadmapContext = `Hi PAI, here is my current roadmap. I want to ask further questions about it.\\n\\n[Roadmap context will be inserted here]`;
                          onNavigateToChat(roadmapContext);
                        }
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask AI Mentor
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[200px] md:min-h-[500px] flex flex-col items-center justify-center text-center p-4 md:p-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/15 rounded-full flex items-center justify-center mb-4 border border-[#8B5CF6]/40">
                      <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-[#8B5CF6]" />
                    </div>
                    <p
                      className="text-[#9CA3AF] text-sm md:text-base"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      Select a milestone from the roadmap to see personalized
                      resources and mentor tips
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Utility Bar */}
            {roadmapGenerated && (
              <div className="bg-[#050816]/95 border border-white/10 rounded-2xl p-4 md:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p
                          className="text-sm md:text-base text-white"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          You've completed{" "}
                          <span
                            className="text-emerald-400"
                            style={{ fontWeight: 600 }}
                          >
                            {completedCount}/{totalCount} steps
                          </span>
                        </p>
                        <Progress
                          value={progressPercentage}
                          className="w-32 sm:w-48 h-2.5 mt-1.5 bg-[#111827]"
                        />
                      </div>
                    </div>
                    {progressPercentage === 100 && (
                      <span className="text-xl md:text-2xl animate-bounce">
                        🎉
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {!roadmapId && (
                      <SaveRoadmapButton
                        isSaving={isSaving}
                        onClick={handleSaveRoadmap}
                        className="rounded-2xl border-white/10 bg-[#0B1120]/90 hover:bg-[#111827] text-white hover:text-white"
                      />
                    )}
                    <DownloadPDFButton className="rounded-2xl border-white/10 bg-[#0B1120]/90 hover:bg-[#111827] text-white hover:text-white" />
                    <ShareButton className="rounded-2xl border-white/10 bg-[#0B1120]/90 hover:bg-[#111827] text-white hover:text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Confirmation Popup */}
      {showPopup && (
        <SavedConfirmationPopup
          onClose={handleClosePopup}
          onViewDashboard={handleViewDashboard}
        />
      )}
    </div>
  );
}
