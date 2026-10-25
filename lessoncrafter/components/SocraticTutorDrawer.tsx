"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2, 
  RotateCcw, 
  Maximize2,
  Minimize2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
}

interface SocraticTutorDrawerProps {
  lessonTitle: string;
  lessonOutline: string;
}

const PRESET_PROMPTS = [
  "Explain this concept step-by-step",
  "Give me an intuition-building hint",
  "How should I experiment with the interactive demo?",
  "Quiz me on a potential edge-case",
];

export default function SocraticTutorDrawer({
  lessonTitle,
  lessonOutline,
}: SocraticTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content: `Welcome to your interactive study session on **"${lessonTitle || "this topic"}"**!\n\nI'm your **Socratic Tutor**. Rather than handing you direct answers, I'm here to help you deconstruct the core principles, test hypotheses, and build deep mastery.\n\nWhat question or observation is on your mind?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle,
          lessonOutline,
          userQuery: textToSend,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.success && data.answer) {
        const assistantMessage: Message = {
          id: `tutor-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          modelUsed: data.modelUsed,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ *${data.error || "Unable to consult tutor engine at this time."}*`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ *Network or request error: ${msg}*`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "initial-welcome-reset",
        role: "assistant",
        content: `Chat history cleared. What concept in **"${lessonTitle}"** would you like to explore next?`,
      },
    ]);
  };

  return (
    <>
      {/* Floating launcher trigger pill when drawer is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-sm shadow-xl shadow-cobalt-600/30 border border-cobalt-400/40 transition-all active:scale-95 group cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span>Socratic AI Tutor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40 animate-pulse" />
        </button>
      )}

      {/* Docked Sidecar Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col glass border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl ${
            isExpanded
              ? "inset-y-0 right-0 w-full sm:w-[620px] border-l"
              : "inset-y-0 right-0 w-full sm:w-[420px] border-l"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cobalt-600 text-white flex items-center justify-center shadow-md shadow-cobalt-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Socratic Tutor</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cobalt-100 dark:bg-cobalt-950/80 text-cobalt-700 dark:text-cobalt-300 border border-cobalt-300/40 dark:border-cobalt-800">
                    Groq 120B
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate max-w-[200px]">
                  {lessonTitle || "Guided Learning Assistant"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Restart conversation"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse width" : "Expand width"}
                className="hidden sm:block p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close drawer"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-4 py-3 bg-slate-100/60 dark:bg-slate-900/30 border-b border-slate-200 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cobalt-500 hover:text-cobalt-600 dark:hover:text-cobalt-400 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-cobalt-600 text-white rounded-br-none shadow-md shadow-cobalt-600/20"
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.modelUsed && (
                    <div className="mt-2 text-[9px] font-mono text-slate-400 dark:text-slate-500 text-right uppercase tracking-wider">
                      via {m.modelUsed}
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-xs leading-relaxed justify-start items-center animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cobalt-600" />
                  <span>Synthesizing Socratic guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for intuition, guidance, or step-by-step logic..."
                disabled={loading}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cobalt-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shadow-md shadow-cobalt-600/20 flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <p className="mt-2 text-[10px] text-center text-slate-400 dark:text-slate-600">
              Socratic Mentor empowers active discovery • Ask why, not just what.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
