import { Button } from '../ui/button';
import { Brain, Map, Target, Sparkles, MessageSquare, BookOpen, BarChart3, CheckCircle, ArrowRight, Menu, X, TrendingUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { PaiLogo } from '../PaiLogo';
import { ShimmerButton } from '../ShimmerButton';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#2B2B2B] bg-[#1E1E1E] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#232323] border border-[#333333] rounded-lg flex items-center justify-center">
                <PaiLogo className="w-5 h-5 text-white" size={20} />
              </div>
              <span className="text-white" style={{ fontWeight: 600 }}>PAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-[#BFBFBF] hover:text-white transition-colors text-sm"
                style={{ fontWeight: 500 }}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-[#BFBFBF] hover:text-white transition-colors text-sm"
                style={{ fontWeight: 500 }}
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('demo')}
                className="text-[#BFBFBF] hover:text-white transition-colors text-sm"
                style={{ fontWeight: 500 }}
              >
                Demo
              </button>
              <ShimmerButton 
                onClick={onGetStarted}
                className="bg-white text-black hover:bg-[#f5f5f5] px-6 py-2 rounded-md"
                style={{ fontWeight: 600 }}
              >
                Sign In
              </ShimmerButton>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-[#2B2B2B] pt-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-[#BFBFBF] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-4 py-2 text-[#BFBFBF] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="block w-full text-left px-4 py-2 text-[#BFBFBF] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Demo
              </button>
              <ShimmerButton
                onClick={onGetStarted}
                className="w-full bg-white text-black hover:bg-[#f5f5f5] mt-2 py-2 rounded-md"
                style={{ fontWeight: 600 }}
              >
                Sign In
              </ShimmerButton>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* PAI Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#232323] border border-[#333333] rounded-2xl mb-8">
            <PaiLogo className="w-12 h-12 text-white" size={48} />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-white mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight" style={{ fontWeight: 700 }}>
            Pathfinder AI — Your Personal Career Mentor
          </h1>
          
          {/* Subtext */}
          <p className="text-[#BFBFBF] mb-10 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed" style={{ fontWeight: 500 }}>
            AI-powered career guidance, skill analysis, personalized roadmaps, and mentorship — built to help anyone find their best path forward.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <ShimmerButton 
              onClick={onGetStarted}
              className="bg-white text-black hover:bg-[#f5f5f5] px-10 py-6 h-auto text-base w-full sm:w-auto flex items-center justify-center gap-2 rounded-md"
              style={{ fontWeight: 600 }}
            >
              Launch 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                <path d="M7 4h14v2h-4v12h-2V6H9v12H7V6H4V4h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <ArrowRight className="w-5 h-5" />
            </ShimmerButton>
            
            <Button 
              onClick={() => scrollToSection('features')}
              size="lg"
              variant="outline"
              className="border-[#333333] bg-transparent text-white hover:bg-white/5 px-10 py-6 h-auto text-base w-full sm:w-auto"
              style={{ fontWeight: 600 }}
            >
              Explore Features
            </Button>
          </div>
          
          <p className="text-xs text-[#808080]" style={{ fontWeight: 500 }}>
            Free to use • No credit card required • AI-powered insights
          </p>
        </div>
      </section>

      {/* What PAI Does - Feature Blocks */}
      <section id="features" className="py-16 sm:py-20 md:py-24 bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-white mb-4 text-2xl sm:text-3xl md:text-4xl" style={{ fontWeight: 700 }}>
              What PAI Does
            </h2>
            <p className="text-[#BFBFBF] max-w-2xl mx-auto text-base sm:text-lg" style={{ fontWeight: 500 }}>
              Four powerful AI tools to guide your career journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 - Personalized Career Roadmaps */}
            <Card className="bg-[#232323] border-[#333333] hover:border-[#444444] transition-all">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-6">
                  <Map className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                  Personalized Career Roadmaps
                </h3>
                <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                  AI creates customized step-by-step plans for any field. Get clear milestones and learning paths tailored to your goals.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 - Skill Gap Analysis */}
            <Card className="bg-[#232323] border-[#333333] hover:border-[#444444] transition-all">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                  Skill Gap Analysis
                </h3>
                <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                  Understand strengths, weaknesses, and what to improve. Get data-driven insights into your skill profile.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 - AI Mentor Guidance */}
            <Card className="bg-[#232323] border-[#333333] hover:border-[#444444] transition-all">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                  AI Mentor Guidance
                </h3>
                <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                  Ask anything — from career doubts to project suggestions. Get instant, personalized advice 24/7.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 - Smart Assessments */}
            <Card className="bg-[#232323] border-[#333333] hover:border-[#444444] transition-all">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                  Smart Assessments
                </h3>
                <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                  Tests, quizzes, and evaluations to tailor your learning path. Adaptive difficulty matches your level.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-white mb-4 text-2xl sm:text-3xl md:text-4xl" style={{ fontWeight: 700 }}>
              How It Works
            </h2>
            <p className="text-[#BFBFBF] max-w-2xl mx-auto text-base sm:text-lg" style={{ fontWeight: 500 }}>
              Three simple steps to unlock your career potential
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl mb-6">
                <span className="text-2xl text-cyan-400" style={{ fontWeight: 700 }}>1</span>
              </div>
              <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                Tell PAI About You
              </h3>
              <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                Answer a few onboarding questions about your background, interests, and career goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 border border-purple-500/30 rounded-2xl mb-6">
                <span className="text-2xl text-purple-400" style={{ fontWeight: 700 }}>2</span>
              </div>
              <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                Run Your Assessment
              </h3>
              <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                Take AI-powered skill assessments to understand your current level and identify areas for growth.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl mb-6">
                <span className="text-2xl text-emerald-400" style={{ fontWeight: 700 }}>3</span>
              </div>
              <h3 className="text-white mb-3 text-xl" style={{ fontWeight: 600 }}>
                Get Your Personalized Plan
              </h3>
              <p className="text-[#AFAFAF] leading-relaxed" style={{ fontWeight: 500 }}>
                Access your dashboard with custom roadmaps, insights, and recommendations tailored to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section id="demo" className="py-16 sm:py-20 md:py-24 bg-[#1E1E1E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-white mb-4 text-2xl sm:text-3xl md:text-4xl" style={{ fontWeight: 700 }}>
              See PAI in Action
            </h2>
            <p className="text-[#BFBFBF] max-w-2xl mx-auto text-base sm:text-lg" style={{ fontWeight: 500 }}>
              Experience the power of AI-driven career guidance
            </p>
          </div>

          <div className="space-y-6">
            {/* AI Mentor Preview */}
            <Card className="bg-[#232323] border-[#333333]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white mb-1 text-sm" style={{ fontWeight: 600 }}>PAI Mentor</p>
                    <div className="bg-[#2B2B2B] border border-[#333333] rounded-xl p-4">
                      <p className="text-[#EFEFEF] leading-relaxed" style={{ fontWeight: 500 }}>
                        "Hi! I'm your AI career mentor. Let's build your personalized roadmap! Tell me about your career goals and I'll create a custom plan with resources, milestones, and expert guidance."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quick Action 1 */}
                  <div className="bg-[#2B2B2B] border border-[#333333] rounded-lg p-4 hover:border-[#444444] transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-white text-sm" style={{ fontWeight: 600 }}>Generate Roadmap</h4>
                    </div>
                    <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>
                      Create a step-by-step career plan
                    </p>
                  </div>

                  {/* Quick Action 2 */}
                  <div className="bg-[#2B2B2B] border border-[#333333] rounded-lg p-4 hover:border-[#444444] transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white text-sm" style={{ fontWeight: 600 }}>Analyze Skills</h4>
                    </div>
                    <p className="text-xs text-[#AFAFAF]" style={{ fontWeight: 500 }}>
                      Identify gaps and strengths
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roadmap & Skill Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Roadmap Preview */}
              <Card className="bg-[#232323] border-[#333333]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Map className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white" style={{ fontWeight: 600 }}>Career Roadmap</h3>
                  </div>
                  <div className="space-y-3">
                    {/* Roadmap Steps */}
                    <div className="bg-[#2B2B2B] border border-[#333333] rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-white text-sm mb-1" style={{ fontWeight: 500 }}>Fundamentals</p>
                          <p className="text-xs text-[#808080]">Completed • 4 weeks</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#2B2B2B] border border-cyan-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-1" style={{ fontWeight: 500 }}>Intermediate Skills</p>
                          <p className="text-xs text-cyan-400">In Progress • 6 weeks</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#2B2B2B] border border-[#333333] rounded-lg p-3 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#666666] rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-white text-sm mb-1" style={{ fontWeight: 500 }}>Advanced Topics</p>
                          <p className="text-xs text-[#808080]">Not Started • 8 weeks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Gap Preview */}
              <Card className="bg-[#232323] border-[#333333]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white" style={{ fontWeight: 600 }}>Skill Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Skill Bar 1 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm" style={{ fontWeight: 500 }}>Communication</span>
                        <span className="text-emerald-400 text-xs" style={{ fontWeight: 600 }}>85%</span>
                      </div>
                      <div className="h-2 bg-[#2B2B2B] rounded-full border border-[#333333]">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    {/* Skill Bar 2 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm" style={{ fontWeight: 500 }}>Technical Skills</span>
                        <span className="text-blue-400 text-xs" style={{ fontWeight: 600 }}>72%</span>
                      </div>
                      <div className="h-2 bg-[#2B2B2B] rounded-full border border-[#333333]">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                    {/* Skill Bar 3 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm" style={{ fontWeight: 500 }}>Problem Solving</span>
                        <span className="text-amber-400 text-xs" style={{ fontWeight: 600 }}>68%</span>
                      </div>
                      <div className="h-2 bg-[#2B2B2B] rounded-full border border-[#333333]">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Credibility */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#BFBFBF] text-lg" style={{ fontWeight: 500 }}>
              Trusted by students and young professionals worldwide
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-[#232323] border-[#333333]">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-amber-400">★</div>
                  ))}
                </div>
                <p className="text-[#EFEFEF] mb-4 leading-relaxed text-sm" style={{ fontWeight: 500 }}>
                  "PAI helped me transition into data science with a clear roadmap. The skill gap analysis was incredibly accurate and the AI mentor guided me through every step."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center">
                    <span className="text-cyan-400 text-sm" style={{ fontWeight: 600 }}>AK</span>
                  </div>
                  <div>
                    <p className="text-white text-sm" style={{ fontWeight: 600 }}>Alex Kim</p>
                    <p className="text-xs text-[#808080]">Data Analyst</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#232323] border-[#333333]">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-amber-400">★</div>
                  ))}
                </div>
                <p className="text-[#EFEFEF] mb-4 leading-relaxed text-sm" style={{ fontWeight: 500 }}>
                  "As a college student, PAI made career planning so much clearer. The personalized roadmaps are like having a career counselor available 24/7. Game changer!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 text-sm" style={{ fontWeight: 600 }}>SR</span>
                  </div>
                  <div>
                    <p className="text-white text-sm" style={{ fontWeight: 600 }}>Sarah Rodriguez</p>
                    <p className="text-xs text-[#808080]">Computer Science Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-24 md:py-32 bg-[#1E1E1E] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-white mb-6 text-3xl sm:text-4xl md:text-5xl max-w-3xl mx-auto" style={{ fontWeight: 700 }}>
            Start Your Journey with Pathfinder AI
          </h2>
          <p className="text-[#BFBFBF] mb-10 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed" style={{ fontWeight: 500 }}>
            Take control of your career with AI-powered guidance, personalized roadmaps, and expert mentorship.
          </p>
          <ShimmerButton 
            onClick={onGetStarted}
            className="bg-white text-black hover:bg-[#f5f5f5] px-12 py-7 h-auto text-lg flex items-center justify-center gap-3 rounded-md inline-flex"
            style={{ fontWeight: 700 }}
          >
            Launch 
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
              <path d="M7 4h14v2h-4v12h-2V6H9v12H7V6H4V4h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <ArrowRight className="w-6 h-6" />
          </ShimmerButton>
          <p className="text-xs text-[#808080] mt-6" style={{ fontWeight: 500 }}>
            Join thousands of professionals advancing their careers with PAI
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12 border-t border-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#232323] border border-[#333333] rounded-lg flex items-center justify-center">
                  <PaiLogo className="w-5 h-5 text-white" size={20} />
                </div>
                <span className="text-white" style={{ fontWeight: 600 }}>PAI</span>
              </div>
              <p className="text-sm text-[#808080]" style={{ fontWeight: 500 }}>
                Your AI-powered career mentor
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-white text-sm" style={{ fontWeight: 600 }}>Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-[#808080] hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-[#808080] hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#demo" className="text-[#808080] hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-white text-sm" style={{ fontWeight: 600 }}>Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-[#808080] hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-[#808080] hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-[#808080] hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-white text-sm" style={{ fontWeight: 600 }}>Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-[#808080] hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-[#808080] hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-[#808080] hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2B2B2B] text-center">
            <p className="text-sm text-[#808080]">
              © 2025 Pathfinder AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}