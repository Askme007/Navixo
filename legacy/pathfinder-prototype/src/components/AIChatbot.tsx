import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Career Counselor. I can help you with career advice, job search strategies, resume tips, interview preparation, and career transitions. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateMockResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('resume') || lowerQuery.includes('cv')) {
      return "Great question about resumes! Here are some key tips:\n\n1. Keep it concise (1-2 pages)\n2. Use action verbs and quantify achievements\n3. Tailor it to each job posting\n4. Include relevant keywords from the job description\n5. Proofread carefully for errors\n\nWould you like specific advice for your industry?";
    } else if (lowerQuery.includes('interview')) {
      return "Interview preparation is crucial! Here's what I recommend:\n\n1. Research the company thoroughly\n2. Practice common interview questions\n3. Prepare STAR method examples\n4. Prepare thoughtful questions for the interviewer\n5. Dress appropriately and arrive early\n\nWhat type of interview are you preparing for?";
    } else if (lowerQuery.includes('career change') || lowerQuery.includes('transition')) {
      return "Career transitions can be challenging but rewarding! Consider:\n\n1. Identify transferable skills from your current role\n2. Research your target industry thoroughly\n3. Network with professionals in the field\n4. Consider additional training or certifications\n5. Start with informational interviews\n\nWhat field are you interested in transitioning to?";
    } else if (lowerQuery.includes('skill') || lowerQuery.includes('learn')) {
      return "Developing new skills is essential! I recommend:\n\n1. Identify in-demand skills in your field\n2. Use online learning platforms (Coursera, Udemy, LinkedIn Learning)\n3. Work on practical projects to apply what you learn\n4. Seek mentorship from experienced professionals\n5. Stay updated with industry trends\n\nWhat specific skills are you looking to develop?";
    } else {
      return "I'm here to help with your career development! I can provide guidance on:\n\n• Resume and cover letter writing\n• Interview preparation\n• Career transitions and planning\n• Skill development strategies\n• Job search techniques\n• Salary negotiation\n• Work-life balance\n\nWhat specific aspect of your career would you like to discuss?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>AI Career Chatbot</CardTitle>
        <CardDescription>
          Ask me anything about your career, and I'll provide personalized guidance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white ml-12'
                        : 'bg-gray-100 mr-12'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className={`text-xs mt-2 block ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-500">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg p-4 bg-gray-100 mr-12">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about your career, skills, job search, or interview tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
              rows={3}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}