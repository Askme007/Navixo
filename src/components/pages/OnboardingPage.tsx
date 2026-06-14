import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function OnboardingPage({
  onBack,
  onComplete,
}: {
  onComplete: (data: any) => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    education: "bachelors",
    currentStatus: "studying",
    domain: "",
    careerPath: "technology",
    shortTermGoal: "",
    skillLevel: "5",
    dailyTime: "2-3",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();

  setIsSubmitting(true);
  setError(null);

  try {
    const token = authService.getToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const API_URL = import.meta.env.VITE_API_URL;

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
      throw new Error(data.error || "Failed to save onboarding");
    }

    navigate("/dashboard", { replace: true });
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Failed to save onboarding");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Initialize Workspace</h1>
          <p className="text-gray-400">
            Configure your execution engine parameters.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6 bg-[#111111] border border-white/10 p-6 md:p-8 rounded-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-400">Education Level</Label>
                <select
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                  value={formData.education}
                  onChange={(e) =>
                    setFormData({ ...formData, education: e.target.value })
                  }
                >
                  <option value="highschool">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-gray-400">Current Status</Label>
                <select
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                  value={formData.currentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStatus: e.target.value })
                  }
                >
                  <option value="studying">Currently studying</option>
                  <option value="working">Currently working</option>
                  <option value="exploring">Exploring options</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-400">Domain Interest</Label>
              <Input
                required
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                className="bg-[#0A0A0A] border-white/10 h-12 focus-visible:ring-purple-500/30"
                placeholder="e.g. Software Development, AI..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-gray-400">
                Short-term Goal (6-12 months)
              </Label>
              <Textarea
                required
                value={formData.shortTermGoal}
                onChange={(e) =>
                  setFormData({ ...formData, shortTermGoal: e.target.value })
                }
                className="bg-[#0A0A0A] border-white/10 min-h-[100px] focus-visible:ring-purple-500/30"
                placeholder="Land a frontend internship..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-gray-400">
                  Current Skill Level (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.skillLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, skillLevel: e.target.value })
                  }
                  className="bg-[#0A0A0A] border-white/10 h-12 focus-visible:ring-purple-500/30"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-gray-400">Daily Time Commitment</Label>
                <select
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                  value={formData.dailyTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyTime: e.target.value })
                  }
                >
                  <option value="0-1">0-1 hours</option>
                  <option value="1-2">1-2 hours</option>
                  <option value="2-3">2-3 hours</option>
                  <option value="3+">3+ hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              Back
            </Button>
            <div className="flex-1"></div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit()}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
