import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface RoadmapStep {
  id: string;
  title: string;
  duration: string;
  tasks: string[];
  skills: string[];
  completed?: boolean;
}

export function RoadmapGenerator() {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!currentRole || !targetRole || !experience) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const generatedRoadmap = generateMockRoadmap(currentRole, targetRole, experience);
      setRoadmap(generatedRoadmap);
      setIsGenerating(false);
    }, 1500);
  };

  const generateMockRoadmap = (current: string, target: string, exp: string): RoadmapStep[] => {
    // Generate a mock roadmap based on inputs
    const steps: RoadmapStep[] = [
      {
        id: '1',
        title: 'Foundation & Assessment',
        duration: '1-2 months',
        tasks: [
          'Conduct self-assessment of current skills',
          'Research the target role requirements',
          'Identify skill gaps and learning needs',
          'Set clear, measurable career goals',
        ],
        skills: ['Self-awareness', 'Research', 'Goal-setting'],
      },
      {
        id: '2',
        title: 'Skill Development',
        duration: '3-6 months',
        tasks: [
          'Enroll in relevant online courses or certifications',
          'Build practical projects to demonstrate skills',
          'Join professional communities and forums',
          'Attend industry webinars and workshops',
        ],
        skills: ['Technical skills', 'Continuous learning', 'Networking'],
      },
      {
        id: '3',
        title: 'Portfolio Building',
        duration: '2-3 months',
        tasks: [
          'Create a portfolio showcasing your work',
          'Contribute to open-source projects',
          'Write blog posts or articles about your journey',
          'Document case studies and achievements',
        ],
        skills: ['Communication', 'Portfolio management', 'Personal branding'],
      },
      {
        id: '4',
        title: 'Networking & Visibility',
        duration: '2-4 months',
        tasks: [
          'Connect with professionals in the target role',
          'Attend industry events and conferences',
          'Seek informational interviews',
          'Build your LinkedIn presence',
        ],
        skills: ['Networking', 'Professional communication', 'Relationship building'],
      },
      {
        id: '5',
        title: 'Job Search & Applications',
        duration: '1-3 months',
        tasks: [
          'Update resume and LinkedIn profile',
          'Tailor applications to target roles',
          'Apply to relevant positions strategically',
          'Prepare for technical and behavioral interviews',
        ],
        skills: ['Job search strategy', 'Interview preparation', 'Resume writing'],
      },
      {
        id: '6',
        title: 'Interview & Transition',
        duration: 'Ongoing',
        tasks: [
          'Practice mock interviews',
          'Negotiate offers effectively',
          'Plan smooth transition from current role',
          'Onboard successfully in new position',
        ],
        skills: ['Interviewing', 'Negotiation', 'Adaptability'],
      },
    ];

    return steps;
  };

  const toggleStepCompletion = (stepId: string) => {
    if (!roadmap) return;
    setRoadmap(
      roadmap.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Career Roadmap Generator</CardTitle>
        <CardDescription>
          Generate a personalized step-by-step roadmap to achieve your career goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-role">Current Role</Label>
              <Input
                id="current-role"
                placeholder="e.g., Junior Developer"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-role">Target Role</Label>
              <Input
                id="target-role"
                placeholder="e.g., Senior Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!currentRole || !targetRole || !experience || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating Roadmap...' : 'Generate Career Roadmap'}
          </Button>

          {/* Roadmap Display */}
          {roadmap && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between">
                <h3>Your Personalized Career Roadmap</h3>
                <Badge variant="secondary">
                  {roadmap.filter((s) => s.completed).length} / {roadmap.length} Completed
                </Badge>
              </div>

              <div className="space-y-4">
                {roadmap.map((step, index) => (
                  <Card
                    key={step.id}
                    className={`transition-all ${
                      step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStepCompletion(step.id)}
                            className="mt-1 transition-colors hover:scale-110"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-300" />
                            )}
                          </button>
                          <div>
                            <CardTitle className="text-lg">
                              Step {index + 1}: {step.title}
                            </CardTitle>
                            <CardDescription>{step.duration}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Key Tasks:</p>
                        <ul className="space-y-1">
                          {step.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skills to Develop:</p>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, i) => (
                            <Badge key={i} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
