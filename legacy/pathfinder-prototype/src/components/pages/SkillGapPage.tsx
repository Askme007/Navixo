import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, LogOut, Target, ChevronLeft, ChevronRight, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Progress } from '../ui/progress';

interface SkillGapPageProps {
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  fromRoadmap?: boolean;
}

type PageState = 'empty' | 'test' | 'results';
type QuestionType = 'mcq' | 'likert' | 'short';

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
}

interface Answer {
  questionId: number;
  value: string | number;
}

interface SkillResult {
  name: string;
  score: number;
  gapLevel: 'High' | 'Medium' | 'Low';
  recommendation: string;
  color: string;
}

export function SkillGapPage({ userName, onBack, onLogout, fromRoadmap }: SkillGapPageProps) {
  const [pageState, setPageState] = useState<PageState>('empty');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock questions
  const questions: Question[] = [
    {
      id: 1,
      text: 'How would you rate your ability to communicate complex ideas clearly?',
      type: 'likert',
      scale: { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' }
    },
    {
      id: 2,
      text: 'Which best describes your current analytical thinking skills?',
      type: 'mcq',
      options: [
        'I struggle with data analysis and logical reasoning',
        'I can analyze simple problems effectively',
        'I confidently solve complex analytical challenges',
        'I excel at advanced analytical thinking and problem-solving'
      ]
    },
    {
      id: 3,
      text: 'How comfortable are you with learning new concepts quickly?',
      type: 'likert',
      scale: { min: 1, max: 5, minLabel: 'Very Uncomfortable', maxLabel: 'Very Comfortable' }
    },
    {
      id: 4,
      text: 'Describe a recent challenge you overcame using creative problem-solving.',
      type: 'short'
    },
    {
      id: 5,
      text: 'How would you rate your technical/domain-specific knowledge?',
      type: 'likert',
      scale: { min: 1, max: 5, minLabel: 'Beginner', maxLabel: 'Expert' }
    },
    {
      id: 6,
      text: 'Which statement best reflects your teamwork approach?',
      type: 'mcq',
      options: [
        'I prefer working independently',
        'I collaborate when necessary but prefer solo work',
        'I actively seek collaboration opportunities',
        'I thrive in team environments and lead collaborative efforts'
      ]
    },
    {
      id: 7,
      text: 'How confident are you in applying theoretical knowledge to practical situations?',
      type: 'likert',
      scale: { min: 1, max: 5, minLabel: 'Not Confident', maxLabel: 'Very Confident' }
    },
    {
      id: 8,
      text: 'What is your biggest professional weakness?',
      type: 'short'
    },
    {
      id: 9,
      text: 'How do you approach continuous learning and skill development?',
      type: 'mcq',
      options: [
        'I rarely seek out new learning opportunities',
        'I learn when required for my current role',
        'I regularly pursue skill development',
        'I actively seek advanced learning and stay ahead of trends'
      ]
    },
    {
      id: 10,
      text: 'Rate your ability to adapt to changing circumstances and environments.',
      type: 'likert',
      scale: { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' }
    }
  ];

  // Mock results data
  const mockResults: SkillResult[] = [
    {
      name: 'Communication Skills',
      score: 78,
      gapLevel: 'Low',
      recommendation: 'Continue practicing written and verbal communication. Consider public speaking courses.',
      color: 'blue'
    },
    {
      name: 'Analytical Thinking',
      score: 65,
      gapLevel: 'Medium',
      recommendation: 'Strengthen data analysis skills. Practice problem-solving frameworks and logical reasoning.',
      color: 'purple'
    },
    {
      name: 'Learning Agility',
      score: 85,
      gapLevel: 'Low',
      recommendation: 'Excellent adaptability! Maintain this strength by exploring diverse learning opportunities.',
      color: 'cyan'
    },
    {
      name: 'Creative Problem-Solving',
      score: 52,
      gapLevel: 'High',
      recommendation: 'Focus on design thinking workshops and creative brainstorming techniques.',
      color: 'amber'
    },
    {
      name: 'Domain Knowledge',
      score: 70,
      gapLevel: 'Medium',
      recommendation: 'Expand your technical expertise through specialized courses and certifications.',
      color: 'green'
    },
    {
      name: 'Collaboration & Teamwork',
      score: 88,
      gapLevel: 'Low',
      recommendation: 'Outstanding teamwork! Consider mentoring others to further develop leadership skills.',
      color: 'emerald'
    }
  ];

  // Scroll reset on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [pageState]);

  const handleStartTest = () => {
    setPageState('test');
    setCurrentQuestion(0);
    setAnswers([]);
    setCurrentAnswer(null);
  };

  const handleAnswerSelect = (value: string | number) => {
    setCurrentAnswer(value);
  };

  const handleNext = () => {
    if (currentAnswer !== null) {
      // Save answer
      setAnswers(prev => [
        ...prev.filter(a => a.questionId !== questions[currentQuestion].id),
        { questionId: questions[currentQuestion].id, value: currentAnswer }
      ]);

      // Move to next question or show results
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setCurrentAnswer(null);
      } else {
        // Test complete
        setPageState('results');
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      // Restore previous answer
      const prevAnswer = answers.find(a => a.questionId === questions[currentQuestion - 1].id);
      setCurrentAnswer(prevAnswer?.value ?? null);
    }
  };

  const handleRetake = () => {
    setPageState('empty');
    setCurrentQuestion(0);
    setAnswers([]);
    setCurrentAnswer(null);
  };

  const getGapLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 60) return 'bg-blue-400';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <div ref={scrollContainerRef} className="min-h-screen bg-[#0E0E0F] text-white">
      {/* Header */}
      <div className="bg-[#1B1B1C] border-b border-[#2E2E2E] sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="gap-2 text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-white" style={{ fontWeight: 600 }}>
                  Skill Gap Analysis
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white hidden sm:inline text-sm">{userName}</span>
              <Button 
                variant="outline" 
                onClick={onLogout} 
                className="gap-2 border-[#2E2E2E] bg-transparent text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {/* STATE A: EMPTY STATE */}
        {pageState === 'empty' && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 md:px-6 py-12 md:py-20"
          >
            <div className="max-w-2xl mx-auto text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8 flex justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                  <Target className="w-12 h-12 text-blue-400" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl text-white mb-4"
                style={{ fontWeight: 700 }}
              >
                Skill Gap Analysis
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-[#BFBFBF] text-lg mb-10 leading-relaxed"
              >
                Identify strengths and weaknesses to receive a personalized learning roadmap.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  onClick={handleStartTest}
                  size="lg"
                  className="bg-[#2A2A2A] hover:bg-[#323232] text-white border border-[#3A3A3A] px-10 py-6 h-auto text-base shadow-lg"
                  style={{ fontWeight: 600 }}
                >
                  Start Skill Assessment
                </Button>
              </motion.div>

              {/* Subtext */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-[#808080] text-sm mt-6"
              >
                Takes 5–7 minutes • Adaptive AI-powered test
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* STATE B: QUESTION MODE */}
        {pageState === 'test' && (
          <motion.div
            key="test-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 md:px-6 py-8 md:py-12"
          >
            <div className="max-w-3xl mx-auto">
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-[#BFBFBF]">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                  <p className="text-sm text-blue-400" style={{ fontWeight: 600 }}>
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                  </p>
                </div>
                <Progress 
                  value={((currentQuestion + 1) / questions.length) * 100} 
                  className="h-2 bg-[#1C1C1C]"
                />
              </div>

              {/* Question Card */}
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1B1B1C] border border-[#2E2E2E] rounded-2xl p-6 md:p-8 mb-8"
              >
                {/* Question Text */}
                <h2 className="text-xl md:text-2xl text-white mb-8" style={{ fontWeight: 600 }}>
                  {questions[currentQuestion].text}
                </h2>

                {/* Answer Components */}
                <div className="space-y-3">
                  {/* MCQ Component */}
                  {questions[currentQuestion].type === 'mcq' && (
                    <div className="space-y-3">
                      {questions[currentQuestion].options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            currentAnswer === option
                              ? 'bg-blue-400/10 border-blue-400/50 text-white'
                              : 'bg-[#232323] border-[#3A3A3A] text-[#BFBFBF] hover:bg-[#2A2A2A] hover:border-[#4A4A4A]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              currentAnswer === option
                                ? 'border-blue-400 bg-blue-400'
                                : 'border-[#4A4A4A]'
                            }`}>
                              {currentAnswer === option && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="text-sm">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Likert Scale Component */}
                  {questions[currentQuestion].type === 'likert' && questions[currentQuestion].scale && (
                    <div className="space-y-4">
                      <div className="flex justify-center gap-3 md:gap-4">
                        {Array.from(
                          { length: questions[currentQuestion].scale!.max - questions[currentQuestion].scale!.min + 1 },
                          (_, i) => questions[currentQuestion].scale!.min + i
                        ).map((value) => (
                          <button
                            key={value}
                            onClick={() => handleAnswerSelect(value)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                              currentAnswer === value
                                ? 'bg-blue-400 border-blue-400 text-white scale-110'
                                : 'bg-[#232323] border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:border-[#4A4A4A]'
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-[#808080] px-1">
                        <span>{questions[currentQuestion].scale!.minLabel}</span>
                        <span>{questions[currentQuestion].scale!.maxLabel}</span>
                      </div>
                    </div>
                  )}

                  {/* Short Answer Component */}
                  {questions[currentQuestion].type === 'short' && (
                    <textarea
                      value={currentAnswer as string || ''}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full bg-[#232323] border border-[#3A3A3A] rounded-xl p-4 text-white placeholder:text-[#666666] focus:outline-none focus:border-blue-400/50 min-h-[120px] resize-none"
                    />
                  )}
                </div>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleBack}
                  disabled={currentQuestion === 0}
                  variant="ghost"
                  className="gap-2 text-white hover:bg-white/5 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={currentAnswer === null || currentAnswer === ''}
                  className="gap-2 bg-[#2A2A2A] hover:bg-[#323232] text-white border border-[#3A3A3A] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontWeight: 600 }}
                >
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE C: RESULTS SUMMARY */}
        {pageState === 'results' && (
          <motion.div
            key="results-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 md:px-6 py-8 md:py-12"
          >
            <div className="max-w-5xl mx-auto">
              {/* Summary Header */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-3xl md:text-4xl text-white mb-4" style={{ fontWeight: 700 }}>
                  Your Skill Analysis
                </h1>
                <p className="text-[#BFBFBF] text-lg">
                  Here's how you're performing across key categories.
                </p>
              </motion.div>

              {/* Graph Placeholder */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#1B1B1C] border border-[#2E2E2E] rounded-2xl p-8 mb-8"
              >
                <h3 className="text-white text-lg mb-6" style={{ fontWeight: 600 }}>
                  Overall Performance
                </h3>
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                  {mockResults.map((result, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full bg-[#1C1C1C] rounded-lg overflow-hidden h-48 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${result.score}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                          className={`w-full ${getScoreColor(result.score)} rounded-t-lg`}
                        />
                      </div>
                      <p className="text-xs text-[#BFBFBF] text-center">{result.name.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Skill Gap Cards */}
              <div className="space-y-4 mb-8">
                {mockResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="bg-[#1B1B1C] border border-[#2E2E2E] rounded-xl p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h4 className="text-white text-lg mb-2" style={{ fontWeight: 600 }}>
                          {result.name}
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-white" style={{ fontWeight: 600 }}>
                              {result.score}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#BFBFBF]">Gap Level:</span>
                            <span className={`text-sm ${getGapLevelColor(result.gapLevel)}`} style={{ fontWeight: 600 }}>
                              {result.gapLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-48">
                        <div className="h-2 bg-[#1C1C1C] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.score}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                            className={`h-full ${getScoreColor(result.score)} rounded-full`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#232323] border border-[#2E2E2E] rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[#BFBFBF] leading-relaxed">
                          {result.recommendation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-6 h-auto"
                  style={{ fontWeight: 600 }}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Generate Roadmap Based on Gaps
                </Button>
                <Button
                  onClick={handleRetake}
                  size="lg"
                  variant="outline"
                  className="border-[#2E2E2E] bg-[#1B1B1C] hover:bg-[#232323] text-white px-8 py-6 h-auto"
                  style={{ fontWeight: 600 }}
                >
                  Retake Assessment
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
