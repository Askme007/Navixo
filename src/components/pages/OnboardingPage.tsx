import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Rocket,
  BrainCircuit,
  Building2,
  Code2,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function OnboardingPage({
  onBack,
  onComplete,
}: {
  onComplete: (data: any) => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    education: "bachelors",
    currentStatus: "studying",
    domain: "Software Development",
    careerPath: "Software Development Engineer (SDE)",
    targetCompanies: "Google, Microsoft, Amazon, Atlassian",
    primaryLanguage: "C++",
    graduationYear: "2026",
    college: "",
    shortTermGoal: "",
    skillLevel: "5",
    dailyTime: "2-3",
    leetcodeUsername: "",
    codeforcesUsername: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSubmitStep("Calibrating Placement Engine...");

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const API_URL =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";

      setSubmitStep("Generating Roadmap & Indexing Semantic Memory...");

      const res = await fetch(`${API_URL}/api/profile/onboarding`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize workspace");
      }

      setSubmitStep("Synchronizing Daily Protocol...");

      // Clear any outdated cache so the new user gets instant fresh paint
      const userId = authService.getUser()?.id;
      if (userId) {
        try {
          localStorage.removeItem(`navixo_dashboard_cache_${userId}`);
        } catch {}
      }

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save onboarding");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 md:py-12 flex items-center justify-center selection:bg-[#8B5CF6]/30">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-medium">
            <Rocket className="w-3.5 h-3.5 text-purple-400" />
            INITIALIZE PLACEMENT ENGINE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Calibrate Your Placement Trajectory
          </h1>
          <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto">
            Navixo uses these parameters to generate your personalized learning roadmap, calibrate daily execution protocols, and prime your AI Mentor.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {isSubmitting ? (
          <div className="bg-[#0F1117] border border-white/10 p-12 rounded-3xl text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto animate-pulse">
              <BrainCircuit className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-mono">
                {submitStep}
              </h3>
              <p className="text-xs text-white/40">
                Setting up pgvector memory, starter roadmap milestones, and daily tasks...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 bg-[#0F1117] border border-[#2f2f2f] p-6 md:p-8 rounded-3xl shadow-xl">
              {/* Target Role & Specialization */}
              <div className="space-y-3">
                <Label className="text-xs text-white/70 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Target Placement Role
                </Label>
                <select
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#8B5CF6] outline-none"
                  value={formData.careerPath}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      careerPath: e.target.value,
                      domain: e.target.value,
                    })
                  }
                >
                  <option value="Software Development Engineer (SDE)">
                    Software Development Engineer (SDE) - Core DSA & Backend
                  </option>
                  <option value="Frontend Engineer">
                    Frontend Engineer - React, Performance, Web Architecture
                  </option>
                  <option value="Backend / Systems Engineer">
                    Backend Engineer - Distributed Systems, OS, DBs, Microservices
                  </option>
                  <option value="Full Stack Developer">
                    Full Stack Developer - End-to-End Product Architecture
                  </option>
                  <option value="Data Engineer / ML Infra">
                    Data Engineer - Pipelines, Cloud, Big Data & Systems
                  </option>
                </select>
              </div>

              {/* Target Companies */}
              <div className="space-y-2">
                <Label className="text-xs text-white/70 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Target Companies (Dream & Core Placements)
                </Label>
                <Input
                  required
                  value={formData.targetCompanies}
                  onChange={(e) =>
                    setFormData({ ...formData, targetCompanies: e.target.value })
                  }
                  className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6] h-11 text-sm"
                  placeholder="e.g. Google, Microsoft, Amazon, Atlassian, Uber, Startups"
                />
                <p className="text-[11px] text-white/40">
                  Your AI Mentor will calibrate question patterns and system design focus to these companies.
                </p>
              </div>

              {/* Languages & Batch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs text-white/70 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Primary Language
                  </Label>
                  <select
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-[#8B5CF6] outline-none"
                    value={formData.primaryLanguage}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryLanguage: e.target.value })
                    }
                  >
                    <option value="C++">C++ (STL, Competitive)</option>
                    <option value="Java">Java (OOP, Collections)</option>
                    <option value="Python">Python (DSA, Scripts)</option>
                    <option value="TypeScript">TypeScript / JavaScript</option>
                    <option value="Go">Go (Systems)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                    Graduation Year / Batch
                  </Label>
                  <select
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-[#8B5CF6] outline-none"
                    value={formData.graduationYear}
                    onChange={(e) =>
                      setFormData({ ...formData, graduationYear: e.target.value })
                    }
                  >
                    <option value="2025">2025 (Immediate Hiring)</option>
                    <option value="2026">2026 (Upcoming Season)</option>
                    <option value="2027">2027 (Internships / Pre-final)</option>
                    <option value="2028">2028 (Early Foundation)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/70 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Daily Time Commitment
                  </Label>
                  <select
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-[#8B5CF6] outline-none"
                    value={formData.dailyTime}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyTime: e.target.value })
                    }
                  >
                    <option value="1-2">1-2 Hours/Day</option>
                    <option value="2-3">2-3 Hours/Day</option>
                    <option value="3-4">3-4 Hours/Day</option>
                    <option value="4+">4+ Hours/Day</option>
                  </select>
                </div>
              </div>

              {/* College & Skill Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                    College / University
                  </Label>
                  <Input
                    value={formData.college}
                    onChange={(e) =>
                      setFormData({ ...formData, college: e.target.value })
                    }
                    placeholder="e.g. IIT, NIT, BITS, SRM, VIT..."
                    className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                      Current DSA Skill Level (1-10)
                    </Label>
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      Level {formData.skillLevel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.skillLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, skillLevel: e.target.value })
                    }
                    className="w-full accent-[#8B5CF6] cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Competitive Handles (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                    LeetCode Handle (Optional)
                  </Label>
                  <Input
                    value={formData.leetcodeUsername}
                    onChange={(e) =>
                      setFormData({ ...formData, leetcodeUsername: e.target.value })
                    }
                    placeholder="e.g. touriste"
                    className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                    Codeforces Handle (Optional)
                  </Label>
                  <Input
                    value={formData.codeforcesUsername}
                    onChange={(e) =>
                      setFormData({ ...formData, codeforcesUsername: e.target.value })
                    }
                    placeholder="e.g. tourist"
                    className="bg-[#07090e] border-white/10 text-white focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              {/* Short-Term Goal */}
              <div className="space-y-2">
                <Label className="text-xs text-white/70 uppercase tracking-wider font-mono">
                  Primary Milestone / Target Deadline
                </Label>
                <Textarea
                  value={formData.shortTermGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, shortTermGoal: e.target.value })
                  }
                  placeholder="e.g. Crack an SDE internship/placement at a product firm before September. Need strong mastery over DP and Graphs."
                  className="bg-[#07090e] border-white/10 min-h-[80px] focus:border-[#8B5CF6] text-sm"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-white/40 hover:text-white"
              >
                Back
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit()}
                  className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  Use Defaults & Launch
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white px-8 rounded-xl font-medium shadow-xl shadow-purple-900/40"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Launch Workspace & Generate Roadmap
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
