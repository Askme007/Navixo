import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Menu, Plus, Send, BarChart3, ArrowLeft, LogOut, MessageSquare, TrendingUp, Target, Brain, Zap, ArrowDown, Camera, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisPanel } from '../AnalysisPanel';
import { PaiLogo } from '../PaiLogo';
import { MarkdownRenderer } from '../Markdown/MarkdownRenderer';

interface ChatbotPageProps {
  userName: string;
  onLogout: () => void;
  onBack: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToRoadmap: () => void;
  onNavigateToSkillGap: () => void;
  initialMessage?: string;
  fromRoadmap?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface Insight {
  type: 'skill' | 'gap' | 'strength' | 'recommendation';
  title: string;
  description: string;
  value?: number;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document';
  preview?: string; // For image thumbnails
}

export function ChatbotPage({ userName, onLogout, onBack, onNavigateToDashboard, onNavigateToRoadmap, onNavigateToSkillGap, initialMessage, fromRoadmap }: ChatbotPageProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      role: 'assistant',
      content: "Hi! I'm your AI Mentor. I can help you with career planning, skill development, interview prep, and personalized guidance. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hasAnalysis, setHasAnalysis] = useState(false); // Track if analysis exists
  
  // Attachment functionality states
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const attachmentPopupRef = useRef<HTMLDivElement>(null);

  // Pause auto-scroll when analysis panel opens
  useEffect(() => {
    if (insightsOpen) {
      setShouldAutoScroll(false);
    }
  }, [insightsOpen]);

  // Close panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && insightsOpen) {
        setInsightsOpen(false);
      }
      if (e.key === 'Escape' && historyOpen) {
        setHistoryOpen(false);
      }
      if (e.key === 'Escape' && showAttachmentPopup) {
        setShowAttachmentPopup(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [insightsOpen, historyOpen, showAttachmentPopup]);

  // Close attachment popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachmentPopup && attachmentPopupRef.current && !attachmentPopupRef.current.contains(event.target as Node)) {
        setShowAttachmentPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachmentPopup]);

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Handle file upload here (mock implementation)
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
    
    // Add mock file preview (first file only for demo)
    if (files.length > 0) {
      const file = files[0];
      const isImage = file.type.startsWith('image/');
      const mockFile: AttachedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: isImage ? 'image' : 'document',
      };
      setAttachedFiles(prev => [...prev, mockFile]);
    }
  };

  const handleAttachmentClick = (type: 'camera' | 'image' | 'document') => {
    console.log(`${type} selected`);
    setShowAttachmentPopup(false);
    
    // Add mock file preview
    const mockFile: AttachedFile = {
      id: Date.now().toString(),
      name: type === 'image' ? 'career-goals.png' : type === 'camera' ? 'photo.jpg' : 'resume.pdf',
      size: type === 'document' ? '245.3 KB' : '1.2 MB',
      type: type === 'document' ? 'document' : 'image',
    };
    setAttachedFiles(prev => [...prev, mockFile]);
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Mock chat history
  const [chatHistory] = useState<ChatHistory[]>([]);

  // Mock insights
  const [insights] = useState<Insight[]>([
    { type: 'strength', title: 'Technical Skills', description: 'Strong foundation in programming', value: 85 },
    { type: 'gap', title: 'Communication', description: 'Could improve presentation skills', value: 60 },
    { type: 'skill', title: 'Data Analysis', description: 'Python, SQL, Excel proficiency', value: 75 },
    { type: 'recommendation', title: 'Next Step', description: 'Consider learning cloud platforms (AWS/Azure)' },
  ]);

  // Scroll reset on mount - always load at top
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = 0;
    }
  }, []);

  // Handle initial message from roadmap
  useEffect(() => {
    if (initialMessage && fromRoadmap) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: initialMessage,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);
        setUserHasScrolled(false);
        setIsAutoScroll(true);

        // Simulate AI thinking
        setTimeout(() => {
          setIsThinking(false);
          
          const messageId = (Date.now() + 1).toString();
          setStreamingMessageId(messageId);
          setIsStreaming(true);

          // Specific response for roadmap context
          const aiResponse: Message = {
            id: messageId,
            role: 'assistant',
            content: "Thanks for sharing your roadmap. How can I help you refine it?",
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, aiResponse]);
          
          // End streaming after delay
          setTimeout(() => {
            setIsStreaming(false);
            setStreamingMessageId(null);
          }, 1500);
        }, 800);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [initialMessage, fromRoadmap]);

  // Handle scroll detection
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    
    // User manually scrolled
    if (!userHasScrolled) {
      setUserHasScrolled(true);
    }
    
    if (isAtBottom) {
      setIsAutoScroll(true);
      setShowScrollButton(false);
    } else {
      // User scrolled away from bottom - disable auto-scroll
      setIsAutoScroll(false);
      setShowScrollButton(true);
    }
  };

  // Auto-scroll to bottom during streaming (only if user hasn't scrolled)
  useEffect(() => {
    if (isAutoScroll && scrollViewportRef.current && (isStreaming || isThinking)) {
      const scrollToEnd = () => {
        if (scrollViewportRef.current) {
          scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
      };
      scrollToEnd();
      // Continue scrolling during streaming
      const interval = setInterval(scrollToEnd, 100);
      return () => clearInterval(interval);
    }
  }, [messages, isAutoScroll, isStreaming, isThinking]);

  // Scroll to bottom on new message (only if auto-scroll enabled)
  useEffect(() => {
    if (isAutoScroll && scrollViewportRef.current && !userHasScrolled) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, isAutoScroll, userHasScrolled]);

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    setIsAutoScroll(true);
    setShowScrollButton(false);
    setUserHasScrolled(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = '56px';
    }
    
    // Reset scroll state for new message
    setUserHasScrolled(false);
    setIsAutoScroll(true);

    // Simulate AI thinking
    setTimeout(() => {
      setIsThinking(false);
      
      const messageId = (Date.now() + 1).toString();
      setStreamingMessageId(messageId);
      setIsStreaming(true);

      // Simulate AI response
      const aiResponse: Message = {
        id: messageId,
        role: 'assistant',
        content: generateMockResponse(userMessage.content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // End streaming after delay
      setTimeout(() => {
        setIsStreaming(false);
        setStreamingMessageId(null);
      }, 1500);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea up to 7 lines (~178px max)
    const textarea = e.target;
    textarea.style.height = '56px'; // Reset to min height
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 56), 178); // Min 56px, Max 178px (7 lines)
    textarea.style.height = `${newHeight}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateMockResponse = (userInput: string): string => {
    const responses = [
      "Great question! Let me provide you with a comprehensive answer.\n\n## Key Points:\n\n1. **Understanding the fundamentals** is crucial for success\n2. **Practical experience** will accelerate your learning\n3. **Networking** opens doors to opportunities\n\n### Next Steps:\n\n- Start with online courses (Coursera, Udemy)\n- Build a portfolio project\n- Join relevant communities\n- Attend industry meetups\n\nWould you like me to elaborate on any specific area?",
      "I can definitely help you with that! Here's my recommendation:\n\n## Career Path Analysis\n\n**Current Position:**\nYou're at an exciting stage where multiple paths are available.\n\n**Recommended Direction:**\n\n- Focus on **specialization** in your area of interest\n- Develop **transferable skills** (communication, leadership)\n- Build **industry connections** early\n\n> 💡 **Pro Tip:** The most successful professionals combine technical expertise with soft skills.\n\nWhat specific skills would you like to develop first?",
      "Excellent choice! Let me break this down for you:\n\n## Timeline Overview\n\n**Phase 1: Foundation (2-3 months)**\n- Core concepts and basics\n- Fundamental principles\n- Practice exercises\n\n**Phase 2: Practice (3-4 months)**\n- Real-world projects\n- Building experience\n- Collaborative work\n\n**Phase 3: Portfolio (1-2 months)**\n- Showcase your work\n- Polish projects\n- Prepare for opportunities\n\n### Learning Resources:\n\n1. **Free Resources**\n   - FreeCodeCamp\n   - YouTube tutorials\n   - Documentation sites\n\n2. **Paid Courses** (Optional)\n   - Specialized certifications\n   - Advanced topics\n\nShall we dive deeper into any phase?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-4" style={{ lineHeight: '1.6' }}>
        {lines.map((line, index) => {
          // H2 Headers
          if (line.startsWith('## ')) {
            return (
              <h2 key={index} className="text-xl text-white font-semibold mt-6 mb-3 first:mt-0">
                {line.replace('## ', '')}
              </h2>
            );
          }
          
          // H3 Headers
          if (line.startsWith('### ')) {
            return (
              <h3 key={index} className="text-lg text-white font-medium mt-5 mb-2">
                {line.replace('### ', '')}
              </h3>
            );
          }
          
          // H1 Headers
          if (line.startsWith('# ')) {
            return (
              <h1 key={index} className="text-2xl text-white font-bold mt-6 mb-4 first:mt-0">
                {line.replace('# ', '')}
              </h1>
            );
          }
          
          // Bullet points
          if (line.startsWith('- ')) {
            const content = line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            return (
              <div key={index} className="flex gap-3 ml-2">
                <span className="text-blue-400 mt-1.5 text-sm">●</span>
                <span className="text-[#F5F5F5] flex-1 font-medium" style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            );
          }
          
          // Numbered lists
          if (/^\d+\./.test(line)) {
            const content = line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            return (
              <div key={index} className="flex gap-3 ml-2">
                <span className="text-blue-400">{line.match(/^\d+/)?.[0]}.</span>
                <span className="text-[#F5F5F5] flex-1 font-medium" style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            );
          }
          
          // Blockquote
          if (line.startsWith('> ')) {
            return (
              <div key={index} className="border-l-2 border-blue-500 pl-4 py-2 my-3 bg-blue-500/5">
                <p className="text-[#F5F5F5] italic font-medium" style={{ lineHeight: '1.6' }}>{line.replace('> ', '')}</p>
              </div>
            );
          }
          
          // Bold text paragraphs
          if (line.includes('**')) {
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            return <p key={index} className="text-[#F5F5F5] font-medium" style={{ lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: formatted }} />;
          }
          
          // Regular text
          if (line.trim()) {
            return <p key={index} className="text-[#F5F5F5] font-medium" style={{ lineHeight: '1.6' }}>{line}</p>;
          }
          
          // Empty line for spacing
          return <div key={index} className="h-2" />;
        })}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E] overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-800/50 bg-[#1E1E1E] flex-shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          {/* History Sidebar Toggle */}
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700/30 transition-colors">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-full sm:w-[340px] md:w-[360px] bg-[#1A1A1A] border-r border-[#2E2E2E] p-0 overflow-hidden [&>button[data-slot='sheet-close']]:hidden"
              style={{
                animation: 'slideInFromLeft 350ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Header with π Logo */}
              <SheetHeader className="px-5 py-5 border-b border-[#2B2B2B] bg-[#1E1E1E]">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-3 text-white">
                    <PaiLogo className="w-5 h-5 text-white" size={20} />
                    <span>History</span>
                  </SheetTitle>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                    aria-label="Close history"
                  >
                    <span className="text-xl leading-none">✕</span>
                  </button>
                </div>
                <SheetDescription className="sr-only">
                  View and manage your previous conversations with PAI
                </SheetDescription>
              </SheetHeader>
              
              {/* New Chat Button */}
              <div className="px-4 pt-4">
                <Button 
                  className="w-full bg-[#2A2A2A] hover:bg-[#323232] text-white border border-[#3A3A3A] transition-colors rounded-lg h-11"
                  onClick={() => {
                    // Navigate to new chat
                    setMessages([{
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: "Hi! I'm your AI Mentor. I can help you with career planning, skill development, interview prep, and personalized guidance. What would you like to work on today?",
                      timestamp: new Date()
                    }]);
                    setHistoryOpen(false);
                  }}
                >
                  <PaiLogo className="w-4 h-4 mr-2" size={16} />
                  New Chat
                </Button>
              </div>
              
              {/* Empty State - No Chat History */}
              {chatHistory.length === 0 ? (
                <div className="flex-1 flex items-center justify-center px-6 py-24">
                  <div className="text-center space-y-4 max-w-xs">
                    {/* Icon */}
                    <div className="flex justify-center mb-2">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white text-lg" style={{ fontWeight: 600 }}>
                      No Chats Yet
                    </h3>
                    
                    {/* Subtext */}
                    <p className="text-[#BFBFBF] text-sm leading-relaxed">
                      Your conversations with your AI Mentor will appear here.
                    </p>
                    
                    {/* CTA Button */}
                    <Button
                      className="w-full mt-6 bg-[#2A2A2A] hover:bg-[#323232] text-white border border-[#3A3A3A] transition-colors rounded-lg h-11"
                      onClick={() => {
                        setMessages([{
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: "Hi! I'm your AI Mentor. I can help you with career planning, skill development, interview prep, and personalized guidance. What would you like to work on today?",
                          timestamp: new Date()
                        }]);
                        setHistoryOpen(false);
                      }}
                    >
                      Start a New Chat
                    </Button>
                  </div>
                </div>
              ) : (
                /* History Items List */
                <ScrollArea className="h-[calc(100vh-180px)]">
                  <div className="px-4 py-4 space-y-3">
                    {chatHistory.map((chat) => {
                      const timeDiff = Date.now() - chat.timestamp.getTime();
                      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                      const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
                      
                      return (
                        <button
                          key={chat.id}
                          onClick={() => {
                            // Navigate to that chat
                            console.log('Opening chat:', chat.id);
                            setHistoryOpen(false);
                          }}
                          className="w-full text-left p-3.5 rounded-xl bg-[#262626] hover:bg-[#2A2A2A] border border-transparent hover:border-[#3A3A3A] transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white truncate">
                                {chat.title}
                              </p>
                              <p className="text-[#BFBFBF] text-sm truncate mt-1">
                                {chat.lastMessage}
                              </p>
                              <p className="text-[#808080] text-xs mt-1.5">
                                {timeLabel}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </SheetContent>
          </Sheet>

          <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white hover:bg-gray-700/30 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800/40 border border-gray-700/30 rounded-lg">
            <PaiLogo className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">PAI</span>
          </div>
          <span className="text-sm text-gray-400 hidden md:inline">{userName}</span>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-400 hover:text-white hover:bg-gray-700/30 transition-colors">
            <LogOut className="w-4 h-4" />
          </Button>

          {/* Insights Sidebar Toggle */}
          <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700/30 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 md:w-[450px] bg-[#1A1A1A] border-l border-[#3A3A3A] p-0 [&>button[data-slot='sheet-close']]:hidden">
              <SheetHeader className="px-6 py-5 border-b border-[#3A3A3A] bg-[#1E1E1E]">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-white flex items-center gap-3">
                    <PaiLogo className="w-5 h-5 text-white" size={20} />
                    <span>PAI Analysis</span>
                  </SheetTitle>
                  <button
                    onClick={() => setInsightsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                    aria-label="Close analysis"
                  >
                    <span className="text-2xl leading-none">✕</span>
                  </button>
                </div>
                <SheetDescription className="sr-only">
                  Student performance analysis, assessments, skill tracking, and personalized recommendations
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="p-6">
                  <AnalysisPanel
                    onRefresh={() => console.log('Refresh analysis')}
                    onStartAssessment={() => console.log('Start new assessment')}
                    onViewHistory={() => console.log('View history')}
                  />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Chat Area */}
      <div 
        className="flex-1 overflow-hidden flex flex-col items-center relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            >
              <div className="border-2 border-dashed border-white/50 rounded-2xl p-12 text-center">
                <p className="text-white text-xl mb-2">Drop files to upload</p>
                <p className="text-white/70">Images • Documents • PDFs</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Container */}
        <div 
          className="flex-1 w-full overflow-y-auto custom-scrollbar"
          ref={scrollViewportRef}
          onScroll={handleScroll}
        >
          {/* Empty State - Show only when no user messages */}
          {messages.length === 1 && messages[0].role === 'assistant' && (
            <div className="h-full flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center max-w-2xl"
              >
                {/* Large π Symbol */}
                <div className="mb-8 flex justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-blue-400/40 flex items-center justify-center bg-blue-500/5">
                    <PaiLogo className="w-16 h-16 text-white" size={64} style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }} />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl text-white mb-4" style={{ fontWeight: 600 }}>
                  Welcome to PAI — Your Personal AI Mentor
                </h1>

                {/* Subtext */}
                <p className="text-[#BFBFBF] leading-relaxed max-w-xl mx-auto">
                  PAI helps you with career guidance, personalized roadmaps, skill analysis, and deep learning insights.<br />
                  Ask anything to get started.
                </p>
              </motion.div>
            </div>
          )}

          {/* Chat Messages - Show when user has sent messages */}
          {(messages.length > 1 || messages[0].role === 'user') && (
            <div className="max-w-[850px] mx-auto px-4 py-8 space-y-3">
              {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const shouldAddLargeGap = prevMessage?.role === 'user' && message.role === 'assistant';
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                    style={{ marginTop: shouldAddLargeGap ? '20px' : undefined }}
                  >
                    {message.role === 'assistant' ? (
                      <div className="w-full">
                        <div className={`${
                          isStreaming && streamingMessageId === message.id ? 'streaming-message' : ''
                        }`}>
                          <MarkdownRenderer
                            content={message.content}
                            streaming={isStreaming && streamingMessageId === message.id}
                            messageId={message.id}
                            theme="dark"
                            onCopy={(text) => {
                              console.log('Copied code:', text.substring(0, 50) + '...');
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[75%] md:max-w-[70%]">
                        <div className="bg-[#343541] text-gray-100 rounded-2xl px-5 py-3.5 border border-gray-700/20">
                          <p className="text-[#F5F5F5] font-medium" style={{ lineHeight: '1.6' }}>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Thinking Indicator */}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm text-gray-400">PAI is thinking</span>
                    <div className="flex gap-1">
                      <motion.div
                        key="dot-1"
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        key="dot-2"
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        key="dot-3"
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spacer for input area */}
              <div className="h-20" />
            </div>
          )}
        </div>

        {/* Floating Down Arrow Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
            >
              <button
                onClick={scrollToBottom}
                className="w-10 h-10 rounded-full bg-[#2A2A2A] border border-gray-700/30 flex items-center justify-center hover:bg-[#323232] transition-colors shadow-sm"
                aria-label="Scroll to bottom"
              >
                <ArrowDown className="w-4 h-4 text-blue-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 pb-6 pt-2 px-4 relative z-10">
        <div className="max-w-[750px] mx-auto">
          {/* File Preview Bubbles */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="mb-2 flex flex-wrap gap-2"
              >
                {attachedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3 bg-[#262626] border border-[#2E2E2E] rounded-xl px-3 py-2.5"
                  >
                    {/* File Icon/Thumbnail */}
                    <div className="flex-shrink-0">
                      {file.type === 'image' ? (
                        <div className="w-12 h-12 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{file.size}</p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeAttachedFile(file.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-[#3A3A3A] flex items-center justify-center transition-colors"
                      aria-label="Remove file"
                    >
                      <span className="text-white text-sm">✕</span>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative bg-[#36363A] border border-gray-700/30 rounded-2xl focus-within:border-blue-600/50 transition-colors shadow-sm">
            {/* Attachment Button */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10" ref={attachmentPopupRef}>
              <button
                onClick={() => setShowAttachmentPopup(!showAttachmentPopup)}
                className="w-6 h-6 rounded-full bg-[#2C2C2C] hover:bg-[#353535] flex items-center justify-center transition-colors"
                aria-label="Attach file"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
              
              {/* Attachment Popup */}
              <AnimatePresence>
                {showAttachmentPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-[#1F1F1F] border border-[#2E2E2E] rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => handleAttachmentClick('camera')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">Camera</span>
                    </button>
                    <button
                      onClick={() => handleAttachmentClick('image')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                    >
                      <ImageIcon className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">Image</span>
                    </button>
                    <button
                      onClick={() => handleAttachmentClick('document')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">Document</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask π"
              className="w-full bg-transparent border-0 pl-12 pr-16 py-4 text-white placeholder:text-gray-400 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[56px] max-h-[80px] overflow-y-auto custom-scrollbar-input"
              rows={1}
              style={{ lineHeight: '1.5' }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-black rounded-full w-10 h-10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-3">
            PAI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>

      {/* Streaming Effect CSS */}
      <style>{`
        .streaming-message {
          position: relative;
        }
        
        .streaming-message::after {
          content: '';
          position: absolute;
          bottom: -30px;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to top, rgba(30, 30, 30, 0.15), transparent);
          pointer-events: none;
          animation: fadeReveal 0.5s ease-in-out;
        }
        
        @keyframes fadeReveal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Smooth scroll behavior with ease-out */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
          scroll-behavior: smooth;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        
        /* Custom Scrollbar for textarea with smooth transitions */
        .custom-scrollbar-input {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.2) transparent;
          transition: height 0.12s ease-out;
        }
        
        .custom-scrollbar-input::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar-input::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar-input::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar-input::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
        
        /* Sidebar Scrollbar */
        [data-radix-scroll-area-viewport] {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
        }
        
        [data-radix-scroll-area-viewport]::-webkit-scrollbar {
          width: 8px;
        }
        
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-track {
          background: transparent;
        }
        
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        
        /* Slide-in animation for history drawer */
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}