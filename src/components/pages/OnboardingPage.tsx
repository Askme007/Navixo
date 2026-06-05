// src\components\pages\OnboardingPage.tsx

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
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
  BookOpen,
  Zap,
  Sparkles,
  Check,
} from "lucide-react";
import { NavixoLogo } from "../NavixoLogo";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

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
  type:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "multiselect"
    | "slider"
    | "binary";
  placeholder?: string;
  options?: {
    value: string;
    label: string;
    icon?: any;
    color?: string;
    subtitle?: string;
  }[];
  min?: number;
  max?: number;
  required?: boolean;
};

export function OnboardingPage({ onComplete, onBack }: OnboardingPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    selectedSkills: [],
    improvementSkills: [],
    focusAreas: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Reset scroll position to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // Reset scroll position to top whenever the section changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [currentSection]);

  // Define conversational questions for each section
  const conversationalQuestions: Record<
    string,
    { question: string; subtext: string }
  > = {
    personal: {
      question: "Let's start with your background! 🎓",
      subtext: "Take your time — your journey begins now.",
    },
    aspirations: {
      question: "What career path excites you the most? 🎯",
      subtext: "Dream big — we'll help you get there!",
    },
    experience: {
      question: "Tell us about your experience! 💼",
      subtext: "No right or wrong answers — just honest reflection.",
    },
    skills: {
      question: "What makes you unique as a learner? ✨",
      subtext: "Navixo will personalize everything for you.",
    },
    learning: {
      question: "How do you learn best? 📚",
      subtext: "Everyone learns differently — let's find your style.",
    },
    personalization: {
      question: "Let's understand your strengths! 🚀",
      subtext: "We'll use this to build your perfect roadmap.",
    },
  };

  const sections: SectionType[] = [
    {
      id: "personal",
      title: "Personal Background",
      description: "Help us understand your current position",
      icon: GraduationCap,
      fields: [
        {
          id: "educationLevel",
          label: "What's your current education level?",
          type: "select",
          placeholder: "Select your education level",
          required: true,
          options: [
            { value: "highschool", label: "High School" },
            { value: "diploma", label: "Diploma / Associate Degree" },
            { value: "bachelors", label: "Bachelor's Degree" },
            { value: "masters", label: "Master's Degree" },
            { value: "doctorate", label: "Doctorate / PhD" },
            { value: "professional", label: "Professional Certification" },
          ],
        },
        {
          id: "currentStatus",
          label: "Where are you right now?",
          type: "radio",
          required: true,
          options: [
            {
              value: "studying",
              label: "Currently studying",
              icon: BookOpen,
              subtitle: "Learning and growing",
            },
            {
              value: "working",
              label: "Currently working",
              icon: Briefcase,
              subtitle: "Building experience",
            },
            {
              value: "exploring",
              label: "Exploring opportunities",
              icon: Target,
              subtitle: "Finding my path",
            },
            {
              value: "transitioning",
              label: "Career transitioning",
              icon: TrendingUp,
              subtitle: "Making a change",
            },
          ],
        },
        {
          id: "domain",
          label: "What domain or area interests you?",
          type: "text",
          placeholder:
            "e.g., Software Development, Marketing, Finance, Healthcare",
          required: true,
        },
        {
          id: "careerStage",
          label: "How would you describe your career stage?",
          type: "radio",
          required: true,
          options: [
            {
              value: "beginner",
              label: "Beginner",
              icon: Star,
              subtitle: "Just starting out",
            },
            {
              value: "intermediate",
              label: "Intermediate",
              icon: Award,
              subtitle: "Building momentum",
            },
            {
              value: "transitioning",
              label: "Transitioning",
              icon: TrendingUp,
              subtitle: "Changing direction",
            },
            {
              value: "advanced",
              label: "Advanced",
              icon: Target,
              subtitle: "Experienced professional",
            },
          ],
        },
      ],
    },
    {
      id: "aspirations",
      title: "Career Aspirations",
      description: "Define your professional goals",
      icon: Target,
      fields: [
        {
          id: "careerPath",
          label: "Which career path are you exploring?",
          type: "select",
          placeholder: "Select a career path",
          required: true,
          options: [
            { value: "technology", label: "Technology & IT" },
            { value: "healthcare", label: "Healthcare & Medicine" },
            { value: "business", label: "Business & Management" },
            { value: "finance", label: "Finance & Accounting" },
            { value: "design", label: "Design & Creative" },
            { value: "arts", label: "Arts & Entertainment" },
            { value: "education", label: "Education & Teaching" },
            { value: "law", label: "Law & Legal" },
            { value: "engineering", label: "Engineering" },
            { value: "trades", label: "Skilled Trades" },
            { value: "science", label: "Science & Research" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "shortTermGoal",
          label: "What do you want to achieve in the next 6-12 months?",
          type: "textarea",
          placeholder: "Share your short-term goal...",
          required: true,
        },
        {
          id: "longTermGoal",
          label: "Where do you see yourself in 3-5 years?",
          type: "textarea",
          placeholder: "Dream big — tell us your vision...",
          required: true,
        },
      ],
    },
    {
      id: "experience",
      title: "Experience & Exposure",
      description: "Share your background and experience",
      icon: Award,
      fields: [
        {
          id: "skillLevel",
          label: "Rate your current level in your chosen field",
          type: "slider",
          min: 1,
          max: 10,
          required: true,
        },
        {
          id: "pastExperience",
          label: "Do you have past experience in this field?",
          type: "radio",
          required: true,
          options: [
            {
              value: "none",
              label: "No experience",
              subtitle: "Starting fresh",
            },
            {
              value: "some",
              label: "Some experience",
              subtitle: "Less than 1 year",
            },
            {
              value: "moderate",
              label: "Moderate experience",
              subtitle: "1-3 years",
            },
            {
              value: "significant",
              label: "Significant experience",
              subtitle: "3+ years",
            },
          ],
        },
        {
          id: "completedWork",
          label: "Have you completed any courses, projects, or internships?",
          type: "textarea",
          placeholder:
            "List any relevant experience, courses, or projects (optional)",
          required: false,
        },
      ],
    },
    {
      id: "skills",
      title: "Strengths & Skills",
      description: "Identify your core competencies",
      icon: Brain,
      fields: [
        {
          id: "selectedSkills",
          label: "What are your strongest skills?",
          type: "multiselect",
          required: true,
          options: [
            {
              value: "communication",
              label: "Communication",
              icon: MessageCircle,
              color: "text-blue-400",
            },
            {
              value: "creative",
              label: "Creative Thinking",
              icon: Lightbulb,
              color: "text-yellow-400",
            },
            {
              value: "analytical",
              label: "Analytical Reasoning",
              icon: BarChart,
              color: "text-purple-400",
            },
            {
              value: "logical",
              label: "Logical Thinking",
              icon: Brain,
              color: "text-green-400",
            },
            {
              value: "leadership",
              label: "Leadership",
              icon: Users,
              color: "text-orange-400",
            },
            {
              value: "research",
              label: "Research",
              icon: BookOpen,
              color: "text-cyan-400",
            },
            {
              value: "technical",
              label: "Technical Tools",
              icon: Shield,
              color: "text-red-400",
            },
            {
              value: "domain",
              label: "Domain Knowledge",
              icon: Award,
              color: "text-indigo-400",
            },
          ],
        },
        {
          id: "improvementSkills",
          label: "What skills do you want to improve?",
          type: "multiselect",
          required: true,
          options: [
            {
              value: "communication",
              label: "Communication",
              icon: MessageCircle,
              color: "text-blue-400",
            },
            {
              value: "creative",
              label: "Creative Thinking",
              icon: Lightbulb,
              color: "text-yellow-400",
            },
            {
              value: "analytical",
              label: "Analytical Reasoning",
              icon: BarChart,
              color: "text-purple-400",
            },
            {
              value: "logical",
              label: "Logical Thinking",
              icon: Brain,
              color: "text-green-400",
            },
            {
              value: "leadership",
              label: "Leadership",
              icon: Users,
              color: "text-orange-400",
            },
            {
              value: "research",
              label: "Research",
              icon: BookOpen,
              color: "text-cyan-400",
            },
            {
              value: "technical",
              label: "Technical Tools",
              icon: Shield,
              color: "text-red-400",
            },
            {
              value: "domain",
              label: "Domain Knowledge",
              icon: Award,
              color: "text-indigo-400",
            },
          ],
        },
      ],
    },
    {
      id: "learning",
      title: "Learning Preferences",
      description: "Customize your learning experience",
      icon: BookOpen,
      fields: [
        {
          id: "learningStyle",
          label: "How do you prefer to learn?",
          type: "radio",
          required: true,
          options: [
            {
              value: "visual",
              label: "Visual",
              subtitle: "Videos, diagrams, infographics",
            },
            {
              value: "text",
              label: "Text-based",
              subtitle: "Articles, documentation",
            },
            {
              value: "interactive",
              label: "Interactive",
              subtitle: "Hands-on exercises, labs",
            },
            {
              value: "mentorship",
              label: "Mentorship",
              subtitle: "Guidance and feedback",
            },
          ],
        },
        {
          id: "learningPace",
          label: "What's your preferred learning pace?",
          type: "radio",
          required: true,
          options: [
            {
              value: "fast",
              label: "Fast-paced",
              subtitle: "Intensive learning",
            },
            {
              value: "moderate",
              label: "Moderate",
              subtitle: "Balanced approach",
            },
            {
              value: "slow",
              label: "Deep learning",
              subtitle: "Thorough understanding",
            },
          ],
        },
        {
          id: "dailyTime",
          label: "How much time can you dedicate daily?",
          type: "select",
          placeholder: "Select daily time commitment",
          required: true,
          options: [
            { value: "0-1", label: "0-1 hours" },
            { value: "1-2", label: "1-2 hours" },
            { value: "2-3", label: "2-3 hours" },
            { value: "3-5", label: "3-5 hours" },
            { value: "5+", label: "5+ hours" },
          ],
        },
      ],
    },
    {
      id: "personalization",
      title: "Personalization Setup",
      description: "Tailor Navixo to your needs",
      icon: Sparkles,
      fields: [
        {
          id: "focusAreas",
          label: "What should Navixo focus on for you?",
          type: "multiselect",
          required: true,
          options: [
            {
              value: "roadmap",
              label: "Career roadmap",
              icon: Target,
              color: "text-blue-400",
            },
            {
              value: "skillgaps",
              label: "Skill gap analysis",
              icon: BarChart,
              color: "text-purple-400",
            },
            {
              value: "learning",
              label: "Learning plan",
              icon: BookOpen,
              color: "text-green-400",
            },
            {
              value: "interview",
              label: "Interview prep",
              icon: MessageCircle,
              color: "text-orange-400",
            },
            {
              value: "productivity",
              label: "Productivity",
              icon: Zap,
              color: "text-yellow-400",
            },
            {
              value: "confidence",
              label: "Communication",
              icon: Users,
              color: "text-cyan-400",
            },
            {
              value: "mastery",
              label: "Domain mastery",
              icon: Award,
              color: "text-red-400",
            },
          ],
        },
      ],
    },
  ];

  const totalSections = sections.length;
  const currentSectionData = sections[currentSection];
  const progressPercentage = ((currentSection + 1) / totalSections) * 100;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleMultiSelect = (fieldId: string, optionValue: string) => {
    setFormData((prev) => {
      const current = prev[fieldId] || [];
      const isSelected = current.includes(optionValue);
      return {
        ...prev,
        [fieldId]: isSelected
          ? current.filter((v: string) => v !== optionValue)
          : [...current, optionValue],
      };
    });
  };

  const isSectionComplete = () => {
    return currentSectionData.fields.every((field) => {
      if (!field.required) return true;
      const value = formData[field.id];
      if (field.type === "multiselect") {
        return value && value.length > 0;
      }
      return value !== undefined && value !== "" && value !== null;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 2000);
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 via-[#0B0B0F] to-[#8B5CF6]/10" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
          }}
        />

        <motion.div
          className="max-w-md text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated NAVIXO Logo with Glow */}
          <motion.div
            className="mb-10 w-full flex justify-center items-center relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <NavixoLogo size={64} variant="white" />
          </motion.div>

          {/* Loading Text */}
          <motion.h2
            className="text-white mb-4"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              fontSize: "32px",
              letterSpacing: "-0.02em",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Creating your journey...
          </motion.h2>
          <motion.p
            className="text-[#B4BFDB] mb-12"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "16px",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Analyzing your profile and personalizing your roadmap
          </motion.p>

          {/* Progress Animation with neon gradient */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-full h-3 bg-[#1A1A24] rounded-full overflow-hidden shadow-inner relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3B82F6] via-[#14F4C9] to-[#8B5CF6] rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-[#3B82F6] to-[#14F4C9] rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/8 via-[#0B0B0F] to-[#8B5CF6]/8" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)",
        }}
      />

      <div className="w-full max-w-3xl relative z-10">
        {/* Animated Progress Bar with NAVIXO Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Floating NAVIXO Logo AI Guide */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Animated glow behind logo */}
                <motion.div
                  className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#3B82F6]/30 to-[#14F4C9]/30 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative">
                  <NavixoLogo size={28} variant="white" />
                </div>
              </motion.div>

              <div>
                <span
                  className="text-white block mb-0.5"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 600,
                    fontSize: "15px",
                  }}
                >
                  Your AI Career Guide
                </span>
                <span
                  className="text-[#9CA3AF]"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "13px",
                  }}
                >
                  Step {currentSection + 1} of {totalSections}
                </span>
              </div>
            </div>

            <motion.div
              className="px-4 py-2 bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 rounded-xl border border-[#3B82F6]/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              whileHover={{ scale: 1.05 }}
            >
              <span
                className="text-white"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                {Math.round(progressPercentage)}%
              </span>
            </motion.div>
          </div>

          {/* Segmented animated progress bar */}
          <div className="flex gap-2">
            {sections.map((_, index) => (
              <motion.div
                key={index}
                className="h-2.5 flex-1 rounded-full overflow-hidden bg-[#1A1A24] shadow-inner"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <motion.div
                  className={`h-full transition-all duration-500 ${
                    index < currentSection
                      ? "w-full bg-gradient-to-r from-[#3B82F6] to-[#14F4C9] shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                      : index === currentSection
                        ? "w-full bg-gradient-to-r from-[#14F4C9] to-[#8B5CF6] shadow-[0_0_16px_rgba(20,244,201,0.6)]"
                        : "w-0"
                  }`}
                  animate={
                    index === currentSection
                      ? {
                          opacity: [1, 0.7, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Card with premium glassmorphism */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Animated ambient glow */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-[#3B82F6]/20 via-[#14F4C9]/10 to-[#8B5CF6]/20 blur-3xl rounded-[32px] opacity-60"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <Card className="border border-white/10 bg-gradient-to-br from-[#13151B]/95 to-[#0D0F13]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-[28px] relative overflow-hidden">
              {/* Subtle animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <CardContent className="p-8 sm:p-10 md:p-12 relative">
                {/* Large Conversational Hero Question */}
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1
                    className="text-white mb-3 bg-gradient-to-r from-white via-white to-[#B4BFDB] bg-clip-text"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 600,
                      fontSize: "clamp(30px, 5vw, 40px)",
                      lineHeight: "1.15",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {conversationalQuestions[currentSectionData.id]?.question}
                  </h1>
                  <p
                    className="text-[#9CA3AF]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: "17px",
                      lineHeight: "1.6",
                    }}
                  >
                    {conversationalQuestions[currentSectionData.id]?.subtext}
                  </p>
                </motion.div>

                {/* Fields with beautiful card-based design */}
                <div className="space-y-9">
                  {currentSectionData.fields.map((field, fieldIndex) => (
                    <motion.div
                      key={field.id}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.1 + fieldIndex * 0.05,
                        duration: 0.4,
                      }}
                    >
                      <Label
                        className="text-white block"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "16px",
                        }}
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-[#F87171] ml-2">*</span>
                        )}
                      </Label>

                      {field.type === "text" && (
                        <Input
                          placeholder={field.placeholder}
                          value={formData[field.id] || ""}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          className="bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-6 py-4 text-[16px] focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2),0_0_20px_rgba(59,130,246,0.3)] transition-all duration-200 hover:border-white/20 backdrop-blur-xl"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                          }}
                        />
                      )}

                      {field.type === "textarea" && (
                        <Textarea
                          placeholder={field.placeholder}
                          value={formData[field.id] || ""}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          className="bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-6 py-4 min-h-[140px] text-[16px] focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2),0_0_20px_rgba(59,130,246,0.3)] transition-all duration-200 resize-none hover:border-white/20 backdrop-blur-xl"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            lineHeight: "1.7",
                          }}
                        />
                      )}

                      {field.type === "select" && (
                        <Select
                          value={formData[field.id] || ""}
                          onValueChange={(value) =>
                            handleInputChange(field.id, value)
                          }
                        >
                          <SelectTrigger
                            className="bg-[#1A1A24]/70 border border-white/10 text-white rounded-2xl px-6 py-4 text-[16px] hover:border-white/20 focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] transition-all backdrop-blur-xl"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A24] border border-white/10 rounded-2xl backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                            {field.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl my-1 mx-1 cursor-pointer"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 400,
                                  fontSize: "15px",
                                }}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.type === "radio" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {field.options?.map((option) => {
                            const OptionIcon = option.icon;
                            const isSelected =
                              formData[field.id] === option.value;
                            return (
                              <motion.button
                                key={option.value}
                                onClick={() =>
                                  handleInputChange(field.id, option.value)
                                }
                                className={`group p-5 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                                  isSelected
                                    ? "bg-gradient-to-br from-[#3B82F6]/15 to-[#14F4C9]/10 border-[#3B82F6]/50 shadow-[0_0_24px_rgba(59,130,246,0.25)]"
                                    : "bg-[#1A1A24]/50 border-white/10 hover:border-white/20 hover:bg-[#1A1A24]/70"
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {/* Animated gradient overlay */}
                                <motion.div
                                  className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent transition-opacity ${
                                    isSelected
                                      ? "opacity-100"
                                      : "opacity-0 group-hover:opacity-100"
                                  }`}
                                />

                                <div className="relative flex items-start gap-4">
                                  {OptionIcon && (
                                    <div
                                      className={`mt-1 p-2.5 rounded-xl transition-all ${
                                        isSelected
                                          ? "bg-[#3B82F6]/25 shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                                          : "bg-white/5"
                                      }`}
                                    >
                                      <OptionIcon
                                        className={`w-5 h-5 transition-colors ${
                                          isSelected
                                            ? "text-[#60A5FA]"
                                            : "text-white/50"
                                        }`}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`transition-colors mb-1 ${
                                        isSelected
                                          ? "text-white"
                                          : "text-[#D1D5DB]"
                                      }`}
                                      style={{
                                        fontFamily: "Inter, sans-serif",
                                        fontWeight: 500,
                                        fontSize: "16px",
                                      }}
                                    >
                                      {option.label}
                                    </p>
                                    {option.subtitle && (
                                      <p
                                        className={`transition-colors ${
                                          isSelected
                                            ? "text-[#9CA3AF]"
                                            : "text-[#6B7280]"
                                        }`}
                                        style={{
                                          fontFamily: "Inter, sans-serif",
                                          fontWeight: 400,
                                          fontSize: "14px",
                                        }}
                                      >
                                        {option.subtitle}
                                      </p>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      className="mt-1"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                      }}
                                    >
                                      <div className="bg-[#3B82F6] rounded-full p-1">
                                        <Check className="w-4 h-4 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}

                      {field.type === "slider" && (
                        <div className="space-y-7 pt-4">
                          {/* Premium custom slider */}
                          <div className="px-3">
                            <Slider
                              min={field.min || 0}
                              max={field.max || 100}
                              step={1}
                              value={[formData[field.id] || field.min || 0]}
                              onValueChange={(value) =>
                                handleInputChange(field.id, value[0])
                              }
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <span
                                className="text-[#9CA3AF] block mb-1"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 500,
                                  fontSize: "14px",
                                }}
                              >
                                🌱 Beginner
                              </span>
                              <span
                                className="text-[#6B7280]"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 400,
                                  fontSize: "13px",
                                }}
                              >
                                Level {field.min}
                              </span>
                            </div>

                            <motion.div
                              className="px-6 py-3 bg-gradient-to-r from-[#3B82F6]/20 via-[#14F4C9]/20 to-[#8B5CF6]/20 border-2 border-[#3B82F6]/40 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                              whileHover={{ scale: 1.05 }}
                            >
                              <span
                                className="text-white block"
                                style={{
                                  fontFamily: "Space Grotesk, sans-serif",
                                  fontWeight: 600,
                                  fontSize: "18px",
                                }}
                              >
                                Level {formData[field.id] || field.min || 0}
                              </span>
                            </motion.div>

                            <div className="text-right">
                              <span
                                className="text-[#9CA3AF] block mb-1"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 500,
                                  fontSize: "14px",
                                }}
                              >
                                🚀 Expert
                              </span>
                              <span
                                className="text-[#6B7280]"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 400,
                                  fontSize: "13px",
                                }}
                              >
                                Level {field.max}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {field.type === "multiselect" && (
                        <div className="grid grid-cols-2 gap-3">
                          {field.options?.map((option) => {
                            const OptionIcon = option.icon;
                            const isSelected = (
                              formData[field.id] || []
                            ).includes(option.value);
                            return (
                              <motion.button
                                key={option.value}
                                onClick={() =>
                                  handleMultiSelect(field.id, option.value)
                                }
                                className={`group p-4 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                                  isSelected
                                    ? "bg-gradient-to-br from-[#3B82F6]/15 to-[#14F4C9]/10 border-[#3B82F6]/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    : "bg-[#1A1A24]/50 border-white/10 hover:border-white/15 hover:bg-[#1A1A24]/70"
                                }`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <motion.div
                                  className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent transition-opacity ${
                                    isSelected
                                      ? "opacity-100"
                                      : "opacity-0 group-hover:opacity-100"
                                  }`}
                                />

                                <div className="relative flex items-center gap-3">
                                  {OptionIcon && (
                                    <div
                                      className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                                        isSelected
                                          ? "bg-[#3B82F6]/25 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                                          : "bg-white/5"
                                      }`}
                                    >
                                      <OptionIcon
                                        className={`w-4 h-4 ${
                                          option.color || "text-white/70"
                                        }`}
                                      />
                                    </div>
                                  )}
                                  <span
                                    className={`transition-colors flex-1 ${
                                      isSelected
                                        ? "text-white"
                                        : "text-[#BEBEBE]"
                                    }`}
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: 500,
                                      fontSize: "15px",
                                    }}
                                  >
                                    {option.label}
                                  </span>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                      }}
                                    >
                                      <div className="bg-[#3B82F6] rounded-full p-1 flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Premium Navigation */}
                <motion.div
                  className="flex gap-4 mt-14 pt-10 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="group border-2 border-white/20 bg-white/5 text-white hover:text-white hover:bg-white/10 hover:border-white/30 transition-all rounded-2xl px-7 py-4 shadow-lg backdrop-blur-xl"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                    }}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {currentSection === 0 ? "Back" : "Previous"}
                  </Button>

                  <motion.div className="flex-1">
                    <Button
                      onClick={handleNext}
                      disabled={!isSectionComplete()}
                      className="group w-full bg-gradient-to-r from-white via-white to-[#F0F0F0] hover:from-white hover:via-white hover:to-white text-black hover:text-black rounded-2xl px-7 py-4 shadow-[0_8px_24px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_32px_rgba(255,255,255,0.3)] disabled:from-[#2A2A30] disabled:via-[#2A2A30] disabled:to-[#2A2A30] disabled:text-[#6B7280] disabled:shadow-none transition-all duration-300"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      {currentSection === totalSections - 1 ? (
                        <>
                          Complete Setup
                          <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Skip Option */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleSubmit}
            className="group relative text-[#9CA3AF] hover:text-white transition-colors inline-flex items-center gap-2"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "15px",
            }}
          >
            <span>Skip for now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-[#3B82F6] via-[#14F4C9] to-[#8B5CF6] group-hover:w-full transition-all duration-300" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
