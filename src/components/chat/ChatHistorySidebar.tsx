import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Menu, MessageSquare, Plus, Trash2 } from "lucide-react";

export function ChatHistorySidebar({
  history,
  currentId,
  onSelect,
  onNewChat,
  onDelete,
}: {
  history: any[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
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

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {history.length === 0 && (
              <p className="text-sm text-slate-500 text-center mt-4">
                No past sessions found.
              </p>
            )}
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => onSelect(h.id)}
                className={`group relative w-full text-left p-3 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                  currentId === h.id
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  <span className="truncate text-sm font-medium">
                    {h.title || "Execution Session"}
                  </span>
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(h.id, e);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-500 transition-all shrink-0 cursor-pointer"
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
