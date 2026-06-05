//src\components\pages\Dashboard.tsx

import { supabase } from "../../supabaseClient";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Toast } from "../ui/toast";
import {
  MessageSquare,
  Map,
  Target,
  LogOut,
  Brain,
  Zap,
  BarChart3,
  Sparkles,
  Users,
  BookOpen,
  CheckCircle2,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Calendar,
  Trophy,
  Activity,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NavixoLogo } from "../NavixoLogo";
import {
  SkeletonStatCard,
  SkeletonProgressRing,
  SkeletonActivityItem,
  SkeletonChart,
  SkeletonRoadmapCard,
} from "../ui/navixo-skeleton";
import { safeNumber } from "../../utils/number";

interface DashboardProps {
  userName: string;
  onNavigate: (path: string) => void;

  onLogout: () => void;
}

export function Dashboard({ userName, onNavigate, onLogout }: DashboardProps) {
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [roadmapStatus, setRoadmapStatus] = useState<
    "idle" | "pending" | "processing" | "completed"
  >("idle");

  // UI States
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [resourcesOverlayOpen, setResourcesOverlayOpen] = useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to Navixo!",
      message: "Start your career journey today",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "Profile setup complete",
      message: "You're all set to begin",
      time: "5 minutes ago",
      read: false,
    },
  ]);
  const [cfError, setCfError] = useState<string | null>(null);
  const [editingLc, setEditingLc] = useState(false);
  const [cfUsername, setCfUsername] = useState("");
  const [cfProfile, setCfProfile] = useState<any>(null);
  const [editingCf, setEditingCf] = useState(false);
  const [syncingCf, setSyncingCf] = useState(false);

  const [lcError, setLcError] = useState<string | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [leetcodeProfile, setLeetcodeProfile] = useState<any>(null);
  const [syncingLeetcode, setSyncingLeetcode] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);

  const refreshDashboard = async () => {
    const allowPoll =
      roadmapStatus === "processing" || roadmapStatus === "pending";

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const userId = auth.user.id;

    // Active roadmap
    const { data: rm } = await supabase
      .from("user_roadmaps")
      .select("id, title, generation_status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: lc } = await supabase
      .from("leetcode_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLeetcodeProfile(lc || null);
    setLeetcodeUsername(lc?.username || "");

    const { data: cf } = await supabase
      .from("codeforces_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("last_synced_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCfProfile(cf || null);
    setCfUsername(cf?.username || "");

    if (rm) {
      setActiveRoadmap(rm);
      setRoadmapStatus(rm.generation_status || "idle");
    }

    if (
      allowPoll &&
      rm &&
      ["processing", "pending"].includes(rm.generation_status)
    ) {
      return;
    }

    // Progress %
    const { data: steps } = await supabase
      .from("roadmap_steps")
      .select("status, user_roadmaps!inner(user_id)")
      .eq("user_roadmaps.user_id", userId);

    const done = steps?.filter((s) => s.status === "done").length || 0;
    const total = steps?.length || 0;
    setProgressValue(total ? Math.round((done / total) * 100) : 0);

    // Saved roadmaps list
    const { data: rms } = await supabase
      .from("user_roadmaps")
      .select("id, title, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setSavedRoadmaps(rms || []);
    setLoadingRoadmaps(false);
    setLoading(false);
  };

  const syncLeetcode = async () => {
    if (!leetcodeUsername.trim() || syncingLeetcode) return;

    try {
      setSyncingLeetcode(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-leetcode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: leetcodeUsername }),
        },
      );

      const dataRes = await res.json();

      if (!res.ok || dataRes.error) {
        throw new Error(dataRes.error || "LeetCode sync failed");
      }

      setEditingLc(false);
      setToast("LeetCode profile synced successfully.");
      await refreshDashboard();
    } catch (e: any) {
      setLcError(e.message || "LeetCode sync failed");
    } finally {
      setSyncingLeetcode(false);
    }
  };

  const syncCodeforces = async () => {
    if (!cfUsername.trim() || syncingCf) return;

    try {
      setSyncingCf(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-codeforces`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: cfUsername.trim() }),
        },
      );

      const dataRes = await res.json();

      if (!res.ok || !dataRes.profile) {
        throw new Error(dataRes.error || "Codeforces sync failed");
      }

      setEditingCf(false);
      setToast("Codeforces profile synced");
      await refreshDashboard();
    } catch (e: any) {
      setCfError(e.message || "Codeforces sync failed");
    } finally {
      setSyncingCf(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setCfError(null);
  }, [cfUsername]);

  useEffect(() => {
    setLcError(null);
  }, [leetcodeUsername]);

  // Scroll reset on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadActivity = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data } = await supabase
        .from("roadmap_steps")
        .select(
          `
        id,
        title,
        status,
        updated_at,
        user_roadmaps!inner(user_id)
      `,
        )
        .eq("user_roadmaps.user_id", auth.user.id)
        .order("updated_at", { ascending: false })
        .eq("status", "done")
        .limit(5);

      setActivity(
        (data || []).filter(
          (a) =>
            a.status === "done" &&
            typeof a.updated_at === "string" &&
            a.title?.length,
        ),
      );
    };

    loadActivity();
  }, []);

  useEffect(() => {
    refreshDashboard();

    if (!["processing", "pending"].includes(roadmapStatus)) return;

    const interval = setInterval(refreshDashboard, 4000);
    return () => clearInterval(interval);
  }, [roadmapStatus]);

  // Close overlays on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".notification-dropdown") &&
        !target.closest(".notification-button")
      ) {
        setNotificationsOpen(false);
      }
      if (
        !target.closest(".user-menu-dropdown") &&
        !target.closest(".user-menu-button")
      ) {
        setUserMenuOpen(false);
      }
      if (!target.closest(".search-container") && searchExpanded) {
        setSearchExpanded(false);
        setSearchSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchExpanded]);

  // Handle search expand
  const handleSearchFocus = () => {
    setSearchExpanded(true);
    setSearchSuggestionsOpen(true);
  };

  // Handle notification click
  const handleNotificationClick = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    onNavigate("profile");
  };

  // Handle task completion
  const handleTaskComplete = (taskId: number) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks((prev) => prev.filter((id) => id !== taskId));
    } else {
      setCompletedTasks((prev) => [...prev, taskId]);
    }
  };

  // Handle logout confirm
  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    onLogout();
  };

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen bg-[#0D0F13] text-white overflow-x-hidden"
    >
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#13151B]/80 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-all duration-120"
            >
              <Menu className="w-5 h-5 text-white/70" />
            </button>

            <div className="flex items-center">
              <NavixoLogo size={32} variant="white" />
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-md search-container">
            <motion.div
              className="relative w-full group"
              animate={{ maxWidth: searchExpanded ? "520px" : "100%" }}
              transition={{ duration: 0.26, ease: [0.2, 0.9, 0.3, 1] }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors duration-120 z-10" />
              <Input
                ref={searchInputRef}
                placeholder="Search or ask Navixo..."
                onFocus={handleSearchFocus}
                className="w-full h-10 pl-10 bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/10 focus:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_0_12px_rgba(75,150,255,0.25)] transition-all duration-120"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
              />

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {searchSuggestionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#13151B]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <p
                        className="text-white/40 px-3 py-2"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "11px",
                          letterSpacing: "0.05em",
                        }}
                      >
                        SUGGESTED
                      </p>
                      {[
                        "View my roadmap progress",
                        "Skill gap analysis",
                        "Learning resources",
                        "Schedule assessment",
                        "Career advice",
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchSuggestionsOpen(false);
                            setSearchExpanded(false);
                            onNavigate("roadmap");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all duration-120 text-left group"
                        >
                          <Search className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "14px",
                            }}
                          >
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className="notification-button relative p-2 hover:bg-white/5 rounded-lg transition-all duration-120"
              >
                <Bell className="w-5 h-5 text-white/70" />
                {notifications.some((n) => !n.read) && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#14F4C9] rounded-full"></div>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-[#13151B]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <h3
                        className="text-white"
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        Notifications
                      </h3>
                    </div>
                    <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id)}
                          className={`p-3 ${
                            notif.read ? "bg-white/[0.03]" : "bg-white/5"
                          } hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200`}
                        >
                          <p
                            className="text-white mb-1"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "13px",
                              fontWeight: 500,
                            }}
                          >
                            {notif.title}
                          </p>
                          <p
                            className="text-white/60"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                            }}
                          >
                            {notif.message}
                          </p>
                          <p
                            className="text-white/40 mt-1"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "11px",
                            }}
                          >
                            {notif.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right">
                <p
                  className="text-white"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "13px",
                  }}
                >
                  {userName}
                </p>
                <p
                  className="text-white/50"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}
                >
                  Career Explorer
                </p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="user-menu-button w-9 h-9 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-160"
              >
                <span
                  className="text-white"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.12 }}
                    className="user-menu-dropdown absolute right-0 top-full mt-2 w-48 bg-[#13151B]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate("profile");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all duration-120 text-left focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      >
                        <Users className="w-4 h-4" />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          Profile
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate("settings");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all duration-120 text-left focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      >
                        <Target className="w-4 h-4" />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          Settings
                        </span>
                      </button>
                      <div className="h-px bg-white/10 my-2"></div>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all duration-120 text-left focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      >
                        <LogOut className="w-4 h-4" />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          Logout
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleLogoutClick}
              className="sm:hidden p-2 hover:bg-white/5 rounded-lg transition-all duration-120 group"
            >
              <LogOut className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13151B]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h3
                className="text-white mb-2"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                Confirm Logout
              </h3>
              <p
                className="text-white/60 mb-6"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
              >
                Are you sure you want to logout? Your progress will be saved.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl px-4 py-2.5 transition-all duration-200"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLogout}
                  className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:from-[#FF7A45] hover:to-[#FFA32E] text-white rounded-xl px-4 py-2.5 transition-all duration-200"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Logout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resources Overlay */}
      <AnimatePresence>
        {resourcesOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-end"
            onClick={() => setResourcesOverlayOpen(false)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ duration: 0.35, ease: [0.2, 0.9, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-md bg-[#13151B]/95 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-white"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 600,
                    fontSize: "20px",
                  }}
                >
                  Learning Resources
                </h3>
                <button
                  onClick={() => setResourcesOverlayOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-120"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-white/40 text-sm">
                  Feature in progress — launching next iteration.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Container */}
      <div className="flex pt-16">
        {/* Left Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed lg:sticky top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-[#13151B]/40 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto"
            >
              <nav className="p-4 space-y-6">
                {/* Navigation Section */}
                <div>
                  <p
                    className="text-white/40 mb-3 px-3"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    MAIN
                  </p>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/10 border-l-2 border-[#3B82F6] rounded-xl text-white transition-all duration-200 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6]/30 to-[#14F4C9]/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Dashboard
                      </span>
                    </button>

                    <button
                      onClick={() => onNavigate("chat")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:-translate-y-0.5 rounded-xl text-white/70 hover:text-white transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    >
                      <div className="w-8 h-8 bg-white/5 group-hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        AI Mentor
                      </span>
                    </button>

                    <button
                      onClick={() => onNavigate("roadmap")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:-translate-y-0.5 rounded-xl text-white/70 hover:text-white transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    >
                      <div className="w-8 h-8 bg-white/5 group-hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                        <Map className="w-4 h-4" />
                      </div>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Roadmap
                      </span>
                    </button>
                  </div>
                </div>

                {/* Resources Section */}
                <div>
                  <p
                    className="text-white/40 mb-3 px-3"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    RESOURCES
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => onNavigate("learning")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:-translate-y-0.5 rounded-xl text-white/70 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Learning Path
                      </span>
                    </button>
                    <button
                      onClick={() => onNavigate("achievements")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:-translate-y-0.5 rounded-xl text-white/70 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    >
                      <Trophy className="w-4 h-4" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Achievements
                      </span>
                    </button>
                    <button
                      onClick={() => onNavigate("schedule")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:-translate-y-0.5 rounded-xl text-white/70 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    >
                      <Calendar className="w-4 h-4" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Schedule
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-xl p-4">
                  {loading ? (
                    <SkeletonStatCard />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-[#14F4C9]" />
                        <p
                          className="text-white"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          Weekly Streak
                        </p>
                      </div>
                      <p className="text-white/60 text-sm">
                        Streak tracking will unlock after your first completed
                        roadmap step.
                      </p>
                    </>
                  )}
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main
          className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            sidebarOpen ? "lg:ml-0" : ""
          }`}
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-4 lg:p-6">
            {/* Main Canvas (2/3) */}
            <div className="xl:col-span-2 space-y-6">
              {/* Hero Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#13151B]/60 to-[#0D0F13]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8"
              >
                {/* Ambient glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-[#14F4C9]/15 to-transparent blur-3xl rounded-full"></div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Left: Greeting */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[#14F4C9]" />
                      <span
                        className="text-[#14F4C9]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "13px",
                        }}
                      >
                        Good to see you
                      </span>
                    </div>
                    <h1
                      className="text-white mb-3"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "clamp(24px, 4vw, 32px)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Welcome back, {userName}!
                    </h1>
                    {activeRoadmap && roadmapStatus === "completed" && (
                      <p className="text-xs text-white/40">
                        Last updated:{" "}
                        {new Date(activeRoadmap.created_at).toLocaleString()}
                      </p>
                    )}

                    {roadmapStatus === "processing" ||
                    roadmapStatus === "pending" ? (
                      <p className="text-white/60 mb-6">
                        Your roadmap is being generated. This usually takes
                        under 60 seconds.
                      </p>
                    ) : roadmapStatus === "completed" && activeRoadmap ? (
                      <p className="text-white/60 mb-6">
                        Active roadmap:{" "}
                        <span className="text-white">
                          {activeRoadmap.title}
                        </span>
                      </p>
                    ) : (
                      <p className="text-white/60 mb-6">
                        No roadmap exists yet. Generate one to unlock all
                        features.
                      </p>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={
                          !activeRoadmap || roadmapStatus !== "completed"
                        }
                        onClick={() => {
                          if (!activeRoadmap || roadmapStatus !== "completed")
                            return;
                          onNavigate(`roadmap/${activeRoadmap.id}`);
                        }}
                        className="rounded-xl px-5 py-2.5 bg-gradient-to-r from-white to-white/90 text-black disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
                      >
                        {roadmapStatus === "processing" ||
                        roadmapStatus === "pending"
                          ? "Generating..."
                          : "Continue Roadmap"}
                      </Button>

                      <Button
                        onClick={() => setChatOpen(true)}
                        className="bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl px-5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask Navixo
                      </Button>
                    </div>
                  </div>

                  {/* Right: Progress Ring */}
                  <div className="flex justify-center md:justify-end">
                    {loading ? (
                      <SkeletonProgressRing />
                    ) : (
                      <div className="relative group">
                        {/* Glow behind ring */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/30 to-[#8B5CF6]/30 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-200"></div>

                        {/* Progress Ring SVG */}
                        <svg
                          className="relative w-32 h-32 lg:w-40 lg:h-40 -rotate-90 transition-transform group-hover:scale-105"
                          viewBox="0 0 160 160"
                        >
                          {/* Background circle */}
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                          />
                          {/* Progress circle with gradient */}
                          <defs>
                            <linearGradient
                              id="progressGradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="50%" stopColor="#14F4C9" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                          <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={440}
                            initial={{ strokeDashoffset: 440 }}
                            animate={{
                              strokeDashoffset:
                                440 - (440 * progressValue) / 100,
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>

                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <motion.p
                            className="text-white"
                            style={{
                              fontFamily: "Space Grotesk, sans-serif",
                              fontWeight: 600,
                              fontSize: "28px",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {safeNumber(progressValue)}%
                          </motion.p>
                          <p
                            className="text-white/60"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "11px",
                            }}
                          >
                            Mastery
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Primary Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Your Roadmaps */}
                <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      Your Roadmaps
                    </h3>
                  </div>

                  {loadingRoadmaps ? (
                    <p className="text-white/50">Loading...</p>
                  ) : savedRoadmaps.length === 0 ? (
                    <Button
                      onClick={() => onNavigate("roadmap")}
                      className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-xl"
                    >
                      Create Your First Roadmap
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      {savedRoadmaps
                        .filter(
                          (r) =>
                            typeof r?.id === "string" && r.title?.length > 0,
                        )
                        .map((rm) => (
                          <div
                            key={rm.id}
                            className="flex items-center justify-between bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl p-4"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {rm.title}
                              </p>
                              <p className="text-white/40 text-xs">
                                {new Date(rm.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <Button
                              onClick={() => onNavigate(`roadmap/${rm.id}`)}
                              className="bg-white text-black hover:bg-white/90 rounded-xl px-4"
                            >
                              Open
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </Card>

                {loading ? (
                  <SkeletonStatCard />
                ) : (
                  <Card className="bg-[#13151B]/60 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">
                      LeetCode Profile
                    </h3>

                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm">
                          Username:{" "}
                          <span className="font-semibold text-[#14F4C9]">
                            {leetcodeProfile
                              ? leetcodeProfile.username
                              : "Link your account"}
                          </span>
                        </p>

                        {!editingLc && leetcodeProfile && (
                          <button
                            onClick={() => setEditingLc(true)}
                            className="text-xs text-white/60 hover:text-white underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {!leetcodeProfile && !editingLc && (
                        <Button
                          onClick={() => setEditingLc(true)}
                          className="w-full"
                        >
                          Link LeetCode
                        </Button>
                      )}

                      {/* Edit Mode */}
                      {editingLc && (
                        <Input
                          value={leetcodeUsername}
                          onChange={(e) => setLeetcodeUsername(e.target.value)}
                          placeholder="Enter new LeetCode username"
                          className="bg-[#050816] text-white placeholder:text-white/40 border-white/10"
                        />
                      )}

                      {/* Stats */}
                      {leetcodeProfile && !editingLc && (
                        <div className="space-y-1 text-sm text-white/80">
                          <p>Total Solved: {leetcodeProfile.solved}</p>
                          <p>Easy: {leetcodeProfile.easy}</p>
                          <p>Medium: {leetcodeProfile.medium}</p>
                          <p>Hard: {leetcodeProfile.hard}</p>
                          <p>Ranking: {leetcodeProfile.ranking}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={syncLeetcode}
                          disabled={syncingLeetcode || !leetcodeUsername.trim()}
                          className="flex-1"
                          variant="outline"
                        >
                          {syncingLeetcode
                            ? "Syncing..."
                            : editingLc
                              ? "Save & Sync"
                              : leetcodeProfile
                                ? "Refresh"
                                : ""}
                        </Button>

                        {editingLc && (
                          <Button
                            onClick={() => {
                              setEditingLc(false);
                              setLeetcodeUsername(
                                leetcodeProfile?.username || "",
                              );
                            }}
                            className="flex-1"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      {syncingLeetcode && (
                        <div className="text-xs text-[#14F4C9] animate-pulse">
                          Syncing LeetCodes profile...
                        </div>
                      )}

                      {lcError && (
                        <div className="text-xs text-red-400">{lcError}</div>
                      )}
                    </div>
                  </Card>
                )}

                {loading ? (
                  <SkeletonStatCard />
                ) : (
                  <Card className="bg-[#13151B]/60 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">
                      Codeforces Profile
                    </h3>

                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm">
                          Username:{" "}
                          <span className="font-semibold text-[#14F4C9]">
                            {cfProfile
                              ? cfProfile.username
                              : "Link your account"}
                          </span>
                        </p>

                        {!editingCf && cfProfile && (
                          <button
                            onClick={() => setEditingCf(true)}
                            className="text-xs text-white/60 hover:text-white underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {!cfProfile && !editingCf && (
                        <Button
                          onClick={() => setEditingCf(true)}
                          className="w-full"
                        >
                          Link Codeforces
                        </Button>
                      )}

                      {/* Edit Mode */}
                      {editingCf && (
                        <Input
                          value={cfUsername}
                          onChange={(e) => setCfUsername(e.target.value)}
                          placeholder="Enter Codeforces username"
                          className="bg-[#050816] text-white placeholder:text-white/40 border-white/10"
                        />
                      )}

                      {/* Stats */}
                      {cfProfile && !editingCf && (
                        <div className="space-y-1 text-sm text-white/80">
                          <p>Rating: {cfProfile.rating}</p>
                          <p>Max Rating: {cfProfile.max_rating}</p>
                          <p>Rank: {cfProfile.rank}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={syncCodeforces}
                          disabled={syncingCf || !cfUsername.trim()}
                          className="flex-1"
                          variant="outline"
                        >
                          {syncingCf
                            ? "Syncing..."
                            : editingCf
                              ? "Save & Sync"
                              : cfProfile
                                ? "Refresh"
                                : ""}
                        </Button>

                        {editingCf && (
                          <Button
                            onClick={() => {
                              setEditingCf(false);
                              setCfUsername(cfProfile?.username || "");
                            }}
                            className="flex-1"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      {syncingCf && (
                        <div className="text-xs text-[#14F4C9] animate-pulse">
                          Syncing Codeforces profile...
                        </div>
                      )}

                      {cfError && (
                        <div className="text-xs text-red-400">{cfError}</div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Roadmap Snapshot - Largest */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="md:col-span-2"
                >
                  <Card className="group relative overflow-hidden bg-[#13151B]/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-350 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                            <Map className="w-4 h-4 text-[#8B5CF6]" />
                          </div>
                          <h3
                            className="text-white"
                            style={{
                              fontFamily: "Space Grotesk, sans-serif",
                              fontWeight: 600,
                              fontSize: "16px",
                            }}
                          >
                            Roadmap Progress
                          </h3>
                        </div>
                        <button
                          onClick={() => onNavigate("roadmap")}
                          className="text-white/60 hover:text-white transition-colors duration-120 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {loading ? (
                        <SkeletonRoadmapCard />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className="text-white/60 mb-1"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "13px",
                                }}
                              >
                                Current Phase
                              </p>
                              <p className="text-white/50 text-sm">
                                Detailed roadmap stats will appear after you
                                complete your first roadmap.
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-white/60 mb-1"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "13px",
                                }}
                              >
                                ETA
                              </p>
                              <p className="text-white/50 text-sm">
                                Detailed roadmap stats will appear after you
                                complete your first roadmap.
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />

                          {/* Quick actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => onNavigate("roadmap")}
                              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "13px",
                                fontWeight: 500,
                              }}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setResourcesOverlayOpen(true)}
                              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "13px",
                                fontWeight: 500,
                              }}
                            >
                              Resources
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Daily Focus Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="relative overflow-hidden bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#14F4C9]/20 to-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#14F4C9]" />
                    </div>
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      Today's Focus
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        id: 1,
                        title: "Complete Module 3",
                        subtitle: "30 min remaining",
                        icon: CheckCircle2,
                        color: "#14F4C9",
                      },
                      {
                        id: 2,
                        title: "Read 2 Articles",
                        subtitle: "Skills development",
                        icon: BookOpen,
                        color: "#3B82F6",
                      },
                      {
                        id: 3,
                        title: "Practice Exercise",
                        subtitle: "Apply knowledge",
                        icon: Brain,
                        color: "#8B5CF6",
                      },
                    ].map((task) => {
                      const Icon = task.icon;
                      const isCompleted = completedTasks.includes(task.id);

                      return (
                        <motion.div
                          key={task.id}
                          onClick={() => handleTaskComplete(task.id)}
                          className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-260 ${
                            isCompleted
                              ? "bg-white/10 border-white/20"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            animate={{
                              scale: isCompleted ? [1, 1.2, 1] : 1,
                              rotate: isCompleted ? [0, 10, -10, 0] : 0,
                            }}
                            transition={{ duration: 0.4 }}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 text-[#14F4C9] flex-shrink-0 mt-0.5" />
                            ) : (
                              <Icon
                                className="w-5 h-5 flex-shrink-0 mt-0.5"
                                style={{ color: task.color }}
                              />
                            )}
                          </motion.div>
                          <div>
                            <p
                              className={`mb-1 transition-all duration-260 ${
                                isCompleted
                                  ? "text-white/50 line-through"
                                  : "text-white"
                              }`}
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                fontSize: "14px",
                              }}
                            >
                              {task.title}
                            </p>
                            <p
                              className="text-white/60"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "12px",
                              }}
                            >
                              {task.subtitle}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Activity Feed & Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Activity Feed */}
                <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#3B82F6]" />
                      <h3
                        className="text-white"
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 600,
                          fontSize: "16px",
                        }}
                      >
                        Recent Activity
                      </h3>
                    </div>
                    <button
                      onClick={() => onNavigate("achievements")}
                      className="text-white/60 hover:text-white transition-colors duration-120 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded px-2"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      View All
                    </button>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      <SkeletonActivityItem />
                      <SkeletonActivityItem />
                      <SkeletonActivityItem />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activity.length === 0 && (
                        <p className="text-white/40 text-sm">
                          No activity yet.
                        </p>
                      )}

                      {activity
                        .filter((a) => a?.id)
                        .map((a) => (
                          <div key={a.id} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                {a.title}
                              </p>
                              <p className="text-white/50 text-xs">
                                {a.status} •{" "}
                                {new Date(a.updated_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </Card>

                {/* Weekly Progress Chart */}
                <Card className="bg-[#13151B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-[#14F4C9]" />
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      Weekly Time
                    </h3>
                  </div>

                  {loading ? (
                    <SkeletonChart />
                  ) : (
                    <div className="h-32 flex items-end justify-between gap-2 relative">
                      <p className="text-white/40 text-sm">
                        Feature in progress — launching next iteration.
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toast message={toast} show={!!toast} />
    </div>
  );
}
