import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Slider } from '../ui/slider';
import { 
  ArrowLeft, 
  ArrowRight, 
  GraduationCap, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Star, 
  Award, 
  Brain, 
  Users, 
  MessageCircle, 
  Lightbulb, 
  BarChart, 
  Shield, 
  Pencil,
  BookOpen,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { PaiLogo } from '../PaiLogo';

interface OnboardingPageProps {
  onComplete: (answers: Record<string, any>) => void;
  onBack: () => void;
}

type SectionType = {
  id: string;
  title: string;
  description: string;
  icon: any;
  fields: FieldType[];
};

type FieldType = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'multiselect' | 'slider' | 'binary';
  placeholder?: string;
  options?: { value: string; label: string; icon?: any; color?: string }[];
  min?: number;
  max?: number;
  required?: boolean;
};

export function OnboardingPage({ onComplete, onBack }: OnboardingPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    selectedSkills: [],
    improvementSkills: [],
    focusAreas: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset scroll position to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Reset scroll position to top whenever the section changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentSection]);

  const sections: SectionType[] = [
    {
      id: 'personal',
      title: 'Personal Background',
      description: 'Help us understand your current position',
      icon: GraduationCap,
      fields: [
        {
          id: 'educationLevel',
          label: 'Current education level',
          type: 'select',
          placeholder: 'Select your education level',
          required: true,
          options: [
            { value: 'highschool', label: 'High School' },
            { value: 'diploma', label: 'Diploma / Associate Degree' },
            { value: 'bachelors', label: "Bachelor's Degree" },
            { value: 'masters', label: "Master's Degree" },
            { value: 'doctorate', label: 'Doctorate / PhD' },
            { value: 'professional', label: 'Professional Certification' }
          ]
        },
        {
          id: 'currentStatus',
          label: 'Current situation',
          type: 'radio',
          required: true,
          options: [
            { value: 'studying', label: 'Currently studying', icon: BookOpen },
            { value: 'working', label: 'Currently working', icon: Briefcase },
            { value: 'exploring', label: 'Exploring opportunities', icon: Target },
            { value: 'transitioning', label: 'Career transitioning', icon: TrendingUp }
          ]
        },
        {
          id: 'domain',
          label: 'Current domain or area of interest',
          type: 'text',
          placeholder: 'e.g., Software Development, Marketing, Finance, Healthcare',
          required: true
        },
        {
          id: 'careerStage',
          label: 'Career stage',
          type: 'radio',
          required: true,
          options: [
            { value: 'beginner', label: 'Beginner', icon: Star },
            { value: 'intermediate', label: 'Intermediate', icon: Award },
            { value: 'transitioning', label: 'Transitioning', icon: TrendingUp },
            { value: 'advanced', label: 'Advanced', icon: Target }
          ]
        }
      ]
    },
    {
      id: 'aspirations',
      title: 'Career Aspirations',
      description: 'Define your professional goals',
      icon: Target,
      fields: [
        {
          id: 'careerPath',
          label: 'Career path you\'re exploring',
          type: 'select',
          placeholder: 'Select a career path',
          required: true,
          options: [
            { value: 'technology', label: 'Technology & IT' },
            { value: 'healthcare', label: 'Healthcare & Medicine' },
            { value: 'business', label: 'Business & Management' },
            { value: 'finance', label: 'Finance & Accounting' },
            { value: 'design', label: 'Design & Creative' },
            { value: 'arts', label: 'Arts & Entertainment' },
            { value: 'education', label: 'Education & Teaching' },
            { value: 'law', label: 'Law & Legal' },
            { value: 'engineering', label: 'Engineering' },
            { value: 'trades', label: 'Skilled Trades' },
            { value: 'science', label: 'Science & Research' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'shortTermGoal',
          label: 'Short-term goal (6-12 months)',
          type: 'textarea',
          placeholder: 'What do you want to achieve in the near future?',
          required: true
        },
        {
          id: 'longTermGoal',
          label: 'Long-term goal (3-5 years)',
          type: 'textarea',
          placeholder: 'Where do you see yourself in the long run?',
          required: true
        }
      ]
    },
    {
      id: 'experience',
      title: 'Experience & Exposure',
      description: 'Share your background and experience',
      icon: Award,
      fields: [
        {
          id: 'skillLevel',
          label: 'Rate your current level in your chosen field',
          type: 'slider',
          min: 1,
          max: 10,
          required: true
        },
        {
          id: 'pastExperience',
          label: 'Do you have past experience in this field?',
          type: 'radio',
          required: true,
          options: [
            { value: 'none', label: 'No experience' },
            { value: 'some', label: 'Some experience (< 1 year)' },
            { value: 'moderate', label: 'Moderate experience (1-3 years)' },
            { value: 'significant', label: 'Significant experience (3+ years)' }
          ]
        },
        {
          id: 'completedWork',
          label: 'Have you completed any courses, projects, or internships?',
          type: 'textarea',
          placeholder: 'List relevant experience, courses, certifications, or projects',
          required: false
        }
      ]
    },
    {
      id: 'skills',
      title: 'Strengths & Skills',
      description: 'Identify your core competencies',
      icon: Brain,
      fields: [
        {
          id: 'selectedSkills',
          label: 'What are your strongest skills? (Select all that apply)',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'communication', label: 'Communication', icon: MessageCircle, color: 'text-blue-400' },
            { value: 'creative', label: 'Creative Thinking', icon: Lightbulb, color: 'text-yellow-400' },
            { value: 'analytical', label: 'Analytical Reasoning', icon: BarChart, color: 'text-purple-400' },
            { value: 'logical', label: 'Logical Thinking', icon: Brain, color: 'text-green-400' },
            { value: 'leadership', label: 'Leadership', icon: Users, color: 'text-orange-400' },
            { value: 'research', label: 'Research', icon: BookOpen, color: 'text-cyan-400' },
            { value: 'technical', label: 'Technical Tools', icon: Shield, color: 'text-red-400' },
            { value: 'domain', label: 'Domain Knowledge', icon: Award, color: 'text-indigo-400' }
          ]
        },
        {
          id: 'improvementSkills',
          label: 'What skills do you want to improve? (Select all that apply)',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'communication', label: 'Communication', icon: MessageCircle, color: 'text-blue-400' },
            { value: 'creative', label: 'Creative Thinking', icon: Lightbulb, color: 'text-yellow-400' },
            { value: 'analytical', label: 'Analytical Reasoning', icon: BarChart, color: 'text-purple-400' },
            { value: 'logical', label: 'Logical Thinking', icon: Brain, color: 'text-green-400' },
            { value: 'leadership', label: 'Leadership', icon: Users, color: 'text-orange-400' },
            { value: 'research', label: 'Research', icon: BookOpen, color: 'text-cyan-400' },
            { value: 'technical', label: 'Technical Tools', icon: Shield, color: 'text-red-400' },
            { value: 'domain', label: 'Domain Knowledge', icon: Award, color: 'text-indigo-400' }
          ]
        }
      ]
    },
    {
      id: 'learning',
      title: 'Learning Preferences',
      description: 'Customize your learning experience',
      icon: BookOpen,
      fields: [
        {
          id: 'learningStyle',
          label: 'Preferred learning style',
          type: 'radio',
          required: true,
          options: [
            { value: 'visual', label: 'Visual (videos, diagrams, infographics)' },
            { value: 'text', label: 'Text-based (articles, documentation)' },
            { value: 'interactive', label: 'Interactive (hands-on exercises, labs)' },
            { value: 'mentorship', label: 'Mentorship (guidance, feedback)' }
          ]
        },
        {
          id: 'learningPace',
          label: 'Preferred learning pace',
          type: 'radio',
          required: true,
          options: [
            { value: 'fast', label: 'Fast-paced (intensive learning)' },
            { value: 'moderate', label: 'Moderate (balanced approach)' },
            { value: 'slow', label: 'Deep learning (thorough understanding)' }
          ]
        },
        {
          id: 'dailyTime',
          label: 'Daily time availability (hours)',
          type: 'select',
          placeholder: 'Select daily time commitment',
          required: true,
          options: [
            { value: '0-1', label: '0-1 hours' },
            { value: '1-2', label: '1-2 hours' },
            { value: '2-3', label: '2-3 hours' },
            { value: '3-5', label: '3-5 hours' },
            { value: '5+', label: '5+ hours' }
          ]
        }
      ]
    },
    {
      id: 'assessment',
      title: 'Initial Assessment',
      description: 'Get personalized insights',
      icon: CheckCircle2,
      fields: [
        {
          id: 'startAssessment',
          label: 'Would you like PAI to run an initial skill assessment?',
          type: 'binary',
          required: true,
          options: [
            { value: 'yes', label: 'Yes, start assessment', icon: CheckCircle2 },
            { value: 'no', label: 'Not now', icon: ArrowRight }
          ]
        }
      ]
    },
    {
      id: 'personalization',
      title: 'Personalization Setup',
      description: 'Tailor PAI to your needs',
      icon: Sparkles,
      fields: [
        {
          id: 'focusAreas',
          label: 'What should PAI focus on for you? (Select all that apply)',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'roadmap', label: 'Career roadmap', icon: Target, color: 'text-blue-400' },
            { value: 'skillgaps', label: 'Skill gap analysis', icon: BarChart, color: 'text-purple-400' },
            { value: 'learning', label: 'Learning plan', icon: BookOpen, color: 'text-green-400' },
            { value: 'interview', label: 'Interview preparation', icon: MessageCircle, color: 'text-orange-400' },
            { value: 'productivity', label: 'Productivity', icon: Zap, color: 'text-yellow-400' },
            { value: 'confidence', label: 'Confidence & communication', icon: Users, color: 'text-cyan-400' },
            { value: 'mastery', label: 'Domain mastery', icon: Award, color: 'text-red-400' }
          ]
        }
      ]
    }
  ];

  const totalSections = sections.length;
  const currentSectionData = sections[currentSection];
  const progressPercentage = ((currentSection + 1) / totalSections) * 100;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleMultiSelect = (fieldId: string, optionValue: string) => {
    setFormData(prev => {
      const current = prev[fieldId] || [];
      const isSelected = current.includes(optionValue);
      return {
        ...prev,
        [fieldId]: isSelected
          ? current.filter((v: string) => v !== optionValue)
          : [...current, optionValue]
      };
    });
  };

  const isSectionComplete = () => {
    return currentSectionData.fields.every(field => {
      if (!field.required) return true;
      const value = formData[field.id];
      if (field.type === 'multiselect') {
        return value && value.length > 0;
      }
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(formData);
    }, 2500);
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          {/* AI Avatar */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-[#232323] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/10">
              <PaiLogo className="w-10 h-10 text-white" size={40} />
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-white mb-4">
            Analyzing your profile...
          </h2>
          <p className="text-[#CCCCCC] mb-8">
            Setting up your personalized career experience
          </p>

          {/* Progress Animation */}
          <div className="space-y-3">
            <Progress value={100} className="h-2" />
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#CCCCCC] text-sm">Section {currentSection + 1} of {totalSections}</span>
            <span className="text-white text-sm">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="border border-white/10 bg-[#232323] shadow-[0_4px_16px_rgba(0,0,0,0.4)] rounded-xl">
          <CardContent className="p-8">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                {currentSectionData.icon && (
                  <div className="w-10 h-10 rounded-lg bg-[#2B2B2B] border border-white/10 flex items-center justify-center">
                    <currentSectionData.icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-white text-xl">{currentSectionData.title}</h2>
                  <p className="text-[#CCCCCC] text-sm">{currentSectionData.description}</p>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-6">
              {currentSectionData.fields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-white text-sm">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>

                  {field.type === 'text' && (
                    <Input
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="bg-[#2B2B2B] border-white/10 text-white placeholder:text-[#666666] focus:border-white/30"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <Textarea
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="bg-[#2B2B2B] border-white/10 text-white placeholder:text-[#666666] focus:border-white/30 min-h-[100px]"
                    />
                  )}

                  {field.type === 'select' && (
                    <Select
                      value={formData[field.id] || ''}
                      onValueChange={(value) => handleInputChange(field.id, value)}
                    >
                      <SelectTrigger className="bg-[#2B2B2B] border-white/10 text-white">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2B2B2B] border-white/10">
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white focus:bg-[#333333]">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === 'radio' && (
                    <RadioGroup
                      value={formData[field.id] || ''}
                      onValueChange={(value) => handleInputChange(field.id, value)}
                      className="space-y-2"
                    >
                      {field.options?.map((option) => {
                        const OptionIcon = option.icon;
                        return (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              formData[field.id] === option.value
                                ? 'bg-[#2B2B2B] border-white/30'
                                : 'bg-[#262626] border-white/10 hover:border-white/20'
                            }`}
                            onClick={() => handleInputChange(field.id, option.value)}
                          >
                            <RadioGroupItem value={option.value} id={option.value} className="border-white/30" />
                            {OptionIcon && <OptionIcon className="w-4 h-4 text-white" />}
                            <Label htmlFor={option.value} className="text-white text-sm cursor-pointer flex-1">
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {field.type === 'slider' && (
                    <div className="space-y-3">
                      <Slider
                        min={field.min || 0}
                        max={field.max || 100}
                        step={1}
                        value={[formData[field.id] || field.min || 0]}
                        onValueChange={(value) => handleInputChange(field.id, value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-[#CCCCCC]">
                        <span>Beginner ({field.min})</span>
                        <span className="text-white">Level: {formData[field.id] || field.min || 0}</span>
                        <span>Expert ({field.max})</span>
                      </div>
                    </div>
                  )}

                  {field.type === 'binary' && (
                    <div className="grid grid-cols-2 gap-3">
                      {field.options?.map((option) => {
                        const OptionIcon = option.icon;
                        const isSelected = formData[field.id] === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleInputChange(field.id, option.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'bg-[#2B2B2B] border-white shadow-[0_2px_8px_rgba(255,255,255,0.1)]'
                                : 'bg-[#262626] border-white/10 hover:border-white/30'
                            }`}
                          >
                            {OptionIcon && <OptionIcon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-[#CCCCCC]'}`} />}
                            <p className={`text-sm ${isSelected ? 'text-white' : 'text-[#CCCCCC]'}`}>
                              {option.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'multiselect' && (
                    <div className="grid grid-cols-2 gap-2">
                      {field.options?.map((option) => {
                        const OptionIcon = option.icon;
                        const isSelected = (formData[field.id] || []).includes(option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleMultiSelect(field.id, option.value)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              isSelected
                                ? 'bg-[#2B2B2B] border-white/30'
                                : 'bg-[#262626] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {OptionIcon && <OptionIcon className={`w-4 h-4 ${option.color || 'text-white'}`} />}
                              <span className={`text-sm ${isSelected ? 'text-white' : 'text-[#CCCCCC]'}`}>
                                {option.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-white/20 bg-[#262626] text-white hover:bg-[#2B2B2B]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentSection === 0 ? 'Back' : 'Previous'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isSectionComplete()}
                className="bg-white hover:bg-[#F2F2F2] disabled:bg-[#333333] disabled:text-[#666666] text-black flex-1"
              >
                {currentSection === totalSections - 1 ? (
                  <>
                    Complete Setup
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onComplete(formData)}
            className="text-sm text-[#CCCCCC] hover:text-white transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}