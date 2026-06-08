// src/components/pages/ChatbotPage.tsx
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { NavixoLogo } from "../NavixoLogo";

import { ChatHistorySidebar } from "../chat/ChatHistorySidebar";
import { ChatAnalysisSidebar } from "../chat/ChatAnalysisSidebar";
import { ChatMessageList } from "../chat/ChatMessageList";
import { ChatPromptBar } from "../chat/ChatPromptBar";
import "../chat/ChatbotPage.css";

export function ChatbotPage({
  userName,
  onBack,
  initialMessage,
  fromRoadmap,
}: {
  userName: string;
  onBack: () => void;
  onLogout: () => void;
  initialMessage?: string;
  fromRoadmap?: boolean;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [convId, setConvId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Track the ref to bypass reactive state intersection loops
  const currentConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/conversations/list`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setHistory(data.conversations || []);

      const urlId = searchParams.get("id");

      // CRITICAL BUG FIX: Only wipe local context if the URL actually changes to a completely different node id
      if (urlId && urlId !== currentConvIdRef.current) {
        currentConvIdRef.current = urlId;
        setConvId(urlId);
        loadChat(urlId, session.access_token);
      } else if (!urlId) {
        currentConvIdRef.current = null;
        setConvId(null);
        setMessages([
          {
            id: "init",
            role: "assistant",
            content:
              "Navixo Core Session initialized. Provide a parameter matrix, problem description, or a structural task dependency bottleneck to analyze execution paths.",
          },
        ]);
      }
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    if (initialMessage && fromRoadmap) {
      setTimeout(() => {
        setInput(initialMessage);
      }, 400);
    }
  }, [initialMessage, fromRoadmap]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking, error]);

  const loadChat = async (id: string, token?: string) => {
    if (!token) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token;
    }
    setConvId(id);
    currentConvIdRef.current = id;
    navigate(`/chat?id=${id}`, { replace: true });
    setHistoryOpen(false);

    const res = await fetch(`${API_URL}/api/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(
      data.messages?.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })) || [],
    );
  };

  const handleNewChat = () => {
    currentConvIdRef.current = null;
    setConvId(null);
    setMessages([
      {
        id: "init",
        role: "assistant",
        content:
          "Navixo Core Session initialized. Provide a parameter matrix, problem description, or a structural task dependency bottleneck to analyze execution paths.",
      },
    ]);
    navigate("/chat", { replace: true });
    setHistoryOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setError(null);

    // Optimistic user bubble append occurs smoothly
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMsg },
    ]);
    setIsThinking(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      let activeId = convId;

      if (!activeId) {
        // Derive clean logging titles from user first message
        const title =
          userMsg.length > 26 ? userMsg.substring(0, 26) + "..." : userMsg;
        const res = await fetch(`${API_URL}/api/conversations/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ title }),
        });
        const data = await res.json();
        activeId = data.conversationId;

        // Lock references prior to calling the router to insulate state
        currentConvIdRef.current = activeId;
        setConvId(activeId);
        navigate(`/chat?id=${activeId}`, { replace: true });

        fetch(`${API_URL}/api/conversations/list`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((r) => r.json())
          .then((d) => setHistory(d.conversations || []));
      }

      const res = await fetch(`${API_URL}/api/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ conversationId: activeId, message: userMsg }),
      });

      if (!res.ok) {
        if (res.status === 429)
          throw new Error("API Limit Reached. System Cool-down engaged.");
        throw new Error("Failed to link with execution backend.");
      }

      setIsThinking(false);
      setIsStreaming(true);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      const msgId = Date.now().toString();

      setStreamingMessageId(msgId);
      setMessages((prev) => [
        ...prev,
        { id: msgId, role: "assistant", content: "" },
      ]);

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.replace("data:", "").trim();
            if (data === "[DONE]") continue;
            try {
              aiText += JSON.parse(data).token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, content: aiText } : m,
                ),
              );
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  };

  return (
    <div className="h-screen bg-[#05030a] text-white flex flex-col overflow-hidden font-sans">
      {/* COHERENT NAVIXO SYSTEM HEADER */}
      <div className="sticky top-0 z-20 border-b border-purple-500/10 bg-[#06040d]/90 backdrop-blur-xl shrink-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <ChatHistorySidebar
              history={history}
              currentId={convId}
              isOpen={historyOpen}
              setIsOpen={setHistoryOpen}
              onSelect={loadChat}
              onNewChat={handleNewChat}
            />

            <Button
              variant="ghost"
              onClick={onBack}
              className="h-9 gap-1.5 border border-transparent px-2.5 text-xs text-gray-300 hover:border-purple-500/20 hover:bg-purple-950/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>

            <div className="min-w-0 ml-1.5">
              <div className="flex items-center gap-2">
                <NavixoLogo className="text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ChatAnalysisSidebar />
            <span className="hidden max-w-[120px] truncate text-xs text-purple-300 md:block ml-1 border-l border-purple-500/20 pl-3 font-medium">
              {userName}
            </span>
          </div>
        </div>
      </div>

      {/* COMPILATION LOG / CHAT CONTENT CONTAINER */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#05030a]"
      >
        <ChatMessageList
          messages={messages}
          isThinking={isThinking}
          isStreaming={isStreaming}
          streamingMessageId={streamingMessageId}
          error={error}
        />
      </div>

      {/* SECURE SUB-SYSTEM INPUT ANCHOR */}
      <div className="shrink-0 bg-[#05030a] border-t border-purple-500/10 w-full flex justify-center px-4">
        <ChatPromptBar
          input={input}
          setInput={setInput}
          onSend={handleSend}
          disabled={isThinking || isStreaming}
        />
      </div>
    </div>
  );
}
