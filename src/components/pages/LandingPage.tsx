//src\components\pages\LandingPage.tsx

import { Button } from "../ui/button";
import { NeonButton } from "../ui/neon-button";
import { FooterLink } from "../ui/footer-link";
import {
  Compass,
  Map,
  Target,
  Sparkles,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Zap,
  Brain,
  Users,
  CheckCircle,
  Play,
  ChevronDown,
  Scan,
  Route,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { motion, useScroll, useTransform } from "motion/react";
import { NavixoLogo } from "../NavixoLogo";
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasSession(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#050814] text-white overflow-hidden relative">
      {/* Animated Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="border-b border-white/5 bg-[#050814]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavixoLogo size={28} variant="white" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-400 hover:text-[#14F4C9] transition-colors"
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("journey")}
                className="text-gray-400 hover:text-[#14F4C9] transition-colors"
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("impact")}
                className="text-gray-400 hover:text-[#14F4C9] transition-colors"
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Impact
              </button>
              {hasSession ? (
                <NeonButton
                  onClick={() => navigate("/dashboard")}
                  variant="pill"
                  className="border border-[#14F4C9]/50"
                >
                  Go to Dashboard
                </NeonButton>
              ) : (
                <NeonButton onClick={onGetStarted} variant="pill">
                  Get Early Access
                </NeonButton>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/10 pt-4">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-gray-400 hover:text-white py-2"
                style={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("journey")}
                className="block w-full text-left text-gray-400 hover:text-white py-2"
                style={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("impact")}
                className="block w-full text-left text-gray-400 hover:text-white py-2"
                style={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}
              >
                Impact
              </button>
              {hasSession ? (
                <NeonButton
                  onClick={() => navigate("/dashboard")}
                  variant="pill"
                  className="border border-[#14F4C9]/50"
                >
                  Go to Dashboard
                </NeonButton>
              ) : (
                <NeonButton onClick={onGetStarted} variant="pill">
                  Get Early Access
                </NeonButton>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* SECTION 1: Epic Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Cinematic Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050814] via-[#0A1128] to-[#050B1B]" />

        {/* Massive Neon Glow Orbs */}
        <div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#3B82F6]/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#8B5CF6]/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#14F4C9]/10 rounded-full blur-[80px]" />

        {/* Neon Streaks */}
        <div className="absolute top-20 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />
        <div className="absolute bottom-20 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 border border-[#14F4C9]/30 rounded-full px-4 py-2 backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-[#14F4C9] animate-pulse" />
                <span
                  className="text-[#14F4C9] text-sm"
                  style={{
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: "0.01em",
                  }}
                >
                  AI Career Navigator • Early Access
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="text-white leading-[1.05]"
                style={{
                  fontSize: "clamp(3rem, 7vw, 5.5rem)",
                  fontWeight: 800,
                  fontFamily: "Space Grotesk, Inter, system-ui, sans-serif",
                  letterSpacing: "-0.04em",
                }}
              >
                Find Your Path.{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#3B82F6] via-[#14F4C9] to-[#8B5CF6] bg-clip-text text-transparent">
                    Let AI Navigate.
                  </span>
                  {/* Glow effect under text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/20 via-[#14F4C9]/20 to-[#8B5CF6]/20 blur-2xl" />
                </span>
              </h1>

              {/* Subheadline */}
              <p
                className="text-gray-300 leading-relaxed max-w-xl"
                style={{
                  fontSize: "19px",
                  fontWeight: 400,
                  fontFamily: "Inter, system-ui, sans-serif",
                  lineHeight: "1.8",
                }}
              >
                Navixo analyzes your goals, skills, and interests to generate{" "}
                <span className="text-[#14F4C9]" style={{ fontWeight: 500 }}>
                  personalized career paths
                </span>{" "}
                and{" "}
                <span className="text-[#8B5CF6]" style={{ fontWeight: 500 }}>
                  learning roadmaps
                </span>{" "}
                — built for students in Tier 2 & Tier 3 cities.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <NeonButton
                  onClick={
                    hasSession ? () => navigate("/dashboard") : onGetStarted
                  }
                  variant="primary"
                  style={{ fontSize: "17px" }}
                >
                  <span className="flex items-center gap-2">
                    {hasSession ? "Continue to Dashboard" : "Get Early Access"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </NeonButton>

                <NeonButton
                  onClick={() => scrollToSection("demo")}
                  variant="secondary"
                  style={{ fontSize: "17px" }}
                >
                  <span className="flex items-center gap-3">
                    <Play
                      className="w-6 h-6 group-hover:scale-110 transition-transform"
                      style={{ marginTop: "1px" }}
                    />
                    Watch Demo
                  </span>
                </NeonButton>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#14F4C9]" />
                  <span
                    style={{
                      fontWeight: 500,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#D5D9E2",
                    }}
                  >
                    AI-Powered
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  <span
                    style={{
                      fontWeight: 500,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#D5D9E2",
                    }}
                  >
                    Personalized
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span
                    style={{
                      fontWeight: 500,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#D5D9E2",
                    }}
                  >
                    Free to Start
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Floating Glass UI Mockups */}
            <motion.div
              className="relative h-[600px] hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {/* Chat Panel - Top Left */}
              <motion.div
                className="absolute top-0 left-0 w-80 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#3B82F6]/30 p-6 shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#F4F7FF",
                      }}
                    >
                      AI Chat
                    </p>
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#D5D9E2",
                      }}
                    >
                      Ask anything
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#E0E6F4",
                      }}
                    >{`"What career path should I choose?"`}</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#8B5CF6]/10 border border-[#3B82F6]/20 rounded-lg p-3">
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#F4F7FF",
                      }}
                    >
                      Analyzing your profile...
                    </p>
                    <div className="flex gap-1 mt-2">
                      <div className="w-1 h-1 rounded-full bg-[#14F4C9] animate-pulse" />
                      <div
                        className="w-1 h-1 rounded-full bg-[#14F4C9] animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-1 h-1 rounded-full bg-[#14F4C9] animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Roadmap Card - Center Right */}
              <motion.div
                className="absolute top-32 right-0 w-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#8B5CF6]/30 p-6 shadow-2xl"
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#14F4C9] flex items-center justify-center">
                    <Route className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#F4F7FF",
                      }}
                    >
                      Your Roadmap
                    </p>
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#D5D9E2",
                      }}
                    >
                      12 weeks
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
                        <span
                          className="text-[#8B5CF6] text-xs"
                          style={{ fontWeight: 600 }}
                        >
                          {i}
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#14F4C9]"
                          style={{ width: `${100 - i * 25}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Skill Gap Card - Bottom Left */}
              <motion.div
                className="absolute bottom-0 left-12 w-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#14F4C9]/30 p-6 shadow-2xl"
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14F4C9] to-[#3B82F6] flex items-center justify-center">
                    <Scan className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#F4F7FF",
                      }}
                    >
                      Skill Analysis
                    </p>
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#D5D9E2",
                      }}
                    >
                      Current vs Target
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#14F4C9]/10 border border-[#14F4C9]/20 rounded-lg p-3 text-center">
                    <p
                      className="text-[#14F4C9] text-2xl"
                      style={{ fontWeight: 700 }}
                    >
                      7
                    </p>
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#D5D9E2",
                      }}
                    >
                      Current Skills
                    </p>
                  </div>
                  <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-3 text-center">
                    <p
                      className="text-[#3B82F6] text-2xl"
                      style={{ fontWeight: 700 }}
                    >
                      5
                    </p>
                    <p
                      style={{
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#D5D9E2",
                      }}
                    >
                      To Learn
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Particles */}
              <motion.div
                className="absolute top-20 right-10 w-3 h-3 rounded-full bg-[#14F4C9] shadow-lg shadow-teal-500/50"
                animate={{ y: [0, -30, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-40 right-20 w-2 h-2 rounded-full bg-[#8B5CF6] shadow-lg shadow-purple-500/50"
                animate={{ y: [0, 20, 0], opacity: [1, 0.5, 1] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity }}
        >
          <span
            style={{
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#D5D9E2",
            }}
          >
            Scroll to discover more
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-[#14F4C9]" />
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: Demo / Video Section */}
      <section
        id="demo"
        className="relative py-32 bg-gradient-to-b from-[#050814] to-[#0A1128]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2
              className="text-white mb-6"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 700,
                fontFamily: "Space Grotesk, Inter, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              See Navixo in{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#14F4C9] bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "1.5",
                color: "#D5D9E2",
              }}
              className="max-w-2xl mx-auto"
            >
              Watch how students discover their perfect career path with AI
              guidance
            </p>
          </motion.div>

          {/* Video Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group cursor-pointer"
          >
            {/* Live Demo Badge */}
            <div
              className="absolute -top-4 left-8 z-20 bg-gradient-to-r from-[#14F4C9] to-[#3B82F6] text-white px-4 py-2 rounded-full shadow-lg shadow-teal-500/50"
              style={{
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Live Demo
              </div>
            </div>

            {/* Video Frame */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border-2 border-[#3B82F6]/30 overflow-hidden shadow-2xl shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all transform group-hover:scale-[1.02] duration-500">
              {/* Neon Glow Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/0 via-[#14F4C9]/20 to-[#8B5CF6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Placeholder Video Content */}
              <div className="relative aspect-video bg-gradient-to-br from-[#0A1128] to-[#050814] flex items-center justify-center">
                {/* Play Button */}
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all"
                  whileHover={{ scale: 1.1 }}
                >
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </motion.div>

                {/* Simulated UI in background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-8 left-8 right-8 bg-white/5 border border-white/10 rounded-xl h-20 backdrop-blur-sm" />
                  <div className="absolute top-36 left-8 w-64 bg-white/5 border border-white/10 rounded-xl h-32 backdrop-blur-sm" />
                  <div className="absolute bottom-8 right-8 w-80 bg-white/5 border border-white/10 rounded-xl h-24 backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Bullets Below Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-16"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "1.5",
                  color: "#E0E6F4",
                }}
              >
                Ask your questions in natural language
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "1.5",
                  color: "#E0E6F4",
                }}
              >
                Get AI-generated career paths & skill suggestions
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#14F4C9]/10 border border-[#14F4C9]/30 flex items-center justify-center flex-shrink-0">
                <Route className="w-4 h-4 text-[#14F4C9]" />
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: "1.5",
                  color: "#E0E6F4",
                }}
              >
                See a roadmap unfold in real-time
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: Three Neon Feature Cards */}
      <section id="features" className="relative py-32 bg-[#050814]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A1128]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-[#3B82F6]/20 rounded-full px-4 py-2 mb-6 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span
                className="text-[#3B82F6]"
                style={{
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  letterSpacing: "0.01em",
                }}
              >
                Core Features
              </span>
            </div>

            <h2
              className="text-white mb-6"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 700,
                fontFamily: "Space Grotesk, Inter, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Your AI{" "}
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#14F4C9] bg-clip-text text-transparent">
                Career Co-Pilot
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: AI Career Navigator */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-[#3B82F6]/20 group-hover:border-[#3B82F6]/50 p-8 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden">
                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/0 via-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Compass className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3
                    className="text-white mb-4"
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      fontFamily: "Space Grotesk, Inter, sans-serif",
                    }}
                  >
                    AI Career Navigator
                  </h3>

                  <p
                    className="mb-6"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#E0E6F4",
                    }}
                  >
                    Chat with Navixo to explore careers, roles, and real options
                    based on your profile.
                  </p>

                  <div className="flex items-center gap-2 text-[#3B82F6] group-hover:gap-3 transition-all">
                    <span
                      style={{
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Skill Gap Scanner */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-[#14F4C9]/20 group-hover:border-[#14F4C9]/50 p-8 shadow-xl group-hover:shadow-2xl group-hover:shadow-teal-500/20 transition-all duration-500 overflow-hidden">
                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#14F4C9]/0 via-[#14F4C9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14F4C9] to-[#0D9488] flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Scan className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3
                    className="text-white mb-4"
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      fontFamily: "Space Grotesk, Inter, sans-serif",
                    }}
                  >
                    Skill Gap Scanner
                  </h3>

                  <p
                    className="mb-6"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#E0E6F4",
                    }}
                  >
                    Instantly see what skills you lack for your dream role and
                    how to close the gap.
                  </p>

                  <div className="flex items-center gap-2 text-[#14F4C9] group-hover:gap-3 transition-all">
                    <span
                      style={{
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Dynamic Roadmaps */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/50 p-8 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden">
                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/0 via-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Route className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3
                    className="text-white mb-4"
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      fontFamily: "Space Grotesk, Inter, sans-serif",
                    }}
                  >
                    Dynamic Roadmaps
                  </h3>

                  <p
                    className="mb-6"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#E0E6F4",
                    }}
                  >
                    Navixo builds a step-by-step learning roadmap with
                    resources, timelines, and checkpoints.
                  </p>

                  <div className="flex items-center gap-2 text-[#8B5CF6] group-hover:gap-3 transition-all">
                    <span
                      style={{
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Interactive Journey / Timeline */}
      <section
        id="journey"
        className="relative py-32 bg-gradient-to-b from-[#050814] via-[#0A1128] to-[#050814]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2
              className="text-white mb-6"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 700,
                fontFamily: "Space Grotesk, Inter, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Your Journey to{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#14F4C9] bg-clip-text text-transparent">
                Clarity
              </span>
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "1.5",
                color: "#D5D9E2",
              }}
              className="max-w-2xl mx-auto"
            >
              From confusion to confidence in five simple steps
            </p>
          </motion.div>

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Glowing vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3B82F6] via-[#8B5CF6] to-[#14F4C9] opacity-30" />

            <div className="space-y-16">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative flex items-start gap-8"
              >
                {/* Node */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-[#050814]">
                    <span
                      className="text-white text-xl"
                      style={{ fontWeight: 700 }}
                    >
                      1
                    </span>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#3B82F6]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#3B82F6]/20 p-6">
                  <h3
                    style={{
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                      color: "#F4F7FF",
                      marginBottom: "8px",
                    }}
                  >
                    Start Confused
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#D5D9E2",
                    }}
                  >
                    {`You're not sure which career path to take or what skills you need. That's okay — most students feel this way.`}
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative flex items-start gap-8"
              >
                {/* Node */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-2xl shadow-purple-500/50 border-4 border-[#050814]">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#8B5CF6]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#8B5CF6]/20 p-6">
                  <h3
                    style={{
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                      color: "#F4F7FF",
                      marginBottom: "8px",
                    }}
                  >
                    Talk to Navixo
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#D5D9E2",
                    }}
                  >
                    Share your interests, goals, and background. Ask any career
                    question in natural language — Navixo listens.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative flex items-start gap-8"
              >
                {/* Node */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#14F4C9] flex items-center justify-center shadow-2xl shadow-teal-500/50 border-4 border-[#050814]">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#14F4C9]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#14F4C9]/20 p-6">
                  <h3
                    style={{
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                      color: "#F4F7FF",
                      marginBottom: "8px",
                    }}
                  >
                    Get a Personalized Career Path
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#D5D9E2",
                    }}
                  >
                    AI analyzes your profile and generates career options that
                    match your strengths, interests, and realistic goals.
                  </p>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative flex items-start gap-8"
              >
                {/* Node */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#14F4C9] to-[#0D9488] flex items-center justify-center shadow-2xl shadow-teal-500/50 border-4 border-[#050814]">
                    <Route className="w-7 h-7 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#14F4C9]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#14F4C9]/20 p-6">
                  <h3
                    style={{
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                      color: "#F4F7FF",
                      marginBottom: "8px",
                    }}
                  >
                    Follow the Roadmap
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#D5D9E2",
                    }}
                  >
                    Get a step-by-step learning plan with milestones, resources,
                    and timelines. Track your progress as you grow.
                  </p>
                </div>
              </motion.div>

              {/* Step 5 */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="relative flex items-start gap-8"
              >
                {/* Node */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#14F4C9] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-[#050814]">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border-2 border-[#3B82F6]/30 p-6">
                  <h3
                    style={{
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                      color: "#F4F7FF",
                      marginBottom: "8px",
                    }}
                  >
                    Reach Your Dream Role
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      lineHeight: "1.5",
                      color: "#D5D9E2",
                    }}
                  >
                    With clarity, direction, and AI guidance, you land your
                    target role — confident and prepared.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Social Proof / Impact */}
      <section id="impact" className="relative py-32 bg-[#050814]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2
              className="text-white mb-6"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 800,
                fontFamily: "Space Grotesk, Inter, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Built for Students Who{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                Don't Have Real Mentors
              </span>
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "1.5",
                color: "#D5D9E2",
              }}
              className="max-w-3xl mx-auto"
            >
              Students in Tier 2 & Tier 3 cities often lack access to quality
              career guidance. Navixo democratizes mentorship by bringing
              world-class AI navigation to everyone.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#3B82F6]/20 group-hover:border-[#3B82F6]/40 p-8 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/0 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div
                    className="text-5xl mb-4"
                    style={{
                      fontWeight: 800,
                      fontFamily: "Space Grotesk, Inter, sans-serif",
                    }}
                  >
                    <span className="bg-gradient-to-r from-[#3B82F6] to-[#14F4C9] bg-clip-text text-transparent">
                      10K+
                    </span>
                  </div>
                  <h3
                    className="relative text-xl mb-3"
                    style={{
                      fontWeight: 600,
                      fontFamily: "Space Grotesk, sans-serif",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <span
                      className="bg-gradient-to-r from-[#E5F1FF] to-[#BEE3FA] bg-clip-text text-transparent"
                      style={{ textShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                    >
                      Students Guided
                    </span>
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      color: "#AEB6C7",
                    }}
                  >
                    Early access users finding clarity
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/40 p-8 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-500 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/0 to-[#8B5CF6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div
                    className="text-5xl mb-4"
                    style={{
                      fontWeight: 800,
                      fontFamily: "Space Grotesk, Inter, sans-serif",
                    }}
                  >
                    <span className="bg-gradient-to-r from-[#8B5CF6] to-[#14F4C9] bg-clip-text text-transparent">
                      100%
                    </span>
                  </div>
                  <h3
                    className="relative text-xl mb-3"
                    style={{
                      fontWeight: 600,
                      fontFamily: "Space Grotesk, sans-serif",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <span
                      className="bg-gradient-to-r from-[#E5F1FF] to-[#D4C5F9] bg-clip-text text-transparent"
                      style={{ textShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
                    >
                      Personalized Paths
                    </span>
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      color: "#AEB6C7",
                    }}
                  >
                    Not generic advice — tailored to you
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-[#14F4C9]/20 group-hover:border-[#14F4C9]/40 p-8 shadow-xl group-hover:shadow-2xl group-hover:shadow-teal-500/20 transition-all duration-500 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#14F4C9]/0 to-[#14F4C9]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div
                    className="text-5xl mb-4"
                    style={{
                      fontWeight: 800,
                      fontFamily: "Space Grotesk, Inter, sans-serif",
                    }}
                  >
                    <span className="bg-gradient-to-r from-[#14F4C9] to-[#3B82F6] bg-clip-text text-transparent">
                      AI
                    </span>
                  </div>
                  <h3
                    className="relative text-xl mb-3"
                    style={{
                      fontWeight: 600,
                      fontFamily: "Space Grotesk, sans-serif",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <span
                      className="bg-gradient-to-r from-[#D4F4EC] to-[#BEE3FA] bg-clip-text text-transparent"
                      style={{ textShadow: "0 0 20px rgba(20, 244, 201, 0.3)" }}
                    >
                      Career-Focused Only
                    </span>
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      color: "#AEB6C7",
                    }}
                  >
                    Domain-restricted AI for careers
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Final CTA - Grand Cinematic */}
      <section className="relative py-32 overflow-hidden">
        {/* Epic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050814] via-[#0A1535] to-[#050B1B]" />

        {/* Massive glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-gradient-to-r from-[#3B82F6]/30 via-[#8B5CF6]/20 to-[#14F4C9]/30 rounded-full blur-[150px]" />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59, 130, 246, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 1) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-white mb-8 leading-tight"
              style={{
                fontSize: "clamp(2.75rem, 6vw, 5rem)",
                fontWeight: 900,
                fontFamily: "Space Grotesk, Inter, system-ui, sans-serif",
                letterSpacing: "-0.04em",
              }}
            >
              Ready to Stop Guessing{" "}
              <span className="block bg-gradient-to-r from-[#3B82F6] via-[#14F4C9] to-[#8B5CF6] bg-clip-text text-transparent">
                Your Career?
              </span>
            </h2>

            <p
              className="mb-12 max-w-3xl mx-auto"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "19px",
                lineHeight: "1.5",
                color: "#D5D9E2",
              }}
            >
              Join the first wave of students using AI to navigate careers with
              clarity. Get personalized paths, skill insights, and dynamic
              roadmaps.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <NeonButton
                onClick={
                  hasSession ? () => navigate("/dashboard") : onGetStarted
                }
                variant="primary"
                className="px-12 py-8"
                style={{ fontSize: "18px" }}
              >
                <span className="flex items-center gap-3">
                  {hasSession ? "Go to Dashboard" : "Get Early Access"}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </NeonButton>

              <NeonButton
                onClick={onGetStarted}
                variant="secondary"
                className="px-12 py-8"
                style={{ fontSize: "18px" }}
              >
                Join Waitlist
              </NeonButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER - Control Center Style */}
      <footer className="relative border-t border-[#3B82F6]/10 py-16 bg-[#050814]">
        {/* Subtle top neon line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />

        {/* Tiny glowing dot animation in background */}
        <div className="absolute top-8 left-1/4 w-1 h-1 rounded-full bg-[#14F4C9] animate-pulse" />
        <div
          className="absolute bottom-8 right-1/3 w-1 h-1 rounded-full bg-[#8B5CF6] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Left - Logo & Tagline */}
            <div>
              <div className="mb-4">
                <NavixoLogo size={28} variant="white" />
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#D5D9E2",
                }}
              >
                {`Navixo is India's AI Career OS.`}
              </p>
            </div>

            {/* Middle - Links */}
            <div className="flex flex-col gap-3">
              <h4
                style={{
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#F4F7FF",
                  marginBottom: "8px",
                  letterSpacing: "0.01em",
                }}
              >
                Platform
              </h4>
              <FooterLink
                variant="primary"
                onClick={() => scrollToSection("features")}
              >
                Product
              </FooterLink>
              <FooterLink
                variant="primary"
                onClick={() => scrollToSection("journey")}
              >
                About
              </FooterLink>
              <FooterLink
                variant="primary"
                onClick={() => scrollToSection("features")}
              >
                Roadmap
              </FooterLink>
              <FooterLink
                variant="primary"
                onClick={() => scrollToSection("impact")}
              >
                Support
              </FooterLink>
            </div>

            {/* Right - Built Info & Social */}
            <div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#D5D9E2",
                  marginBottom: "16px",
                }}
              >
                Built at MNNIT • Made for students everywhere
              </p>
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#3B82F6]/30 flex items-center justify-center transition-all group">
                  <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-[#3B82F6] transition-colors" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#14F4C9]/30 flex items-center justify-center transition-all group">
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-[#14F4C9] transition-colors" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#8B5CF6]/30 flex items-center justify-center transition-all group">
                  <Github className="w-5 h-5 text-gray-400 group-hover:text-[#8B5CF6] transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom - Copyright */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#9CA3AF",
              }}
            >
              © 2026 Navixo. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <FooterLink variant="secondary" href="https://navixo.com/privacy">
                Privacy Policy
              </FooterLink>
              <FooterLink variant="secondary" href="https://navixo.com/terms">
                Terms of Service
              </FooterLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
