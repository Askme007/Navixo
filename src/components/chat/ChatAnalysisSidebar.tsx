import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { BarChart3 } from "lucide-react";

export function ChatAnalysisSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white border border-white/10 bg-white/5 rounded-xl h-9"
        >
          <BarChart3 className="w-4 h-4 mr-2" /> Analysis
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[340px] bg-[#0B0B0F] border-l border-white/10 p-0"
      >
        <SheetHeader className="p-5 border-b border-white/10">
          <SheetTitle className="text-white text-left text-sm uppercase tracking-widest font-bold text-slate-500">
            Real-time Analysis
          </SheetTitle>
        </SheetHeader>
        <div className="p-6 flex flex-col items-center justify-center text-center mt-10">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Active Analysis
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Attach roadmap steps or complete executions to see real-time skill
            gaps and insights here.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
