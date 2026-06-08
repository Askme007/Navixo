// src/components/chat/ChatPromptBar.tsx
import { useRef, useEffect } from "react";
import { Send, FileText } from "lucide-react";
import { Textarea } from "../ui/textarea";

export function ChatPromptBar({
  input,
  setInput,
  onSend,
  disabled,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic expansion and contraction tracking loop
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (input === "") {
      textarea.style.height = "24px";
    } else {
      textarea.style.height = "24px";
      const calculatedHeight = Math.min(textarea.scrollHeight, 160);
      textarea.style.height = `${calculatedHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleAttach = () => {
    alert(
      "Document parsing is currently frozen for placement season. This feature will unlock in the next update.",
    );
  };

  return (
    <div className="chat-width relative z-10 pb-6 pt-2">
      <div className="prompt-bar">
        <button
          onClick={handleAttach}
          className="prompt-icon-btn flex-shrink-0"
        >
          <FileText className="w-4 h-4" />
        </button>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Command Navixo Engine..."
          className="prompt-input custom-scrollbar"
          disabled={disabled}
          rows={1}
        />

        <button
          onClick={onSend}
          disabled={!input.trim() || disabled}
          className="prompt-icon-btn flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] text-center text-purple-400/40 mt-3 font-medium tracking-wide">
        Navixo Core OS v2.1 • Placement Execution Subsystem
      </p>
    </div>
  );
}
