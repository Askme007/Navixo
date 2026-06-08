// src/components/chat/ChatMessageList.tsx
import { NavixoLogo } from "../navixoLogo";
import { Loader2, AlertCircle } from "lucide-react";
import { MarkdownRenderer } from "../Markdown/MarkdownRenderer";

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
              <div className="w-full flex justify-end">
                <div className="user-message">
                  <div className="bubble">
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              </div>
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
