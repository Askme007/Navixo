// src/components/chat/ChatMessageList.tsx
import { useState } from "react";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Rocket,
  Clock,
} from "lucide-react";
import { MarkdownRenderer } from "../Markdown/MarkdownRenderer";

function RoadmapPromptRenderer({ content }: { content: string }) {
  const stepMatch = content.match(/\[Step #(\d+):\s*([^\]]+)\]/);
  const stepNumber = stepMatch ? stepMatch[1] : null;
  const stepTitle = stepMatch ? stepMatch[2] : null;

  const durationMatch = content.match(/Duration:\s*([^|\n]+)/i);
  const levelMatch = content.match(/Level:\s*([^\n]+)/i);
  const duration = durationMatch ? durationMatch[1].trim() : null;
  const level = levelMatch ? levelMatch[1].trim() : null;

  const descMatch = content.match(
    /Description:\s*([^\n]+(?:\n(?!(?:Could you|Step ID|Duration))[^\n]+)*)/i,
  );
  const description = descMatch ? descMatch[1].trim() : null;

  const questionMatch = content.match(
    /(Could you give me an action plan[\s\S]*)/i,
  );
  const question = questionMatch ? questionMatch[1].trim() : null;

  if (!stepTitle) {
    return (
      <p className="whitespace-pre-wrap font-sans break-words">{content}</p>
    );
  }

  return (
    <div className="space-y-2.5 font-sans text-left">
      <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
        <Rocket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Roadmap Step Inquiry</span>
        {stepNumber && (
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-200">
            Step #{stepNumber}
          </span>
        )}
      </div>

      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          {stepTitle}
        </h4>

        {(duration || level) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            {duration && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                <Clock className="w-3 h-3 text-purple-400" />
                {duration}
              </span>
            )}
            {level && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-300 uppercase tracking-wider text-[10px] font-medium">
                {level}
              </span>
            )}
          </div>
        )}

        {description && (
          <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-white/5">
            {description}
          </p>
        )}
      </div>

      {question && (
        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed pt-1">
          {question}
        </p>
      )}
    </div>
  );
}

function UserMessageItem({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if message is long enough to warrant folding
  const isLong = content.length > 180 || content.split("\n").length > 3;

  const isRoadmapPrompt =
    content.includes("I need guidance on this roadmap step:") &&
    content.includes("Step #");

  return (
    <div className="w-full flex justify-end">
      <div className="user-message max-w-[92%] sm:max-w-[82%] md:max-w-[72%]">
        <div className="bubble-wrapper relative w-full rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#1C1530] via-[#140E24] to-[#0E0A1A] border border-purple-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.35)] p-3.5 sm:p-4 text-slate-100 text-[13.5px] sm:text-[14.5px] leading-relaxed transition-all">
          <div
            className={`transition-all duration-300 relative ${
              isLong && !isExpanded
                ? "max-h-24 sm:max-h-28 overflow-hidden"
                : "max-h-none"
            }`}
          >
            {isRoadmapPrompt ? (
              <RoadmapPromptRenderer content={content} />
            ) : (
              <p className="whitespace-pre-wrap font-sans break-words selection:bg-purple-500/40">
                {content}
              </p>
            )}

            {/* Gradient fade-out overlay when folded */}
            {isLong && !isExpanded && (
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#140E24] via-[#140E24]/90 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Unfold / Fold button */}
          {isLong && (
            <div className="mt-2.5 pt-2 border-t border-purple-500/15 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-purple-300/60 uppercase tracking-wider">
                {isExpanded ? "Full Message" : "Preview (Folded)"}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 hover:text-white text-xs font-medium transition-all cursor-pointer select-none"
                aria-label={isExpanded ? "Collapse message" : "Expand full message"}
              >
                <span>{isExpanded ? "Collapse" : "Expand prompt"}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessageList({
  messages,
  isThinking,
  isStreaming,
  streamingMessageId,
  error,
}: {
  messages: any[];
  isThinking: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;
}) {
  return (
    <div className="chat-width space-y-8 py-10">
      {/* Rebranded Empty Welcome State */}
      {messages.length <= 1 && !isThinking && (
        <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
          <h1 className="text-2xl sm:text-3xl text-white mb-3 font-bold tracking-tight">
            Navixo{" "}
            <span className="text-cyan-400 font-medium text-lg sm:text-xl block sm:inline sm:ml-2">
              Execution OS
            </span>
          </h1>
          <p className="text-gray-400 leading-relaxed max-w-lg text-sm sm:text-base">
            Optimize execution structures, verify baseline dependencies, trace
            runtime roadblocks, and parse core placement parameters.
          </p>
        </div>
      )}

      {/* Message Output Thread */}
      {messages.length > 1 &&
        messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} my-6`}
          >
            {m.role === "assistant" ? (
              <div className="w-full flex justify-start">
                <div className="assistant-message overflow-x-auto">
                  <MarkdownRenderer
                    content={m.content}
                    streaming={isStreaming && streamingMessageId === m.id}
                    messageId={m.id}
                    theme="dark"
                    onCopy={(text) => navigator.clipboard.writeText(text)}
                  />
                </div>
              </div>
            ) : (
              <UserMessageItem content={m.content} />
            )}
          </div>
        ))}

      {/* Processing State */}
      {isThinking && (
        <div className="flex justify-start my-6">
          <div className="flex items-center gap-3 bg-purple-950/20 border border-purple-500/20 px-4 py-2.5 rounded-xl">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase font-sans">
              Compiling Trace...
            </span>
          </div>
        </div>
      )}

      {/* Error Boundary Output */}
      {error && (
        <div className="flex justify-center my-6">
          <div className="flex items-start gap-3 bg-red-950/30 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl w-full">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-sans text-sm">
              <p className="font-bold tracking-wide uppercase text-xs text-red-500">
                Trace Exception Intercepted
              </p>
              <p className="mt-1 text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
