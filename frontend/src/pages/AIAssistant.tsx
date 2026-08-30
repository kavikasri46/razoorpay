import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../services/aiApi';
import { toast } from '../components/ui/Toast';
import { 
  Send, Sparkles, Bot, User, Brain, TrendingDown, 
  PieChart, ShieldAlert, Activity, RefreshCw, Copy, 
  Check, Zap, Lightbulb, ArrowUpRight
} from 'lucide-react';

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
      text: `### **Hello! I am your RazorPay AI Financial Co-Pilot.**

I have real-time access to your ledger records, active budget boundaries, and recurring subscriptions. I can generate instant cash flow audits, detect spending anomalies, or answer scenario questions like **"Can I afford a new tablet?"**

Choose a quick prompt below or ask me any question about your finances!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickChips = [
    { label: 'How can I reduce my expenses?', icon: TrendingDown, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { label: 'Where am I spending the most?', icon: PieChart, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Can I afford a ₹15,000 purchase?', icon: Zap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Analyze my spending & budgets', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Audit recurring subscriptions', icon: ShieldAlert, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(textToSend.trim());
      if (res.success && res.data.reply) {
        const botMsg: ChatMessage = {
          id: Date.now().toString() + '-bot',
          sender: 'bot',
          text: res.data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
      toast.error('AI assistant request failed. Please check your backend connection.');
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + '-err',
        sender: 'bot',
        text: '⚠️ **Unable to fetch audit response.** Please ensure your server connection and AI services are running smoothly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Analysis copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `### **Conversation reset.**\n\nI am ready for your next financial query. How can I assist your ledger analysis today?`,
        timestamp: new Date(),
      }
    ]);
  };

  // Convert markdown to clean, rich interactive HTML
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Headings
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-3 mb-2 flex items-center gap-2 text-blue-300">
            <Zap className="w-4 h-4 text-blue-400 shrink-0" />
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-extrabold text-white mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }
      
      // Numbered List Items (e.g. "1. Item name:")
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2.5 mt-2.5 mb-1 pl-1">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              {numMatch[1]}
            </span>
            <div className="text-xs text-slate-200 leading-relaxed flex-1">
              {parseFormatting(numMatch[2])}
            </div>
          </div>
        );
      }

      // Bullet List Items
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanBullet = line.trim().replace(/^[\*\-]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2.5 mt-1.5 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5 shadow-sm shadow-blue-400/50" />
            <div className="text-xs text-slate-300 leading-relaxed flex-1">
              {parseFormatting(cleanBullet)}
            </div>
          </div>
        );
      }
      
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed mt-1">
          {parseFormatting(line)}
        </p>
      );
    });
  };

  const parseFormatting = (text: string) => {
    // Parse bold, inline code, and monetary values
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|₹[\d,]+(?:\.\d+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-950/80 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-cyan-300 font-semibold mx-0.5">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Highlight Rupee currency amounts
      if (part.startsWith('₹')) {
        return (
          <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] mx-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-4 max-w-6xl mx-auto w-full">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                AI Financial Assistant
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300">
                  Llama-3 Audit Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time natural language cashflow audits, budget advisory, and expense optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-1.5 h-1.5 -ml-2.5 rounded-full bg-emerald-400" />
            Active Ledger Sync
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all shadow-sm"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area Card */}
      <div className="flex-1 flex flex-col bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Scrollable Messages container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 relative z-10 custom-scrollbar">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 sm:gap-4 max-w-4xl transition-all duration-300 ${
                m.sender === 'user' 
                  ? 'ml-auto text-right flex-row-reverse' 
                  : 'text-left'
              }`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform hover:scale-105 ${
                m.sender === 'user' 
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-400/40 text-white shadow-blue-500/20' 
                  : 'bg-gradient-to-tr from-slate-900 to-slate-800 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10'
              }`}>
                {m.sender === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`group relative p-4 sm:p-5 rounded-2xl border max-w-2xl shadow-lg transition-all duration-200 ${
                m.sender === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/50 text-white rounded-tr-none shadow-blue-600/20' 
                  : 'bg-slate-950/60 hover:bg-slate-950/80 border-slate-800 hover:border-slate-700/80 text-slate-200 rounded-tl-none backdrop-blur-md'
              }`}>
                {/* Header label for Bot */}
                {m.sender === 'bot' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
                      <Brain className="w-3.5 h-3.5" />
                      RazorPay AI Co-Pilot
                    </div>
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Content */}
                {m.sender === 'user' ? (
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-white">{m.text}</p>
                ) : (
                  <div className="space-y-1">{renderMessageContent(m.text)}</div>
                )}

                {/* Timestamp */}
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className={`text-[10px] ${m.sender === 'user' ? 'text-blue-200/80' : 'text-slate-500'}`}>
                    {m.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Waveform Indicator */}
          {loading && (
            <div className="flex gap-3 sm:gap-4 text-left animate-fadeIn">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center bg-slate-900 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-md">
                <Brain className="h-4 w-4 animate-spin text-cyan-400" style={{ animationDuration: '3s' }} />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none border border-slate-800 bg-slate-950/70 text-slate-300 shadow-md flex items-center gap-3 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce shadow-sm shadow-cyan-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce shadow-sm shadow-blue-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce shadow-sm shadow-indigo-400" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-semibold text-slate-400 tracking-wide">
                  Auditing financial transactions & limits...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips Carousel */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Quick Audits:
          </span>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {quickChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.label)}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 shrink-0 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm disabled:opacity-50 disabled:pointer-events-none hover:shadow-md ${chip.color} bg-slate-900/80 hover:bg-slate-850`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{chip.label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 ml-0.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input Dock */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl relative z-20">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="flex items-center gap-2.5 bg-slate-900 border border-slate-750 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-2xl p-1.5 px-3 transition-all duration-200 shadow-inner"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask your assistant anything (e.g., Can I afford a new tablet? Analyze my Swiggy expenses...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-0 py-2 px-1 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transform active:scale-95"
            >
              <span>Audit</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-slate-500">
            <span>Powered by Groq Llama-3 AI Engine</span>
            <span>Press Enter ↵ to send query</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
