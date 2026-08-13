"use client";

import React, { useState } from "react";
import type { Message } from "@chatx/types";
import { X, Send, MessageSquare } from "lucide-react";

interface ThreadDrawerProps {
  parentMessage: Message | null;
  onClose: () => void;
}

export function ThreadDrawer({ parentMessage, onClose }: ThreadDrawerProps) {
  const [replies, setReplies] = useState<{ id: string; sender: string; content: string; time: string }[]>([
    {
      id: "r1",
      sender: "Sophia Chen",
      content: "Agreed. Let's make sure the RLS policies also cover threaded message isolation.",
      time: "10:48 AM",
    },
  ]);
  const [replyInput, setReplyInput] = useState("");

  if (!parentMessage) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    setReplies((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "You",
        content: replyInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setReplyInput("");
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col justify-between h-full z-20 shadow-lg animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-xs text-foreground">Thread Discussion</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Parent Message Card */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="text-xs font-semibold text-foreground mb-1">{parentMessage.sender?.fullName || "User"}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{parentMessage.content}</p>
      </div>

      {/* Replies Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {replies.map((r) => (
          <div key={r.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{r.sender}</span>
              <span className="text-[10px] text-muted-foreground">{r.time}</span>
            </div>
            <div className="bg-secondary/60 p-2.5 rounded-lg text-foreground leading-relaxed">
              {r.content}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Composer Input */}
      <form onSubmit={handleSendReply} className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2 bg-secondary/80 border border-input rounded-lg px-3 py-1.5">
          <input
            type="text"
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            placeholder="Reply to thread..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button type="submit" disabled={!replyInput.trim()} className="text-primary hover:opacity-80 disabled:opacity-40">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
