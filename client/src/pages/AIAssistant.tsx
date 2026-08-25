import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../services/aiApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from '../components/ui/Toast';
import { Send, Sparkles, Bot, User, Brain } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `### **Hello! I am your LaserPay AI Co-Pilot.**

I can inspect your real-time transactions, active category limits, and recurring bills to answer specific cashflow audits. Try clicking a quick chip below or type a query!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickChips = [
    'How can I reduce my expenses?',
    'Where am I spending the most?',
    'Can I afford a ₹15,000 purchase?',
    'Analyze my spending.'
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(textToSend);
      if (res.success && res.data.reply) {
        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'bot',
          text: res.data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
      toast.error('AI request failed. Please check your credentials.');
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an error checking your request. Please ensure the Groq API key is valid.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown to html basic parser (renders headings, bold, lists, and code)
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Headings
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-3 mb-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-5 mb-2">{line.replace('# ', '')}</h2>;
      }
      
      // Bullets
      if (line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs leading-relaxed mt-1">
            {parseFormatting(line.trim().replace('* ', ''))}
          </li>
        );
      }
      if (line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs leading-relaxed mt-1">
            {parseFormatting(line.trim().replace('- ', ''))}
          </li>
        );
      }
      
      // Paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mt-1.5 min-h-[12px]">
          {parseFormatting(line)}
        </p>
      );
    });
  };

  const parseFormatting = (text: string) => {
    // Helper to replace **bold** and `code` in JSX
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-cyan-400">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-6">
      {/* Description */}
      <div>
        <h2 className="text-xl font-bold text-white">AI Financial Assistant</h2>
        <p className="text-xs text-slate-450 mt-1">Dialogue with our financial model to extract cash flow audit reports in natural language.</p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col bg-slate-900/50 border-slate-850 p-0 overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-4 max-w-3xl ${m.sender === 'user' ? 'ml-auto text-right flex-row-reverse' : 'text-left'}`}
            >
              {/* Avatar Icon */}
              <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                m.sender === 'user' 
                  ? 'bg-slate-855 border-slate-800 text-slate-350' 
                  : 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400'
              }`}>
                {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>

              {/* Message bubble */}
              <div className={`p-4 rounded-xl border max-w-xl ${
                m.sender === 'user' 
                  ? 'bg-slate-900 border-slate-800 text-slate-100 rounded-tr-none' 
                  : 'bg-slate-950/40 border-slate-850 text-slate-300 rounded-tl-none'
              }`}>
                {m.sender === 'user' ? (
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">{m.text}</p>
                ) : (
                  <div className="space-y-1">{renderMessageContent(m.text)}</div>
                )}
                <span className="text-[9px] text-slate-600 block mt-2">
                  {m.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-4 text-left">
              <span className="h-8 w-8 rounded-full flex items-center justify-center bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 shrink-0">
                <Brain className="h-4 w-4 animate-pulse" />
              </span>
              <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 text-slate-400 rounded-tl-none flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && !loading && (
          <div className="px-6 pb-2 pt-2 border-t border-slate-800/20 bg-slate-900/10 flex flex-wrap gap-2.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-cyan-400 border border-slate-850 rounded-full text-xs transition-colors font-medium"
              >
                <Sparkles className="h-3 w-3 text-cyan-500" />
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Panel */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="flex gap-3"
          >
            <div className="flex-1">
              <Input
                placeholder="Ask your assistant anything (e.g. Can I afford a new tablet?)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" loading={loading} className="px-5 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
export default AIAssistant;
