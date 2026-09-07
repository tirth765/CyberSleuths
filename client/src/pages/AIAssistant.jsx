import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Trash2, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIStore } from '../stores/aiStore';
import { useCaseStore } from '../stores/caseStore';
import { useLocation } from 'react-router-dom';

const QUICK_PROMPTS = [
  'Why is this threat critical?',
  'Find related attacks',
  'Summarize the investigation',
  'What IOCs should I hunt?',
  'Generate an executive summary',
  'What should I do next?',
];

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [caseId, setCaseId] = useState('');
  const { messages, loading, sendMessage, clearMessages } = useAIStore();
  const { cases, fetchCases } = useCaseStore();
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetchCases({ limit: 30 });
    const params = new URLSearchParams(location.search);
    const cid = params.get('caseId');
    if (cid) setCaseId(cid);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    await sendMessage(msg, caseId || undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/20 rounded-xl">
            <Bot size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-white font-bold">CyberSleuth AI</h1>
            <p className="text-muted text-xs">Ask anything about your investigations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={caseId} onChange={e => setCaseId(e.target.value)}
            className="bg-card border border-border text-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent max-w-xs">
            <option value="">No case context</option>
            {cases.map(c => <option key={c._id} value={c._id}>{c.caseId} — {c.title?.slice(0, 30)}</option>)}
          </select>
          {messages.length > 0 && (
            <button onClick={clearMessages} className="p-2 text-muted hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="p-5 bg-accent/10 rounded-3xl">
              <Sparkles size={40} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">CyberSleuth AI Assistant</h2>
              <p className="text-muted text-sm max-w-sm">Ask me to analyze threats, find related attacks, generate summaries, or create incident reports.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-lg">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => { setInput(p); }}
                  className="px-3 py-2.5 bg-card border border-border text-muted hover:text-white hover:border-accent/50 rounded-xl text-xs transition-colors text-left">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-accent text-white text-xs font-bold' : 'bg-accent/20'
              }`}>
                {msg.role === 'user' ? '👤' : <Bot size={16} className="text-accent" />}
              </div>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-tr-sm'
                  : 'bg-card border border-border rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose-dark">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-accent" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts if messages exist */}
      {messages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => setInput(p)}
              className="px-3 py-1.5 bg-card border border-border text-muted hover:text-white hover:border-accent/50 rounded-xl text-xs transition-colors whitespace-nowrap flex-shrink-0">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about threats, campaigns, IOCs, or request a summary..."
            rows={2}
            className="w-full bg-card border border-border text-white rounded-2xl px-4 py-3 pr-12 text-sm placeholder:text-muted focus:outline-none focus:border-accent resize-none"
          />
        </div>
        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-5 bg-accent text-white rounded-2xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </motion.button>
      </div>
    </div>
  );
}
