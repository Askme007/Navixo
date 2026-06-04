import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { MessageSquare, Map, Target, LogOut, TrendingUp, Brain, Zap, Clock, Award, BarChart3, ArrowRight, Sparkles, Users, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { PaiLogo } from '../PaiLogo';

interface DashboardProps {
  userName: string;
  onNavigate: (page: 'chatbot' | 'roadmap' | 'skillgap') => void;
  onLogout: () => void;
}

export function Dashboard({ userName, onNavigate, onLogout }: DashboardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll reset on mount - always load at top
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={scrollContainerRef} className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Top Navigation */}
      <header className="border-b border-[#333333] bg-[#1A1A1A] sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#232323] border border-[#333333] rounded-lg">
                <PaiLogo className="w-4 h-4 text-white" size={18} />
                <span className="text-sm text-white" style={{ fontWeight: 600 }}>PAI</span>
              </div>
              <span className="hidden sm:inline text-sm text-[#BFBFBF]" style={{ fontWeight: 500 }}>Pathfinder AI</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden md:inline text-sm text-[#F5F5F5]" style={{ fontWeight: 500 }}>Welcome, {userName}</span>
              <Button 
                variant="ghost" 
                onClick={onLogout} 
                className="text-[#BFBFBF] hover:text-white hover:bg-white/5 transition-colors"
                style={{ fontWeight: 500 }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN - Quick Actions */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-4 shadow-sm">
                <h3 className="text-sm text-white mb-4" style={{ fontWeight: 600 }}>Quick Actions</h3>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('chatbot')}
                    className="w-full flex items-center gap-3 p-3 bg-[#2B2B2B] hover:bg-[#333333] border border-[#3A3A3A] rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>Ask PAI a Question</p>
                      <p className="text-xs text-[#BFBFBF]">Get career guidance</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#BFBFBF] group-hover:text-white transition-colors" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('roadmap')}
                    className="w-full flex items-center gap-3 p-3 bg-[#2B2B2B] hover:bg-[#333333] border border-[#3A3A3A] rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Map className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>Generate Roadmap</p>
                      <p className="text-xs text-[#BFBFBF]">Plan your journey</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#BFBFBF] group-hover:text-white transition-colors" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('skillgap')}
                    className="w-full flex items-center gap-3 p-3 bg-[#2B2B2B] hover:bg-[#333333] border border-[#3A3A3A] rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>Start Assessment</p>
                      <p className="text-xs text-[#BFBFBF]">Identify strengths</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#BFBFBF] group-hover:text-white transition-colors" />
                  </motion.button>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-4 shadow-sm">
                <h3 className="text-sm text-white mb-4" style={{ fontWeight: 600 }}>Your Activity</h3>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-[#666666] mx-auto mb-3" />
                    <p className="text-xs text-[#AFAFAF] mb-2" style={{ fontWeight: 500 }}>
                      No activity yet
                    </p>
                    <p className="text-xs text-[#808080]" style={{ fontWeight: 500 }}>
                      Start exploring to see your stats
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* CENTER COLUMN - Overview Panel */}
            <section className="lg:col-span-6 space-y-6">
              {/* Welcome Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl text-white mb-1" style={{ fontWeight: 600 }}>
                      Welcome to PAI — Your Personalized Career Partner
                    </h2>
                    <p className="text-sm text-[#AFAFAF]" style={{ lineHeight: '1.6', fontWeight: 500 }}>
                      AI-powered career navigation for any profession or field
                    </p>
                  </div>
                </div>
                <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3"></div>
              </motion.div>

              {/* Current Profile Overview */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm text-white" style={{ fontWeight: 600 }}>Current Profile Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                    <p className="text-xs text-[#AFAFAF] mb-1" style={{ fontWeight: 500 }}>Your Current Focus</p>
                    <p className="text-sm text-white" style={{ fontWeight: 500 }}>Set by AI after first consultation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                      <p className="text-xs text-[#AFAFAF] mb-1" style={{ fontWeight: 500 }}>Skills Summary</p>
                      <p className="text-xs text-white" style={{ fontWeight: 500 }}>AI-generated</p>
                    </div>
                    <div className="p-3 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                      <p className="text-xs text-[#AFAFAF] mb-1" style={{ fontWeight: 500 }}>Career Goals</p>
                      <p className="text-xs text-white" style={{ fontWeight: 500 }}>AI-generated</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#808080]" style={{ fontWeight: 500 }}>
                    <span>Last updated by PAI</span>
                    <span>Dynamic data</span>
                  </div>
                </div>
              </div>

              {/* Universal Progress Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#232323] border-[#3A3A3A] p-4 hover:border-[#4A4A4A] transition-colors shadow-sm">
                  <div className="text-center py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-xs text-[#AFAFAF] mb-2" style={{ fontWeight: 500 }}>Overall Progress</p>
                    <p className="text-sm text-[#808080]" style={{ fontWeight: 500 }}>Not yet analyzed</p>
                  </div>
                </Card>

                <Card className="bg-[#232323] border-[#3A3A3A] p-4 hover:border-[#4A4A4A] transition-colors shadow-sm">
                  <div className="text-center py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-xs text-[#AFAFAF] mb-2" style={{ fontWeight: 500 }}>Skill Mastery Index</p>
                    <p className="text-sm text-[#808080]" style={{ fontWeight: 500 }}>Not yet analyzed</p>
                  </div>
                </Card>

                <Card className="bg-[#232323] border-[#3A3A3A] p-4 hover:border-[#4A4A4A] transition-colors shadow-sm">
                  <div className="text-center py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-xs text-[#AFAFAF] mb-2" style={{ fontWeight: 500 }}>Active Hours</p>
                    <p className="text-sm text-[#808080]" style={{ fontWeight: 500 }}>0 hours</p>
                  </div>
                </Card>

                <Card className="bg-[#232323] border-[#3A3A3A] p-4 hover:border-[#4A4A4A] transition-colors shadow-sm">
                  <div className="text-center py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-xs text-[#AFAFAF] mb-2" style={{ fontWeight: 500 }}>Learning Momentum</p>
                    <p className="text-sm text-[#808080]" style={{ fontWeight: 500 }}>Not yet analyzed</p>
                  </div>
                </Card>
              </div>

              {/* Your Career Journey - Generic Stages */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Map className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm text-white" style={{ fontWeight: 600 }}>Your Career Journey</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Exploration Stage</p>
                      <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>Discovering interests and opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Learning Stage</p>
                      <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>Building foundational knowledge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Skill Development</p>
                      <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>Mastering core competencies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Practice & Application</p>
                      <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>Real-world experience and projects</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white mb-1" style={{ fontWeight: 500 }}>Career Progression</p>
                      <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>Advancing to new opportunities</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart/Visualization Area */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-6 shadow-sm">
                <h3 className="text-sm text-white mb-4" style={{ fontWeight: 600 }}>Progress Visualization</h3>
                <div className="h-48 flex items-center justify-center border border-[#3A3A3A] rounded-lg bg-[#1C1C1C]">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm text-[#AFAFAF]" style={{ fontWeight: 500 }}>Dynamic chart placeholder</p>
                    <p className="text-xs text-[#808080]" style={{ fontWeight: 500 }}>AI will populate with career data</p>
                  </div>
                </div>
              </div>

              {/* Main Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('chatbot')}
                  className="bg-[#232323] border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-xl p-5 text-left transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-3 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-colors">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-sm text-white mb-1" style={{ fontWeight: 600 }}>AI Mentor</h4>
                  <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                    Get personalized guidance
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('roadmap')}
                  className="bg-[#232323] border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-xl p-5 text-left transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-3 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                    <Map className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-sm text-white mb-1" style={{ fontWeight: 600 }}>Roadmap</h4>
                  <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                    Create your career path
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('skillgap')}
                  className="bg-[#232323] border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-xl p-5 text-left transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center mb-3 group-hover:from-orange-500/30 group-hover:to-amber-500/30 transition-colors">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                  <h4 className="text-sm text-white mb-1" style={{ fontWeight: 600 }}>Assessment</h4>
                  <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                    Discover your strengths
                  </p>
                </motion.button>
              </div>
            </section>

            {/* RIGHT COLUMN - Adaptive AI Modules */}
            <aside className="lg:col-span-3 space-y-4">
              {/* Career Insights (AI Generated) */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-4 shadow-sm">
                <h3 className="text-sm text-white mb-4" style={{ fontWeight: 600 }}>Career Insights</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white" style={{ fontWeight: 500 }}>Recommended Next Steps</p>
                    </div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      AI will suggest personalized actions based on your profile and goals
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400" style={{ fontWeight: 500 }}>
                      Dynamic
                    </span>
                  </div>

                  <div className="p-3 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white" style={{ fontWeight: 500 }}>Strengths & Opportunities</p>
                    </div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      Analysis of your capabilities and areas for growth in your field
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-[10px] text-yellow-400" style={{ fontWeight: 500 }}>
                      AI-Generated
                    </span>
                  </div>

                  <div className="p-3 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white" style={{ fontWeight: 500 }}>Progress Update</p>
                    </div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      Track your development and achievements over time
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400" style={{ fontWeight: 500 }}>
                      Live Data
                    </span>
                  </div>

                  <div className="p-3 bg-[#2B2B2B] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white" style={{ fontWeight: 500 }}>Suggested Assessment</p>
                    </div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      Complete evaluations to unlock detailed roadmaps for your career
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-[10px] text-orange-400" style={{ fontWeight: 500 }}>
                      Action
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill Progress Panel */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-4 shadow-sm">
                <h3 className="text-sm text-white mb-4" style={{ fontWeight: 600 }}>Skill Progress</h3>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <Target className="w-8 h-8 text-[#666666] mx-auto mb-3" />
                    <p className="text-xs text-[#AFAFAF] mb-2" style={{ fontWeight: 500 }}>
                      No skill data yet
                    </p>
                    <p className="text-xs text-[#808080] mb-4" style={{ fontWeight: 500 }}>
                      Your personalized skills will appear here after assessment
                    </p>
                    <Button 
                      onClick={() => onNavigate('skillgap')}
                      className="w-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-400 hover:text-orange-300 transition-colors text-xs"
                      style={{ fontWeight: 500 }}
                    >
                      <Target className="w-3 h-3 mr-2" />
                      Begin Skill Assessment
                    </Button>
                  </div>
                </div>
              </div>

              {/* PAI Tips - Universal */}
              <div className="bg-[#232323] border border-[#3A3A3A] rounded-xl p-4 shadow-sm">
                <h3 className="text-sm text-white mb-3" style={{ fontWeight: 600 }}>PAI Tips</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      Ask specific questions for tailored career advice
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      Keep your profile updated for accurate recommendations
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-xs text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                      Regular assessments help track your progress effectively
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}