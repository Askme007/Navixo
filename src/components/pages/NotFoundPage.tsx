// src/components/pages/NotFoundPage.tsx

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Home, Map, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  showNewRoadmapButton?: boolean;
}

export function NotFoundPage({
  title = "Lost in Navigation?",
  description = "The page or roadmap you are looking for doesn't exist, was moved, or has drifted out of reach.",
  showNewRoadmapButton = true,
}: NotFoundPageProps = {}) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0B0B0F] text-white px-4 selection:bg-[#8B5CF6]/30 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full text-center space-y-6 z-10">
        {/* Floating icon badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl mb-2 group">
          <Compass className="w-10 h-10 text-purple-400 group-hover:rotate-45 transition-transform duration-500" />
        </div>

        {/* 404 Big Numbers */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight bg-gradient-to-b from-white via-white/80 to-white/30 bg-clip-text text-transparent font-['Space_Grotesk',sans-serif]">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 h-11 text-sm font-medium shadow-lg shadow-purple-500/25 transition-all gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Go to Dashboard
          </Button>

          {showNewRoadmapButton ? (
            <Button
              variant="outline"
              onClick={() => navigate("/roadmap")}
              className="w-full sm:w-auto rounded-2xl border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 px-5 py-2.5 h-11 text-sm font-medium transition-all gap-2"
            >
              <Map className="w-4 h-4 text-purple-400" />
              Generate Roadmap
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto rounded-2xl border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 px-5 py-2.5 h-11 text-sm font-medium transition-all gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          )}
        </div>

        {/* Quick Back link */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go back to previous page</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
