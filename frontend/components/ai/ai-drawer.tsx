"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Bot, ShieldCheck, CornerDownRight } from "lucide-react";

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  sources?: string[];
  time: string;
}

export function AIDrawer({ isOpen, onClose }: AIDrawerProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "ai-1",
      sender: "ai",
      content: "Hello! I am your permission-aware AI assistant. You can ask me to summarize meetings, find action items, or search discussions across channels.",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  if (!isOpen) return null;

  const handleSendPrompt = (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim()) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput("");
    setThinking(true);

    setTimeout(() => {
      let responseContent = "Based on your workspace transcripts and active channels, here is the requested breakdown.";
      let sources = ["#Architecture & Engineering", "Meeting Transcript: ChatX Arch Sync"];

      if (textToSend.toLowerCase().includes("phase 1") || textToSend.toLowerCase().includes("deliverables")) {
        responseContent = "Phase 1 deliverables include: Monorepo setup (@chatx/config, @chatx/types), Supabase initial schema & RLS policies, and WCAG AA slate/indigo theme integration.";
      } else if (textToSend.toLowerCase().includes("action item") || textToSend.toLowerCase().includes("task")) {
        responseContent = "1. Alex Mercer: Complete SFU WebRTC node transport integration.\n2. Sophia Chen: Finalize WCAG AA color tokens in frontend.\n3. Marcus Vance: Run Supabase RLS security audit.";
      }

      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: responseContent,
        sources,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setThinking(false);
    }, 1000);
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col justify-between h-full z-20 shadow-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-xs text-foreground">AI Workspace Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 bg-secondary/30 border-b border-border space-y-1.5 text-[11px]">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested Questions</span>
        <div className="space-y-1">
          {[
            "What are the Phase 1 deliverables?",
            "Show action items assigned to me",
            "Summarize recent architecture discussions",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="w-full text-left p-1.5 rounded bg-card hover:bg-secondary text-foreground truncate border border-border flex items-center justify-between transition-colors"
            >
              <span className="truncate">{prompt}</span>
              <CornerDownRight className="w-3 h-3 text-primary shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
              }`}
            >
              {m.sender === "user" ? "U" : <Bot className="w-4 h-4" />}
            </div>
            <div className={`space-y-1 max-w-[85%] ${m.sender === "user" ? "text-right" : ""}`}>
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed text-left ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground border border-border"
                }`}
              >
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Sources: </span>
                    <span>{m.sources.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Analyzing workspace vectors...</span>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }} className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2 bg-secondary/80 border border-input rounded-lg px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything about the project..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button type="submit" disabled={!input.trim()} className="text-primary hover:opacity-80 disabled:opacity-40">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
