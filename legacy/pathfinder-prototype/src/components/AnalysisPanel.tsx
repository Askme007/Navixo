import { useState } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Zap,
  Loader2
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { PaiLogo } from './PaiLogo';

interface AnalysisPanelProps {
  onRefresh?: () => void;
  onStartAssessment?: () => void;
  onViewHistory?: () => void;
}

export function AnalysisPanel({ 
  onRefresh, 
  onStartAssessment, 
  onViewHistory
}: AnalysisPanelProps) {
  // State management: 'empty' | 'loading' | 'results'
  const [analysisState, setAnalysisState] = useState<'empty' | 'loading' | 'results'>('empty');

  // Mock Assessment Summary Data (only shown in results state)
  const assessmentSummary = {
    level: 'Intermediate',
    overallScore: 72,
    strengths: ['Problem Solving', 'Technical Aptitude', 'Communication'],
    weaknesses: ['Time Management', 'Advanced Mathematics']
  };

  // Mock Skill Data for Radar Chart
  const skillData = [
    { skill: 'Problem Solving', value: 85 },
    { skill: 'Programming', value: 72 },
    { skill: 'Data Analysis', value: 68 },
    { skill: 'Communication', value: 78 },
    { skill: 'Leadership', value: 60 },
    { skill: 'Creativity', value: 75 }
  ];

  // Mock Topic Proficiency Data for Bar Chart
  const topicData = [
    { topic: 'Python', proficiency: 82 },
    { topic: 'SQL', proficiency: 75 },
    { topic: 'Statistics', proficiency: 65 },
    { topic: 'ML Basics', proficiency: 58 },
    { topic: 'Algorithms', proficiency: 70 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  // Handle Start Analysis button click
  const handleStartAnalysis = () => {
    setAnalysisState('loading');
    
    // Simulate analysis processing (1.5 seconds)
    setTimeout(() => {
      setAnalysisState('results');
      onStartAssessment?.();
    }, 1500);
  };

  // EMPTY STATE - Default View (Before Analysis)
  if (analysisState === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-6 py-12">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <PaiLogo className="w-10 h-10 text-white" size={40} />
        </div>

        {/* Title */}
        <h3 className="text-white text-xl mb-2">No Analysis Started</h3>
        
        {/* Description */}
        <p className="text-[#BFBFBF] text-center mb-8 max-w-md">
          Complete an assessment to generate your personalized analysis.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={handleStartAnalysis}
          className="bg-white hover:bg-[#F2F2F2] text-black px-6 py-2.5 rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Start Analysis
        </Button>
      </div>
    );
  }

  // LOADING STATE - Processing Analysis
  if (analysisState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-6 py-12">
        {/* Loading Icon */}
        <div className="w-20 h-20 rounded-full bg-[#262626] border border-white/10 flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>

        {/* Title */}
        <h3 className="text-white text-xl mb-2">Preparing your analysis...</h3>
        
        {/* Description */}
        <p className="text-[#BFBFBF] text-center max-w-md">
          Analyzing your profile and generating personalized insights.
        </p>

        {/* Progress Animation */}
        <div className="mt-8 w-full max-w-xs">
          <Progress value={100} className="h-2" />
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS STATE - Post-Analysis (After Analysis Completes)
  return (
    <div className="space-y-6">
      {/* A. Summary Section - Assessment Summary Card */}
      <Card className="bg-[#232323] border-[#3A3A3A] p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#2B2B2B] border border-white/10 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white mb-1">Assessment Summary</h3>
            <p className="text-xs text-[#BFBFBF]">Current Performance Overview</p>
          </div>
        </div>

        {/* Student Level Badge */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-[#BFBFBF]">Current Level:</span>
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/20">
            {assessmentSummary.level}
          </Badge>
        </div>

        {/* Overall Score */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#BFBFBF]">Overall Score</span>
            <span className={`text-sm ${getScoreColor(assessmentSummary.overallScore)}`} style={{ fontWeight: 600 }}>
              {assessmentSummary.overallScore}%
            </span>
          </div>
          <Progress value={assessmentSummary.overallScore} className="h-2" />
        </div>

        {/* Strengths */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-[#BFBFBF]">Strengths</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {assessmentSummary.strengths.map((strength, idx) => (
              <Badge 
                key={idx} 
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 text-xs"
              >
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-[#BFBFBF]">Areas to Improve</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {assessmentSummary.weaknesses.map((weakness, idx) => (
              <Badge 
                key={idx} 
                className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10 text-xs"
              >
                {weakness}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* B. Detailed Insights Section - Performance Graphs */}
      <Card className="bg-[#232323] border-[#3A3A3A] p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#2B2B2B] border border-white/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white mb-1">Performance Metrics</h3>
            <p className="text-xs text-[#BFBFBF]">Skill Distribution & Proficiency</p>
          </div>
        </div>

        {/* Radar Chart - Skill Distribution */}
        <div className="mb-6">
          <p className="text-xs text-[#BFBFBF] mb-3">Skill Distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="#3A3A3A" />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: '#BFBFBF', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#BFBFBF', fontSize: 10 }}
              />
              <Radar 
                name="Skills" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Topic Proficiency */}
        <div>
          <p className="text-xs text-[#BFBFBF] mb-3">Topic Proficiency</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topicData}>
              <XAxis 
                dataKey="topic" 
                tick={{ fill: '#BFBFBF', fontSize: 11 }}
                axisLine={{ stroke: '#3A3A3A' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#BFBFBF', fontSize: 10 }}
                axisLine={{ stroke: '#3A3A3A' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
              />
              <Bar dataKey="proficiency" radius={[4, 4, 0, 0]}>
                {topicData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.proficiency >= 75 ? '#10B981' :
                      entry.proficiency >= 60 ? '#3B82F6' :
                      entry.proficiency >= 40 ? '#F59E0B' : '#EF4444'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Indicator */}
        <div className="mt-5 pt-5 border-t border-[#3A3A3A]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[#BFBFBF]">Overall Accuracy</span>
            <span className="text-sm text-emerald-400" style={{ fontWeight: 600 }}>87%</span>
          </div>
          <Progress value={87} className="h-2" />
        </div>
      </Card>

      {/* C. Detailed Insights Section - Recommendations */}
      <Card className="bg-[#232323] border-[#3A3A3A] p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#2B2B2B] border border-white/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white mb-1">PAI Recommendations</h3>
            <p className="text-xs text-[#BFBFBF]">Personalized Learning Path</p>
          </div>
        </div>

        {/* Analysis Paragraph */}
        <div className="bg-[#1A1A1A] rounded-lg p-4 mb-5 border border-[#3A3A3A]">
          <p className="text-sm text-[#BFBFBF]" style={{ lineHeight: '1.6' }}>
            Based on your assessment performance, you demonstrate strong problem-solving abilities and technical aptitude. 
            However, focusing on time management and advanced mathematics concepts will significantly enhance your overall capabilities.
          </p>
        </div>

        {/* Priority Skills */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-[#BFBFBF]">Priority Focus Areas</span>
          </div>
          <div className="space-y-2">
            {[
              { skill: 'Advanced Algorithms', priority: 'High' },
              { skill: 'System Design', priority: 'High' },
              { skill: 'Statistical Analysis', priority: 'Medium' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#1A1A1A] border border-[#3A3A3A]">
                <span className="text-sm text-white">{item.skill}</span>
                <Badge 
                  className={`text-xs ${
                    item.priority === 'High' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  } hover:bg-opacity-10`}
                >
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Modules */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-[#BFBFBF]">Suggested Learning Modules</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Data Structures Deep Dive', 'Time Complexity Mastery', 'Math for CS', 'Problem Solving Patterns'].map((module, idx) => (
              <Badge 
                key={idx} 
                className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/20 text-xs"
              >
                {module}
              </Badge>
            ))}
          </div>
        </div>

        {/* Weak Concepts */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-[#BFBFBF]">Concepts to Review</span>
          </div>
          <div className="space-y-1.5">
            {['Recursion & Backtracking', 'Graph Algorithms', 'Dynamic Programming'].map((concept, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-xs text-[#BFBFBF] bg-[#1A1A1A] rounded px-3 py-2 border border-[#3A3A3A]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {concept}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* D. Learning Opportunities Card */}
      <Card className="bg-[#232323] border-[#3A3A3A] p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#2B2B2B] border border-white/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white mb-1">Next Steps</h3>
            <p className="text-xs text-[#BFBFBF]">Recommended Actions</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { action: 'Complete Python Advanced Course', icon: BookOpen, color: 'text-blue-400' },
            { action: 'Practice 5 Algorithm Problems', icon: Target, color: 'text-green-400' },
            { action: 'Review Statistical Methods', icon: TrendingUp, color: 'text-purple-400' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#3A3A3A] hover:border-white/20 transition-colors cursor-pointer">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-white flex-1">{item.action}</span>
                <CheckCircle2 className="w-4 h-4 text-[#BFBFBF]" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
