import { Button } from './ui/button';
import { Save, Loader2 } from 'lucide-react';

interface SaveRoadmapButtonProps {
  isSaving: boolean;
  onClick: () => void;
}

export function SaveRoadmapButton({ isSaving, onClick }: SaveRoadmapButtonProps) {
  return (
    <Button 
      variant="outline" 
      className="gap-1 md:gap-2 border-[#333333] bg-transparent text-white hover:bg-white/5 text-xs md:text-sm flex-1 sm:flex-none disabled:opacity-60 disabled:cursor-not-allowed" 
      style={{ fontWeight: 500 }}
      onClick={onClick}
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
          <span className="sm:hidden">Saving...</span>
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
