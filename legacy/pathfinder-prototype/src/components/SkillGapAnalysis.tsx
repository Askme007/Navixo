import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { AlertCircle, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

interface SkillAnalysis {
  currentSkills: SkillItem[];
  requiredSkills: SkillItem[];
  skillGaps: SkillGap[];
  matchPercentage: number;
}

interface SkillItem {
  name: string;
  level: number;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

export function SkillGapAnalysis() {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!targetRole || !currentSkills) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const result = generateMockAnalysis(targetRole, currentSkills);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateMockAnalysis = (role: string, skills: string): SkillAnalysis => {
    // Parse current skills
    const currentSkillsList = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((skill) => ({
        name: skill,
        level: Math.floor(Math.random() * 40) + 60, // 60-100 for current skills
      }));

    // Mock required skills based on role
    const requiredSkillsList: SkillItem[] = [
      { name: 'Technical Expertise', level: 90 },
      { name: 'Problem Solving', level: 85 },
      { name: 'Communication', level: 80 },
      { name: 'Leadership', level: 75 },
      { name: 'Project Management', level: 70 },
      { name: 'Domain Knowledge', level: 85 },
    ];

    // Calculate skill gaps
    const gaps: SkillGap[] = [];
    
    // Add gaps for required skills not in current skills
    requiredSkillsList.forEach((required) => {
      const current = currentSkillsList.find(
        (c) => c.name.toLowerCase() === required.name.toLowerCase()
      );
      
      if (!current || current.level < required.level) {
        const gap = required.level - (current?.level || 0);
        gaps.push({
          skill: required.name,
          currentLevel: current?.level || 0,
          requiredLevel: required.level,
          priority: gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low',
          recommendation: getRecommendation(required.name, gap),
        });
      }
    });

    // Calculate match percentage
    const totalRequired = requiredSkillsList.reduce((sum, s) => sum + s.level, 0);
    const currentTotal = requiredSkillsList.reduce((sum, required) => {
      const current = currentSkillsList.find(
        (c) => c.name.toLowerCase() === required.name.toLowerCase()
      );
      return sum + Math.min(current?.level || 0, required.level);
    }, 0);
    
    const matchPercentage = Math.round((currentTotal / totalRequired) * 100);

    return {
      currentSkills: currentSkillsList,
      requiredSkills: requiredSkillsList,
      skillGaps: gaps,
      matchPercentage,
    };
  };

  const getRecommendation = (skill: string, gap: number): string => {
    const recommendations: { [key: string]: string } = {
      'Technical Expertise': 'Complete advanced courses and certifications in your domain',
      'Problem Solving': 'Practice with coding challenges and case studies regularly',
      'Communication': 'Join public speaking groups or take presentation skills workshops',
      'Leadership': 'Seek mentorship opportunities and lead small team projects',
      'Project Management': 'Get PMP/Agile certification and manage cross-functional projects',
      'Domain Knowledge': 'Read industry publications and attend relevant conferences',
    };

    return recommendations[skill] || 'Focus on practical projects and continuous learning';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Skill Gap Analysis</CardTitle>
        <CardDescription>
          Identify skill gaps and get personalized recommendations for your target role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-role-analysis">Target Role</Label>
              <Input
                id="target-role-analysis"
                placeholder="e.g., Senior Software Engineer, Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-skills">Your Current Skills</Label>
              <Textarea
                id="current-skills"
                placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Python, Team Leadership, Agile)"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Tip: Be specific about your skills for more accurate analysis
              </p>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!targetRole || !currentSkills || isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing Skills...' : 'Analyze Skill Gaps'}
          </Button>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6 mt-8">
              {/* Match Percentage */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3>Overall Match</h3>
                    <span className="text-2xl">{analysis.matchPercentage}%</span>
                  </div>
                  <Progress value={analysis.matchPercentage} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">
                    {analysis.matchPercentage >= 80
                      ? 'Excellent! You have most of the required skills.'
                      : analysis.matchPercentage >= 60
                      ? 'Good foundation! Focus on closing key skill gaps.'
                      : 'There are several areas to develop for this role.'}
                  </p>
                </CardContent>
              </Card>

              {/* Required Skills */}
              <div>
                <h3 className="mb-4">Required Skills for {targetRole}</h3>
                <div className="space-y-3">
                  {analysis.requiredSkills.map((skill, index) => {
                    const currentSkill = analysis.currentSkills.find(
                      (s) => s.name.toLowerCase() === skill.name.toLowerCase()
                    );
                    const currentLevel = currentSkill?.level || 0;
                    const hasSkill = currentLevel >= skill.level;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {hasSkill ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                            )}
                            <span>{skill.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {currentLevel} / {skill.level}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={skill.level} className="h-2 bg-gray-200" />
                          <Progress
                            value={currentLevel}
                            className="h-2 absolute top-0 left-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skill Gaps & Recommendations */}
              {analysis.skillGaps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3>Priority Areas to Develop</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.skillGaps
                      .sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .map((gap, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4>{gap.skill}</h4>
                              <Badge className={getPriorityColor(gap.priority)}>
                                {gap.priority} priority
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Current: {gap.currentLevel}%</span>
                                <span>→</span>
                                <span>Target: {gap.requiredLevel}%</span>
                                <span className="ml-auto">
                                  Gap: {gap.requiredLevel - gap.currentLevel}%
                                </span>
                              </div>
                              <Progress
                                value={(gap.currentLevel / gap.requiredLevel) * 100}
                                className="h-2"
                              />
                              <p className="text-sm text-gray-700 mt-3">
                                <span className="font-medium">Recommendation:</span>{' '}
                                {gap.recommendation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {analysis.skillGaps.length === 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <p>
                        Great! You meet or exceed all the required skill levels for this role.
                        Keep maintaining and updating your skills to stay competitive.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
