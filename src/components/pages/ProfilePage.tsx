import { useState, useEffect } from "react";
import { DashboardHeader } from "../dashboard/DashboardHeader";
import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { LogoutModal } from "../dashboard/LogoutModal";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { authService } from "../../services/auth.service";
import { toast } from "sonner";
import {
  User,
  Building2,
  Code2,
  Clock,
  BrainCircuit,
  GraduationCap,
  Save,
  RefreshCw,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";

interface ProfilePageProps {
  userName: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const COMMON_WEAK_TOPICS = [
  "Dynamic Programming",
  "Graph Theory & BFS/DFS",
  "Trees & Binary Search Trees",
  "System Design (HLD/LLD)",
  "Operating Systems & Concurrency",
  "DBMS, Indexing & SQL",
  "Computer Networks",
  "Greedy Algorithms",
  "Bit Manipulation",
  "Recursion & Backtracking",
  "Sliding Window & Two Pointers",
  "Trie & String Algorithms",
  "Heaps & Priority Queues",
  "Monotonic Stack & Queue",
  "Microservices & Caching",
];

export function ProfilePage({ userName, onNavigate, onLogout }: ProfilePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingLc, setSyncingLc] = useState(false);
  const [syncingCf, setSyncingCf] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(userName || "");
  const [targetRole, setTargetRole] = useState("Software Development Engineer (SDE)");
  const [targetCompanies, setTargetCompanies] = useState("Google, Microsoft, Amazon, Atlassian");
  const [primaryLanguage, setPrimaryLanguage] = useState("C++");
  const [dailyTime, setDailyTime] = useState("2-3");
  const [skillLevel, setSkillLevel] = useState("5");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [college, setCollege] = useState("");
  const [shortTermGoal, setShortTermGoal] = useState("");
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState("");

  // Platform handles
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [codeforcesUsername, setCodeforcesUsername] = useState("");

  // Platform profiles & telemetry
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [codeforcesData, setCodeforcesData] = useState<any>(null);
  const [memoryCount, setMemoryCount] = useState<number>(0);
  const [userState, setUserState] = useState<any>(null);

  const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (json.success && json.data) {
          const { profile, platforms, memoryMetrics, userState: state } = json.data;
          const ob = profile?.onboarding || {};

          setFullName(profile.full_name || userName || "");
          setTargetRole(ob.careerPath || ob.domain || "Software Development Engineer (SDE)");
          setTargetCompanies(Array.isArray(ob.targetCompanies) ? ob.targetCompanies.join(", ") : (ob.targetCompanies || "Google, Microsoft, Amazon, Atlassian"));
          setPrimaryLanguage(ob.primaryLanguage || "C++");
          setDailyTime(ob.dailyTime || "2-3");
          setSkillLevel(ob.skillLevel ? String(ob.skillLevel) : "5");
          setGraduationYear(ob.graduationYear || "2026");
          setCollege(ob.college || "");
          setShortTermGoal(ob.shortTermGoal || "");
          setWeakTopics(Array.isArray(ob.weakTopics) ? ob.weakTopics : []);

          setLeetcodeUsername(profile.leetcodeUsername || "");
          setCodeforcesUsername(profile.codeforcesUsername || "");
          setLeetcodeData(platforms?.leetcode || null);
          setCodeforcesData(platforms?.codeforces || null);
          setMemoryCount(memoryMetrics?.indexedSnippets || 0);
          setUserState(state || null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load placement profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, userName]);

  const toggleWeakTopic = (topic: string) => {
    setWeakTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleAddCustomTopic = () => {
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;

    const alreadyExists = weakTopics.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      toast.error(`"${trimmed}" is already in your focus list.`);
      return;
    }

    setWeakTopics((prev) => [...prev, trimmed]);
    setCustomTopicInput("");
    toast.success(`Added "${trimmed}" to priority focus.`);
  };

  const handleRemoveWeakTopic = (topicToRemove: string) => {
    setWeakTopics((prev) => prev.filter((t) => t !== topicToRemove));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          targetRole,
          targetCompanies,
          primaryLanguage,
          dailyTime,
          skillLevel,
          graduationYear,
          college,
          shortTermGoal,
          weakTopics,
          leetcodeUsername,
          codeforcesUsername,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");

      // Update local storage cache for instant dashboard sync
      const userId = authService.getUser()?.id;
      if (userId) {
        try {
          const raw = localStorage.getItem(`navixo_dashboard_cache_${userId}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.userState) {
              parsed.userState.targetRole = targetRole;
            }
            localStorage.setItem(`navixo_dashboard_cache_${userId}`, JSON.stringify(parsed));
          }
        } catch {}
      }

      setMemoryCount((prev) => Math.max(prev, 1));
      toast.success("Placement profile saved & semantic memory re-indexed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncLeetcode = async () => {
    if (!leetcodeUsername.trim()) {
      toast.error("Please enter a LeetCode username first");
      return;
    }
    try {
      setSyncingLc(true);
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/api/platforms/leetcode/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: leetcodeUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "LeetCode sync failed");
      setLeetcodeData(data);

      const userId = authService.getUser()?.id;
      if (userId) {
        try {
          localStorage.setItem(`navixo_lc_cache_${userId}`, JSON.stringify(data));
          const rawDash = localStorage.getItem(`navixo_dashboard_cache_${userId}`);
          if (rawDash) {
            const parsed = JSON.parse(rawDash);
            if (!parsed.platforms) parsed.platforms = {};
            parsed.platforms.leetcode = data;
            localStorage.setItem(`navixo_dashboard_cache_${userId}`, JSON.stringify(parsed));
          }
        } catch {}
      }

      toast.success(`LeetCode verified! Solved: ${data.solved || 0}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync LeetCode");
    } finally {
      setSyncingLc(false);
    }
  };

  const handleSyncCodeforces = async () => {
    if (!codeforcesUsername.trim()) {
      toast.error("Please enter a Codeforces handle first");
      return;
    }
    try {
      setSyncingCf(true);
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/api/platforms/codeforces/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: codeforcesUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Codeforces sync failed");
      setCodeforcesData(data);

      const userId = authService.getUser()?.id;
      if (userId) {
        try {
          localStorage.setItem(`navixo_cf_cache_${userId}`, JSON.stringify(data));
          const rawDash = localStorage.getItem(`navixo_dashboard_cache_${userId}`);
          if (rawDash) {
            const parsed = JSON.parse(rawDash);
            if (!parsed.platforms) parsed.platforms = {};
            parsed.platforms.codeforces = data;
            localStorage.setItem(`navixo_dashboard_cache_${userId}`, JSON.stringify(parsed));
          }
        } catch {}
      }

      toast.success(`Codeforces verified! Rating: ${data.rating || 0} (${data.rank || "unrated"})`);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync Codeforces");
    } finally {
      setSyncingCf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#8B5CF6]/30">
      <DashboardHeader
        userName={userName}
        onSidebarToggle={() => setSidebarOpen(true)}
        onNavigate={onNavigate}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      <div className="flex pt-16 h-screen overflow-hidden">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={onNavigate}
          currentPath="profile"
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth relative custom-scrollbar">
          <div className="max-w-[1100px] mx-auto space-y-7">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono flex items-center gap-3">
                  <User className="w-7 h-7 text-[#8B5CF6]" />
                  Placement Profile & Calibration
                </h1>
                <p className="text-sm text-white/50 mt-1">
                  Configure your career parameters, target companies, and calibrate your AI Mentor.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white rounded-xl gap-2 font-medium px-5 shadow-lg shadow-purple-900/30"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Semantic Memory & Engine Telemetry Status */}
            <div className="bg-[#0F1117]/90 border border-white/10 rounded-3xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      pgvector Semantic Memory Engine
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    {memoryCount > 0
                      ? `${memoryCount} background memory vector${memoryCount > 1 ? "s" : ""} indexed. AI Mentor uses this to personalize all recommendations.`
                      : "Memory embedding will automatically index when you save your profile."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl text-xs gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
                  Re-Index Memory Vector
                </Button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* 1. Placement Target Parameters */}
              <Card className="bg-[#0F1117] border border-[#2f2f2f] rounded-3xl p-6 shadow-xl">
                <CardHeader className="p-0 mb-6 flex flex-row items-center gap-2.5">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/40 font-mono">
                    Placement Goal Parameters
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        Full Name
                      </Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Kumar"
                        className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        Target Role / Specialization
                      </Label>
                      <Input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Software Development Engineer (SDE)"
                        className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-white/70 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      Target Companies (Dream & Core Placements)
                    </Label>
                    <Input
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      placeholder="e.g. Google, Microsoft, Amazon, Atlassian, Razorpay, Uber"
                      className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                    />
                    <p className="text-[11px] text-white/40">
                      Comma-separated list. Your AI Mentor tunes DSA and System Design questions specifically to interview archives of these companies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        Primary Language
                      </Label>
                      <select
                        value={primaryLanguage}
                        onChange={(e) => setPrimaryLanguage(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-[#8B5CF6] outline-none"
                      >
                        <option value="C++">C++ (STL, Competitive)</option>
                        <option value="Java">Java (Core, OOP, Collections)</option>
                        <option value="Python">Python (DSA, Automation)</option>
                        <option value="TypeScript">TypeScript / JavaScript</option>
                        <option value="Go">Go (Golang Systems)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        Graduation Year / Batch
                      </Label>
                      <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-[#8B5CF6] outline-none"
                      >
                        <option value="2025">2025 (Immediate Placement)</option>
                        <option value="2026">2026 (Upcoming Season)</option>
                        <option value="2027">2027 (Pre-final Year)</option>
                        <option value="2028">2028 (Foundation Year)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        Daily Commitment
                      </Label>
                      <select
                        value={dailyTime}
                        onChange={(e) => setDailyTime(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-[#8B5CF6] outline-none"
                      >
                        <option value="1-2">1-2 Hours/Day (Maintenance)</option>
                        <option value="2-3">2-3 Hours/Day (Standard)</option>
                        <option value="3-4">3-4 Hours/Day (Sprint)</option>
                        <option value="4+">4+ Hours/Day (Hardcore)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        College / Department
                      </Label>
                      <Input
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. IIT Delhi, NIT Trichy, BITS Pilani"
                        className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                        Current DSA Skill Level (1-10)
                      </Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={skillLevel}
                          onChange={(e) => setSkillLevel(e.target.value)}
                          className="flex-1 accent-[#8B5CF6] cursor-pointer"
                        />
                        <span className="font-mono text-lg font-bold text-white w-8 text-right">
                          {skillLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                      Short-Term Placement Milestone
                    </Label>
                    <Textarea
                      value={shortTermGoal}
                      onChange={(e) => setShortTermGoal(e.target.value)}
                      placeholder="e.g. Master dynamic programming and solve 150 LeetCode mediums before campus season starts in August."
                      className="bg-[#07090e] border-white/10 text-white min-h-[80px] focus:border-[#8B5CF6]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 2. Priority Diagnostic & Weak Topics */}
              <Card className="bg-[#0F1117] border border-[#2f2f2f] rounded-3xl p-6 shadow-xl">
                <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/40 font-mono">
                      Priority Focus & Weak Areas
                    </CardTitle>
                  </div>
                  <span className="text-xs text-purple-300 font-mono font-semibold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {weakTopics.length} selected
                  </span>
                </CardHeader>

                <p className="text-xs text-white/50 mb-5">
                  Select or add the concepts where you experience execution roadblocks. The daily protocol generator and AI Mentor will prioritize actionable practice for these topics.
                </p>

                {/* Custom Topic Input Bar */}
                <div className="flex gap-2.5 mb-5">
                  <div className="relative flex-1">
                    <Input
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTopic();
                        }
                      }}
                      placeholder="Add custom topic (e.g. Trie, Segment Tree, Kafka, Redis, WebSockets) and press Enter..."
                      className="bg-[#07090e] border-white/10 text-white placeholder:text-white/30 text-xs font-mono focus:border-[#8B5CF6] h-10"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddCustomTopic}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-mono px-4 h-10 flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Topic</span>
                  </Button>
                </div>

                {/* Selected Active Focus Topics Badges */}
                <div className="mb-5">
                  <Label className="text-[11px] text-white/50 uppercase tracking-wider font-mono mb-2.5 block">
                    Active Focus Topics ({weakTopics.length})
                  </Label>
                  {weakTopics.length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                      <p className="text-xs text-white/40 font-mono">
                        No focus topics selected yet. Add a custom topic above or click any preset suggestion below.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {weakTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/20 group transition-all"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{topic}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWeakTopic(topic)}
                            className="ml-1 p-0.5 rounded-md text-purple-300 hover:text-white hover:bg-purple-500/40 transition-colors"
                            title={`Remove ${topic}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preset Suggestions Quick-Select Grid */}
                <div>
                  <Label className="text-[11px] text-white/50 uppercase tracking-wider font-mono mb-2.5 block">
                    Quick-Select Preset Topics
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_WEAK_TOPICS.map((topic) => {
                      const isSelected = weakTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleWeakTopic(topic)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all border ${
                            isSelected
                              ? "bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm shadow-purple-500/20"
                              : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {isSelected && <span className="mr-1.5 text-purple-400">✓</span>}
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* 3. Competitive Coding Battle Stations */}
              <Card className="bg-[#0F1117] border border-[#2f2f2f] rounded-3xl p-6 shadow-xl">
                <CardHeader className="p-0 mb-6 flex flex-row items-center gap-2.5">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/40 font-mono">
                    Competitive Platforms Synchronization
                  </CardTitle>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LeetCode Sync */}
                  <div className="p-4 rounded-2xl bg-[#07090e] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src="/leetcode.svg" alt="LeetCode" className="w-5 h-5 object-contain" />
                        <span className="text-sm font-bold text-white font-mono">LeetCode</span>
                      </div>
                      {leetcodeData ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-semibold border border-emerald-500/30">
                          {leetcodeData.solved || 0} SOLVED
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/40 font-mono">NOT VERIFIED</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={leetcodeUsername}
                        onChange={(e) => setLeetcodeUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSyncLeetcode();
                          }
                        }}
                        placeholder="LeetCode username"
                        className="bg-black/50 border-white/10 text-white text-xs"
                      />
                      <Button
                        type="button"
                        onClick={handleSyncLeetcode}
                        disabled={syncingLc}
                        size="sm"
                        className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncingLc ? "animate-spin" : ""}`} />
                        Sync
                      </Button>
                    </div>
                  </div>

                  {/* Codeforces Sync */}
                  <div className="p-4 rounded-2xl bg-[#07090e] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold font-mono">CF</span>
                        <span className="text-sm font-bold text-white font-mono">Codeforces</span>
                      </div>
                      {codeforcesData ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-mono font-semibold border border-cyan-500/30">
                          {codeforcesData.rating || 0} ({codeforcesData.rank || "unrated"})
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/40 font-mono">NOT VERIFIED</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={codeforcesUsername}
                        onChange={(e) => setCodeforcesUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSyncCodeforces();
                          }
                        }}
                        placeholder="Codeforces handle"
                        className="bg-black/50 border-white/10 text-white text-xs"
                      />
                      <Button
                        type="button"
                        onClick={handleSyncCodeforces}
                        disabled={syncingCf}
                        size="sm"
                        className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncingCf ? "animate-spin" : ""}`} />
                        Sync
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Bottom Submit Action */}
              <div className="flex justify-end gap-3 pt-2 pb-12">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onNavigate("dashboard")}
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white rounded-xl gap-2 font-medium px-8 shadow-xl shadow-purple-900/40"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving Changes..." : "Save Calibration"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <LogoutModal
        isOpen={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          onLogout();
        }}
      />
    </div>
  );
}
