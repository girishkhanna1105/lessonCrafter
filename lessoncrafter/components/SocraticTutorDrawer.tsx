"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  X, 
  User, 
  Loader2, 
  RotateCcw, 
  MessageSquare,
  HelpCircle,
  Sparkles
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
  "Give me an intuitive mental model",
  "How should I test the interactive slider?",
  "Give me a quick practice question",
];

export default function SocraticTutorDrawer({
  lessonTitle,
  lessonOutline,
}: SocraticTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content: `Hi! I'm your **study assistant** for **"${lessonTitle || "this lesson"}"**.\n\nIf you want a step-by-step explanation, a helpful analogy, or a hint on how the interactive simulator behaves, ask me anything below!`,
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
          content: "Sorry, I had trouble generating a response. Please ask your question again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Network error. Please try again.",
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
        content: `Chat cleared. What question do you have about **"${lessonTitle}"**?`,
      },
    ]);
  };

  return (
    <>
      {/* Floating launcher trigger pill when drawer is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs shadow-lg shadow-cobalt-600/30 border border-cobalt-400/30 transition-all active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-white" />
          <span>Ask Study Assistant</span>
        </button>
      )}

      {/* Docked Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center border border-cobalt-500/20">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Study Assistant
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ask questions anytime
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Clear chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick-Prompt Suggestions */}
          <div className="px-3 py-2 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {PRESET_PROMPTS.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSend(promptText)}
                disabled={loading}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap hover:border-cobalt-500/40 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center shrink-0 mt-0.5 border border-cobalt-500/20">
                      <HelpCircle className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      isUser
                        ? "bg-cobalt-600 text-white rounded-tr-none font-medium"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cobalt-500" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
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
                placeholder="Ask for guidance or step-by-step logic..."
                disabled={loading}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cobalt-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
