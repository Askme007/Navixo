// src/components/pages/ChatbotPage.tsx
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
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


  const scrollRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Track the ref to bypass reactive state intersection loops
  const currentConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = authService.getToken();

      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch(`${API_URL}/api/conversations/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setHistory(data.conversations || []);

      const urlId = searchParams.get("id");

      if (urlId && urlId !== currentConvIdRef.current) {
        currentConvIdRef.current = urlId;
        setConvId(urlId);

        loadChat(urlId, token);
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
    const authToken = token || authService.getToken();

    if (!authToken) {
      navigate("/auth");
      return;
    }

    setConvId(id);

    currentConvIdRef.current = id;

    navigate(`/chat?id=${id}`, {
      replace: true,
    });


    const res = await fetch(
      `${API_URL}/api/messages/${id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await res.json();

    setMessages(
      (data.messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }))
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
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking || isStreaming) return;

    const userMsg = input.trim();

    setInput("");
    setError(null);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: userMsg,
      },
    ]);

    setIsThinking(true);

    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      let activeId = convId;

      if (!activeId) {
        const title =
          userMsg.length > 26
            ? userMsg.substring(0, 26) + "..."
            : userMsg;

        const createRes = await fetch(
          `${API_URL}/api/conversations/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
          }
        );

        const createData = await createRes.json();

        console.log("CREATE RESPONSE:", createData);

        if (!createRes.ok) {
          throw new Error(
            createData.error || "Failed to create conversation"
          );
        }

        activeId = createData.conversationId;

        if (!activeId) {
          throw new Error(
            "Backend returned no conversationId"
          );
        }

        currentConvIdRef.current = activeId;

        setConvId(activeId);

        navigate(`/chat?id=${activeId}`, {
          replace: true,
        });

        try {
          const historyRes = await fetch(
            `${API_URL}/api/conversations/list`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const historyData = await historyRes.json();

          console.log("HISTORY RESPONSE:", historyData);

          setHistory(historyData.conversations || []);
        } catch (err) {
          console.error("History refresh failed", err);
        }
      }

      const streamRes = await fetch(
        `${API_URL}/api/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId: activeId,
            message: userMsg,
          }),
        }
      );

      if (!streamRes.ok) {
        const text = await streamRes.text();

        console.error("STREAM ERROR:", text);

        throw new Error(
          `Stream failed (${streamRes.status})`
        );
      }

      setIsThinking(false);
      setIsStreaming(true);

      const reader = streamRes.body!.getReader();

      const decoder = new TextDecoder();

      let aiText = "";

      const msgId = Date.now().toString();

      setStreamingMessageId(msgId);

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: "assistant",
          content: "",
        },
      ]);

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split("\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const payload = line.replace("data:", "").trim();

          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);

            aiText += parsed.token || "";

            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId
                  ? {
                      ...m,
                      content: aiText,
                    }
                  : m
              )
            );
          } catch (e) {
            console.error("Stream parse error", e);
          }
        }
      }
    } catch (err: any) {
      console.error("HANDLE SEND ERROR:", err);

      setError(err.message || "Unknown error");
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
