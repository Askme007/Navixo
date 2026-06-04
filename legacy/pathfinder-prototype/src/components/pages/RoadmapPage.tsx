import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, LogOut, Sparkles, Download, Share2, Target, BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp, ChevronRight, PlayCircle, Clock, Lightbulb, Youtube, FileText, Code, MessageSquare, Save, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { RoadmapStep } from '../RoadmapStep';
import { ShareButton } from '../ShareButton';
import { DownloadPDFButton } from '../DownloadPDFButton';
import { SaveRoadmapButton } from '../SaveRoadmapButton';
import { SavedConfirmationPopup } from '../SavedConfirmationPopup';

interface RoadmapPageProps {
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToSkillGap?: () => void;
  onNavigateToChat?: (message: string) => void;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'not-started' | 'in-progress' | 'done';
  position: { x: number; y: number };
  resources?: Resource[];
  mentorTip?: string;
}

interface Resource {
  type: 'youtube' | 'course' | 'docs' | 'project';
  title: string;
  provider: string;
  url: string;
}

export function RoadmapPage({ userName, onBack, onLogout, onNavigateToSkillGap, onNavigateToChat }: RoadmapPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);
  const [generatingText, setGeneratingText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Scroll reset on mount - always load at top
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  const examplePrompts = [
    "Full Stack Web Developer",
    "AI/ML Engineer",
    "Data Analyst",
    "Mobile App Developer",
    "DevOps Engineer",
    "UI/UX Designer"
  ];

  const handleSaveRoadmap = async () => {
    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleViewDashboard = () => {
    setShowPopup(false);
    onBack(); // Navigate to dashboard
  };

  const generateRoadmap = async (career: string) => {
    setIsGenerating(true);
    setRoadmapGenerated(false);
    setVisibleNodes([]);
    setGeneratingText('Analyzing career path...');

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800));
    setGeneratingText('Building your personalized roadmap...');

    // Mock roadmap data - would come from AI in production
    const mockNodes: RoadmapNode[] = [
      {
        id: 'node-1',
        title: 'Programming Fundamentals',
        description: 'Master the basics of programming with HTML, CSS, and JavaScript. Build a strong foundation.',
        duration: '4 weeks',
        level: 'beginner',
        status: 'not-started',
        position: { x: 50, y: 10 },
        resources: [
          { type: 'youtube', title: 'JavaScript Crash Course', provider: 'Traversy Media', url: '#' },
          { type: 'course', title: 'HTML & CSS for Beginners', provider: 'freeCodeCamp', url: '#' },
          { type: 'docs', title: 'MDN Web Docs', provider: 'Mozilla', url: '#' },
        ],
        mentorTip: 'Focus on understanding concepts rather than memorizing syntax. Build small projects daily!'
      },
      {
        id: 'node-2',
        title: 'Version Control with Git',
        description: 'Learn Git and GitHub for version control and collaboration.',
        duration: '2 weeks',
        level: 'beginner',
        status: 'not-started',
        position: { x: 50, y: 25 },
        resources: [
          { type: 'youtube', title: 'Git & GitHub Tutorial', provider: 'The Net Ninja', url: '#' },
          { type: 'docs', title: 'Git Official Documentation', provider: 'Git', url: '#' },
          { type: 'project', title: 'Contribute to Open Source', provider: 'GitHub', url: '#' },
        ],
        mentorTip: 'Practice by creating repos for every project. Get comfortable with branching and merging!'
      },
      {
        id: 'node-3',
        title: 'React Framework',
        description: 'Deep dive into React, hooks, state management, and component architecture.',
        duration: '6 weeks',
        level: 'intermediate',
        status: 'not-started',
        position: { x: 30, y: 45 },
        resources: [
          { type: 'course', title: 'Complete React Developer', provider: 'Udemy', url: '#' },
          { type: 'docs', title: 'React Official Docs', provider: 'React', url: '#' },
          { type: 'project', title: 'Build 5 React Apps', provider: 'Your Portfolio', url: '#' },
        ],
        mentorTip: 'React is powerful but takes practice. Build real projects, not just tutorials!'
      },
      {
        id: 'node-4',
        title: 'Backend with Node.js',
        description: 'Build server-side applications with Node.js, Express, and databases.',
        duration: '6 weeks',
        level: 'intermediate',
        status: 'not-started',
        position: { x: 70, y: 45 },
        resources: [
          { type: 'course', title: 'Node.js Complete Guide', provider: 'Maximilian Schwarzmüller', url: '#' },
          { type: 'youtube', title: 'REST API Tutorial', provider: 'Web Dev Simplified', url: '#' },
          { type: 'docs', title: 'Express.js Documentation', provider: 'Express', url: '#' },
        ],
        mentorTip: 'Start with simple APIs. Understanding async/await is crucial for Node development.'
      },
      {
        id: 'node-5',
        title: 'Database Management',
        description: 'Master SQL and NoSQL databases. Learn MongoDB and PostgreSQL.',
        duration: '4 weeks',
        level: 'intermediate',
        status: 'not-started',
        position: { x: 50, y: 60 },
        resources: [
          { type: 'course', title: 'Complete SQL Bootcamp', provider: 'Udemy', url: '#' },
          { type: 'docs', title: 'MongoDB University', provider: 'MongoDB', url: '#' },
        ],
        mentorTip: 'Understand when to use SQL vs NoSQL. Practice with real data modeling scenarios.'
      },
      {
        id: 'node-6',
        title: 'Full-Stack Project',
        description: 'Build and deploy a complete full-stack application from scratch.',
        duration: '8 weeks',
        level: 'advanced',
        status: 'not-started',
        position: { x: 35, y: 80 },
        resources: [
          { type: 'project', title: 'E-commerce Platform', provider: 'Your Portfolio', url: '#' },
          { type: 'project', title: 'Social Media Clone', provider: 'Your Portfolio', url: '#' },
        ],
        mentorTip: 'This is where everything comes together. Choose a project that excites you!'
      },
      {
        id: 'node-7',
        title: 'DevOps & Deployment',
        description: 'Learn Docker, CI/CD, and cloud deployment with AWS or Azure.',
        duration: '4 weeks',
        level: 'advanced',
        status: 'not-started',
        position: { x: 65, y: 80 },
        resources: [
          { type: 'course', title: 'Docker for Developers', provider: 'Docker', url: '#' },
          { type: 'docs', title: 'AWS Free Tier Guide', provider: 'AWS', url: '#' },
        ],
        mentorTip: 'DevOps skills make you stand out. Start with Docker, then move to cloud platforms.'
      },
      {
        id: 'node-8',
        title: 'Job Preparation',
        description: 'Build portfolio, practice interviews, and start applying to positions.',
        duration: '4 weeks',
        level: 'advanced',
        status: 'not-started',
        position: { x: 50, y: 95 },
        resources: [
          { type: 'project', title: 'Portfolio Website', provider: 'Your Portfolio', url: '#' },
          { type: 'course', title: 'Interview Preparation', provider: 'LeetCode', url: '#' },
        ],
        mentorTip: 'Your portfolio is your resume. Make it impressive with 3-5 solid projects!'
      },
    ];

    setRoadmapNodes(mockNodes);

    // Animate nodes appearing one by one
    for (let i = 0; i < mockNodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setVisibleNodes(prev => [...prev, mockNodes[i].id]);
    }

    setIsGenerating(false);
    setRoadmapGenerated(true);
    setSelectedNode(mockNodes[0]);
  };

  const handleGenerate = () => {
    if (input.trim()) {
      generateRoadmap(input);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'from-blue-400 to-blue-600';
      case 'intermediate':
        return 'from-amber-400 to-amber-600';
      case 'advanced':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'docs':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'project':
        return <Code className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const completedCount = roadmapNodes.filter(n => n.status === 'done').length;
  const totalCount = roadmapNodes.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div ref={scrollContainerRef} className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Header */}
      <div className="bg-[#232323] border-b border-[#333333] sticky top-0 z-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" onClick={onBack} className="gap-1 md:gap-2 text-white hover:bg-white/5 text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                <h2 className="text-white text-sm sm:text-base" style={{ fontWeight: 600 }}>
                  AI Roadmap Generator
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-[#f5f5f5] hidden sm:inline text-sm" style={{ fontWeight: 500 }}>{userName}</span>
              <Button variant="outline" onClick={onLogout} className="gap-1 md:gap-2 border-[#333333] bg-transparent text-white hover:bg-white/5 text-xs sm:text-sm px-2 sm:px-4">
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 min-h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-3 md:gap-4 pb-4 md:pb-6">
          {/* Top Section - Input Area */}
          <div className="bg-[#262626] border border-[#333333] rounded-xl p-4 md:p-6 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-[#ffffff] mb-2" style={{ fontWeight: 600 }}>Ask Pathfinder</h3>
              <p className="text-[#d4d4d4] text-sm mb-4" style={{ fontWeight: 500 }}>What roadmap do you want to explore today?</p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Full Stack Web Developer, AI Researcher, Data Analyst..."
                  className="flex-1 bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500 h-12"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!input.trim() || isGenerating}
                  className="h-12 px-6 sm:px-8 bg-white text-black hover:bg-[#f5f5f5] flex-1 sm:flex-none"
                  style={{ fontWeight: 600 }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                      <span className="hidden sm:inline ml-2">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="hidden sm:inline ml-2">Generate</span>
                    </>
                  )}
                </Button>
              </div>

              {!roadmapGenerated && (
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((prompt, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-[#1E1E1E] text-[#f5f5f5] border border-[#333333] cursor-pointer hover:bg-[#2B2B2B] transition-colors px-3 py-1"
                      onClick={() => setInput(prompt)}
                    >
                      {prompt}
                    </Badge>
                  ))}
                </div>
              )}

              {isGenerating && (
                <div className="flex items-center gap-3 mt-4 p-4 bg-[#1E1E1E] rounded-lg border border-[#333333]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-cyan-400" style={{ fontWeight: 500 }}>{generatingText}</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle Section - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
            {/* Left Section - Roadmap Visualization */}
            <div className="lg:col-span-8 bg-[#262626] border border-[#333333] rounded-xl p-4 md:p-6 shadow-sm">
              {!roadmapGenerated && !isGenerating ? (
                <div className="min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#2B2B2B] rounded-full flex items-center justify-center mb-4 md:mb-6 border border-[#333333]">
                    <Target className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                  </div>
                  <h3 className="text-[#ffffff] mb-2 text-base md:text-lg" style={{ fontWeight: 600 }}>Ready to Build Your Path?</h3>
                  <p className="text-[#b4b4b4] max-w-md text-sm" style={{ fontWeight: 500 }}>
                    Enter your dream career or skill above, and watch as AI generates a personalized, step-by-step roadmap just for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                    {roadmapNodes.map((node, index) => {
                      const isVisible = visibleNodes.includes(node.id);
                      const prevNode = index > 0 ? roadmapNodes[index - 1] : null;

                      return (
                        <div key={node.id}>
                          {/* Connecting Line */}
                          {prevNode && isVisible && (
                            <div className="flex justify-center mb-2">
                              <div className={`w-0.5 h-8 bg-gradient-to-b ${getLevelColor(node.level)} opacity-50 rounded-full`} />
                            </div>
                          )}

                          {/* Roadmap Step Component */}
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
                          />
                        </div>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* Right Section - Resource & Mentorship Panel */}
            <div className="lg:col-span-4 bg-[#262626] border border-[#333333] rounded-xl p-4 md:p-6 shadow-sm">
              {selectedNode ? (
                <div className="space-y-4 md:space-y-6">
                    {/* Selected Node Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                        <h3 className="text-[#ffffff] text-sm md:text-base" style={{ fontWeight: 600 }}>AI Recommendations</h3>
                      </div>
                      <div className="p-3 md:p-4 bg-[#2B2B2B] border border-[#333333] rounded-xl">
                        <h4 className="text-[#ffffff] mb-1 text-sm md:text-base" style={{ fontWeight: 600 }}>{selectedNode.title}</h4>
                        <p className="text-xs md:text-sm text-[#b4b4b4]" style={{ fontWeight: 500 }}>{selectedNode.duration} • {selectedNode.level}</p>
                      </div>
                    </div>

                    <Separator className="bg-[#333333]" />

                    {/* Resources */}
                    <div>
                      <h4 className="text-[#ffffff] mb-3 flex items-center gap-2 text-sm md:text-base" style={{ fontWeight: 600 }}>
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        Top Resources
                      </h4>
                      <div className="space-y-2">
                        {selectedNode.resources?.map((resource, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 md:p-3 bg-[#222222] hover:bg-[#2B2B2B] border border-[#333333] rounded-lg transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="w-7 h-7 md:w-8 md:h-8 bg-[#2B2B2B] border border-[#333333] rounded-lg flex items-center justify-center flex-shrink-0">
                                {getResourceIcon(resource.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-[#ffffff] group-hover:text-cyan-400 transition-colors" style={{ fontWeight: 500 }}>
                                  {resource.title}
                                </p>
                                <p className="text-xs text-[#888888]" style={{ fontWeight: 500 }}>{resource.provider}</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#888888] group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-[#333333]" />

                    {/* Mentor Tip */}
                    {selectedNode.mentorTip && (
                      <div className="p-3 md:p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-[#ffffff] text-xs md:text-sm mb-1 md:mb-2" style={{ fontWeight: 600 }}>AI Mentor Tip</h4>
                            <p className="text-xs md:text-sm text-[#d4d4d4] italic" style={{ fontWeight: 500 }}>"{selectedNode.mentorTip}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ask AI Mentor Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2 text-sm md:text-base" 
                      style={{ fontWeight: 600 }}
                      onClick={() => {
                        if (onNavigateToChat) {
                          const roadmapContext = `Hi PAI, here is my current roadmap. I want to ask further questions about it.\n\n[Roadmap context will be inserted here]`;
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
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-purple-500/30">
                    <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                  </div>
                  <p className="text-[#b4b4b4] text-xs md:text-sm" style={{ fontWeight: 500 }}>
                    Select a milestone from the roadmap to see personalized resources and mentor tips
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Utility Bar */}
          {roadmapGenerated && (
            <div className="bg-[#262626] border border-[#333333] rounded-xl p-3 md:p-4 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs md:text-sm text-[#ffffff]" style={{ fontWeight: 500 }}>
                        You've completed <span className="text-emerald-400" style={{ fontWeight: 600 }}>{completedCount}/{totalCount} steps</span>
                      </p>
                      <Progress value={progressPercentage} className="w-32 sm:w-48 h-2 mt-1" />
                    </div>
                  </div>
                  {progressPercentage === 100 && (
                    <span className="text-xl md:text-2xl animate-bounce">🎉</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <SaveRoadmapButton
                    isSaving={isSaving}
                    onClick={handleSaveRoadmap}
                  />
                  <DownloadPDFButton />
                  <ShareButton />
                  <Button className="gap-1 md:gap-2 bg-white text-black hover:bg-[#f5f5f5] text-xs md:text-sm w-full sm:w-auto" style={{ fontWeight: 600 }} onClick={onNavigateToSkillGap}>
                    <Target className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Start Skill Test</span>
                    <span className="sm:hidden">Skill Test</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
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