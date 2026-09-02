import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../services/aiApi';
import { toast } from '../components/ui/Toast';
import { 
  Send, Sparkles, Bot, User, BrainCircuit, TrendingDown, 
  PieChart, ShieldAlert, Activity, RefreshCw, Copy, 
  Check, Zap, Lightbulb, ArrowUpRight, Loader2
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
      text: `### **Welcome! I am your RazorPay AI Financial Co-Pilot.**

I have real-time secure access to your ledger records, active budget boundaries, and recurring subscriptions. I can generate instant cash flow audits, detect spending anomalies, or answer scenario questions like **"Can I afford a new tablet?"**

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
    { label: 'How can I reduce my expenses?', icon: TrendingDown, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { label: 'Where am I spending the most?', icon: PieChart, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { label: 'Can I afford a ₹15,000 purchase?', icon: Zap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { label: 'Analyze my spending & budgets', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Audit recurring subscriptions', icon: ShieldAlert, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
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
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'AI assistant request failed. Please check your backend connection and Groq API key.';
      toast.error(errorMessage);
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + '-err',
        sender: 'bot',
        text: `⚠️ **Audit Failed:** ${errorMessage}`,
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

  const parseFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|₹[\d,]+(?:\.\d+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold tracking-wide">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-900/80 border border-slate-700 px-1.5 py-0.5 rounded-md font-mono text-xs text-cyan-300 font-semibold mx-0.5 shadow-sm">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('₹')) {
        return (
          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold text-[13px] mx-0.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-[15px] font-bold text-white mt-4 mb-2 flex items-center gap-2 text-cyan-300 border-b border-cyan-500/20 pb-1 w-fit">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2 text-blue-300">
            <Zap className="w-4 h-4 text-blue-400 shrink-0" />
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-black tracking-tight text-white mt-5 mb-3">{line.replace('# ', '')}</h2>;
      }
      
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-3 mt-3 mb-1.5 pl-1 group">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
              {numMatch[1]}
            </span>
            <div className="text-[14px] text-slate-300 leading-relaxed flex-1">
              {parseFormatting(numMatch[2])}
            </div>
          </div>
        );
      }

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanBullet = line.trim().replace(/^[\*\-]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-3 mt-2 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <div className="text-[14px] text-slate-300 leading-relaxed flex-1">
              {parseFormatting(cleanBullet)}
            </div>
          </div>
        );
      }
      
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-[14px] text-slate-300 leading-relaxed mt-1.5 font-medium">
          {parseFormatting(line)}
        </p>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Sleek Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-30 rounded-full animate-pulse" />
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              RazorPay AI Co-Pilot
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 shadow-inner">
                Groq Llama-3 Powered
              </span>
            </h2>
            <p className="text-[13px] text-slate-400 mt-1 font-medium">
              Elite real-time cashflow audits, budget advisory, and intelligent expense optimization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-bold shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Active Ledger Sync
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[13px] font-bold transition-all shadow-md group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-[#0b1120]/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-900/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900/5 to-transparent pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 relative z-10 custom-scrollbar">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-4 max-w-[85%] transition-all duration-500 animate-in slide-in-from-bottom-2 fade-in-10 ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'text-left'
              }`}
            >
              <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-xl ${
                m.sender === 'user' 
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-400/50 text-white shadow-indigo-500/20' 
                  : 'bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500/50 text-cyan-400 shadow-cyan-500/20'
              }`}>
                {m.sender === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 animate-pulse" />}
              </div>

              <div className={`group relative p-5 sm:p-6 rounded-3xl border max-w-full shadow-2xl transition-all duration-300 ${
                m.sender === 'user' 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500/30 text-white rounded-tr-sm shadow-indigo-900/30' 
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-200 rounded-tl-sm backdrop-blur-xl shadow-black/40 hover:border-slate-600'
              }`}>
                {m.sender === 'bot' && (
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-cyan-400/80">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      AI Auditor
                    </div>
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                {m.sender === 'user' ? (
                  <p className="text-[15px] font-medium leading-relaxed">{m.text}</p>
                ) : (
                  <div className="space-y-1.5">{renderMessageContent(m.text)}</div>
                )}
                <div className="flex items-center justify-end gap-1 mt-3">
                  <span className={`text-[11px] font-medium ${m.sender === 'user' ? 'text-indigo-200/60' : 'text-slate-500'}`}>
                    {m.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 text-left animate-in fade-in zoom-in-95 duration-300">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center bg-slate-900 border-2 border-cyan-500/50 text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="p-5 rounded-3xl rounded-tl-sm border border-slate-700/80 bg-slate-900/90 text-slate-300 shadow-2xl flex items-center gap-4 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-wide">
                  Auditing ledger & running Groq AI models...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="relative z-20 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800/80 p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <span className="text-[12px] font-black uppercase tracking-widest text-slate-400 shrink-0 flex items-center gap-1.5 mr-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Quick Prompts
            </span>
            {quickChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.label)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all duration-300 shrink-0 hover:-translate-y-1 shadow-sm hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none ${chip.color} bg-slate-900 hover:brightness-125`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{chip.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50 ml-1" />
                </button>
              );
            })}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="flex items-end gap-3 bg-slate-900/50 border border-slate-700/80 focus-within:border-cyan-500/60 focus-within:ring-4 focus-within:ring-cyan-500/10 rounded-3xl p-2 transition-all duration-300 shadow-inner"
          >
            <div className="p-3 bg-slate-800/50 rounded-2xl shrink-0 self-center ml-1">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <textarea
              ref={inputRef as any}
              placeholder="Ask your assistant anything (e.g., Can I afford a new tablet? Analyze my Swiggy expenses...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 text-[15px] font-medium focus:outline-none focus:ring-0 py-3 px-2 resize-none max-h-32 custom-scrollbar self-center"
              style={{ minHeight: '48px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:scale-105 active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="flex items-center justify-between px-3 pt-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              Powered by Groq 
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" /> 
              Llama-3 Engine
            </span>
            <span>Press Enter ↵ to audit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
