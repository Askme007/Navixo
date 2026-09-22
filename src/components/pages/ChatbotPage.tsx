import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { NavixoLogo } from "../NavixoLogo";
import { toast } from "sonner";

import { ChatHistorySidebar } from "../chat/ChatHistorySidebar";
import { ChatAnalysisSidebar } from "../chat/ChatAnalysisSidebar";
import { ChatMessageList } from "../chat/ChatMessageList";
import { ChatPromptBar } from "../chat/ChatPromptBar";
import "../chat/ChatbotPage.css";

const DEFAULT_INIT_MESSAGE = {
  id: "init",
  role: "assistant",
  content:
    "Navixo Core Session initialized. Provide a parameter matrix, problem description, or a structural task dependency bottleneck to analyze execution paths.",
};

const getUserId = () => authService.getUser()?.id || "default";

const getCachedHistory = (userId: string): any[] => {
  try {
    const raw = localStorage.getItem(`navixo_chat_history_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCachedHistory = (userId: string, history: any[]) => {
  try {
    localStorage.setItem(`navixo_chat_history_${userId}`, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save cached history", e);
  }
};

const getCachedMessages = (convId: string): any[] | null => {
  try {
    const raw = localStorage.getItem(`navixo_chat_msgs_${convId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveCachedMessages = (convId: string, messages: any[]) => {
  try {
    localStorage.setItem(`navixo_chat_msgs_${convId}`, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save cached messages", e);
  }
};

const removeCachedMessages = (convId: string) => {
  try {
    localStorage.removeItem(`navixo_chat_msgs_${convId}`);
  } catch {}
};


export function ChatbotPage({
  userName,
  onBack,
  initialMessage,
  fromRoadmap,
  onClearInitialMessage,
}: {
  userName: string;
  onBack: () => void;
  initialMessage?: string;
  fromRoadmap?: boolean;
  onClearInitialMessage?: () => void;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = getUserId();
  const urlId = searchParams.get("id");

  // If a specific conversation ID is in the URL, load it; otherwise start clean new session
  const initialConvId = urlId || null;

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<any[]>(() => getCachedHistory(userId));
  const [convId, setConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<any[]>(() => {
    if (initialConvId) {
      const cached = getCachedMessages(initialConvId);
      if (cached && cached.length > 0) {
        return cached;
      }
    }
    return [DEFAULT_INIT_MESSAGE];
  });

  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const currentConvIdRef = useRef<string | null>(initialConvId);

  // Populate prompt from roadmap and reset initialMessage state
  useEffect(() => {
    if (initialMessage && fromRoadmap) {
      setInput(initialMessage);
      currentConvIdRef.current = null;
      setConvId(null);
      setMessages([DEFAULT_INIT_MESSAGE]);
      if (onClearInitialMessage) {
        onClearInitialMessage();
      }
    }
  }, [initialMessage, fromRoadmap, onClearInitialMessage]);

  useEffect(() => {
    const init = async () => {
      const token = authService.getToken();

      if (!token) {
        navigate("/auth");
        return;
      }

      const activeUserId = getUserId();

      // Silent background revalidation of conversation history
      try {
        const res = await fetch(`${API_URL}/api/conversations/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const fetchedHistory = data.conversations || [];
          setHistory(fetchedHistory);
          saveCachedHistory(activeUserId, fetchedHistory);
        }
      } catch (err) {
        console.error("Failed to revalidate conversations list", err);
      }

      const currentUrlId = searchParams.get("id");

      if (currentUrlId) {
        if (currentUrlId !== currentConvIdRef.current || messages.length <= 1) {
          currentConvIdRef.current = currentUrlId;
          setConvId(currentUrlId);
          loadChat(currentUrlId, token);
        }
      } else {
        // No ID in URL (/chat) -> cleanly initialize new session, do not redirect
        currentConvIdRef.current = null;
        setConvId(null);
        setMessages([DEFAULT_INIT_MESSAGE]);
      }
    };

    init();
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, error]);

  const loadChat = async (id: string, token?: string) => {
    const authToken = token || authService.getToken();

    if (!authToken) {
      navigate("/auth");
      return;
    }

    const activeUserId = getUserId();
    setConvId(id);
    currentConvIdRef.current = id;

    if (searchParams.get("id") !== id) {
      navigate(`/chat?id=${id}`, {
        replace: true,
      });
    }

    // 0ms instant display from local cache if available
    const cached = getCachedMessages(id);
    if (cached && cached.length > 0) {
      setMessages(cached);
    }

    try {
      const res = await fetch(`${API_URL}/api/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const formatted = (data.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }));

        const finalMsgs = formatted.length > 0 ? formatted : [DEFAULT_INIT_MESSAGE];
        setMessages(finalMsgs);
        saveCachedMessages(id, finalMsgs);
      }
    } catch (err) {
      console.error("Failed to load chat messages", err);
    }
  };

  const handleNewChat = () => {
    currentConvIdRef.current = null;
    setConvId(null);
    setMessages([DEFAULT_INIT_MESSAGE]);
    navigate("/chat", { replace: true });
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const activeUserId = getUserId();
    const token = authService.getToken();

    // Optimistic UI updates
    setHistory((prev) => prev.filter((h) => h.id !== id));
    const currentCached = getCachedHistory(activeUserId);
    const updatedHistory = currentCached.filter((h: any) => h.id !== id);
    saveCachedHistory(activeUserId, updatedHistory);
    removeCachedMessages(id);

    toast.success("Execution session deleted");

    // If deleting the currently selected session
    if (convId === id || currentConvIdRef.current === id) {
      if (updatedHistory.length > 0) {
        loadChat(updatedHistory[0].id, token || undefined);
      } else {
        handleNewChat();
      }
    }

    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/conversations/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.error("Failed to delete conversation on server:", errData);
          toast.error("Failed to delete session on server");
        }
      } catch (err) {
        console.error("Network error deleting conversation:", err);
        toast.error("Network error deleting session");
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking || isStreaming) return;

    const userMsg = input.trim();
    const activeUserId = getUserId();

    setInput("");
    setError(null);

    setMessages((prev) => {
      const next = [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: userMsg,
        },
      ];
      if (convId) saveCachedMessages(convId, next);
      return next;
    });

    setIsThinking(true);

    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      let activeId = convId;

      if (!activeId) {
        const title =
          userMsg.length > 26 ? userMsg.substring(0, 26) + "..." : userMsg;

        const createRes = await fetch(`${API_URL}/api/conversations/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title }),
        });

        const createData = await createRes.json();

        if (!createRes.ok) {
          throw new Error(createData.error || "Failed to create conversation");
        }

        activeId = createData.conversationId;

        if (!activeId) {
          throw new Error("Backend returned no conversationId");
        }

        currentConvIdRef.current = activeId;
        setConvId(activeId);

        navigate(`/chat?id=${activeId}`, {
          replace: true,
        });

        try {
          const historyRes = await fetch(`${API_URL}/api/conversations/list`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const historyData = await historyRes.json();
          const fetchedHistory = historyData.conversations || [];
          setHistory(fetchedHistory);
          saveCachedHistory(activeUserId, fetchedHistory);
        } catch (err) {
          console.error("History refresh failed", err);
        }
      }

      const streamRes = await fetch(`${API_URL}/api/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeId,
          message: userMsg,
        }),
      });

      if (!streamRes.ok) {
        const text = await streamRes.text();
        console.error("STREAM ERROR:", text);
        throw new Error(`Stream failed (${streamRes.status})`);
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
                  : m,
              ),
            );
          } catch (e) {
            console.error("Stream parse error", e);
          }
        }
      }

      setMessages((prev) => {
        if (activeId) {
          saveCachedMessages(activeId, prev);
        }
        return prev;
      });
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
    <div className="fixed inset-0 h-screen w-screen bg-[#05030a] text-white flex flex-col overflow-hidden font-sans">
      {/* COHERENT NAVIXO SYSTEM HEADER */}
      <div className="w-full border-b border-purple-500/10 bg-[#06040d]/90 backdrop-blur-xl shrink-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <ChatHistorySidebar
              history={history}
              currentId={convId}
              onSelect={loadChat}
              onNewChat={handleNewChat}
              onDelete={handleDeleteChat}
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
            <ChatAnalysisSidebar onSelectPrompt={(prompt) => setInput(prompt)} />
            <span className="hidden max-w-[120px] truncate text-xs text-purple-300 md:block ml-1 border-l border-purple-500/20 pl-3 font-medium">
              {userName}
            </span>
          </div>
        </div>
      </div>

      {/* CORE FRAME LAYOUT AREA WITH FLEX DEFENSE */}
      {/* OPTIMIZATION: Added min-h-0 to explicitly prevent child content from extending panel height */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden relative">
        {/* COMPILATION LOG / CHAT CONTENT CONTAINER */}
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          {/* OPTIMIZATION: Forced strict scrolling boundaries directly onto this div wrapper */}
          <div
            ref={scrollRef}
            className="flex-1 w-full custom-scrollbar bg-[#05030a] pb-4"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* OPTIMIZATION: Wrapped inner log list with a custom structure to enforce scaling boundaries */}
            <div className="w-full h-auto flex-1">
              <ChatMessageList
                messages={messages}
                isThinking={isThinking}
                isStreaming={isStreaming}
                streamingMessageId={streamingMessageId}
                error={error}
              />
            </div>
          </div>

          {/* SECURE SUB-SYSTEM INPUT ANCHOR */}
          <div className="shrink-0 bg-[#05030a] border-t border-purple-500/10 w-full flex justify-center px-4 py-4">
            <ChatPromptBar
              input={input}
              setInput={setInput}
              onSend={handleSend}
              disabled={isThinking || isStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
