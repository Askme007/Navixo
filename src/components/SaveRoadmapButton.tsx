// src\components\SaveRoadmapButton.tsx
import { Button } from "./ui/button";
import { Save, Loader2, Check } from "lucide-react";

interface SaveRoadmapButtonProps {
  isSaving: boolean;
  isSaved?: boolean;
  onClick: () => void;
  className?: string;
}

export function SaveRoadmapButton({
  isSaving,
  isSaved = false,
  onClick,
  className = "",
}: SaveRoadmapButtonProps) {
  return (
    <Button
      variant="outline"
      className={`gap-1 md:gap-2 border-[#333333] bg-transparent text-white hover:bg-white/5 text-xs md:text-sm flex-1 sm:flex-none disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ fontWeight: 500 }}
      onClick={onClick}
      disabled={isSaving || isSaved}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
          <span className="sm:hidden">Saving...</span>
        </>
      ) : isSaved ? (
        <>
          <Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
          <span className="hidden sm:inline text-emerald-400">Roadmap Saved</span>
          <span className="sm:hidden text-emerald-400">Saved</span>
        </>
      ) : (
        <>
          <Save className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Save Roadmap</span>
          <span className="sm:hidden">Save</span>
        </>
      )}
    </Button>
  );
}
