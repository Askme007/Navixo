import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Menu, MessageSquare, Plus } from "lucide-react";

export function ChatHistorySidebar({
  history,
  currentId,
  onSelect,
  onNewChat,
}: {
  history: any[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] bg-[#0B0B0F] border-r border-white/10 p-0 flex flex-col"
      >
        <SheetHeader className="p-5 border-b border-white/10">
          <SheetTitle className="text-white text-left text-sm uppercase tracking-widest font-bold text-slate-500">
            Execution Logs
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 flex flex-col flex-1 overflow-hidden">
          <Button
            onClick={onNewChat}
            className="w-full bg-white text-slate-950 hover:bg-slate-200 mb-6 rounded-xl font-medium"
          >
            <Plus className="w-4 h-4 mr-2" /> New Session
          </Button>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
            {history.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-4">
                No past sessions found.
              </p>
            )}
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => onSelect(h.id)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  currentId === h.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm font-medium">
                  {h.title || "Execution Session"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
