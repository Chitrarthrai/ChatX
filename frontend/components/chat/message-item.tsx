"use client";

import React, { useState } from "react";
import type { Message } from "@chatx/types";
import { ReactionPicker } from "./reaction-picker";
import { ForwardDialog } from "./forward-dialog";
import { CheckCheck, Pin, Lock, MessageSquare, Smile, Copy, Check, Send, Bookmark } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isSelf: boolean;
  onReplyToThread: (msg: Message) => void;
}

export function MessageItem({ message, isSelf, onReplyToThread }: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddReaction = (emoji: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r));
      }
      return [...prev, { emoji, count: 1 }];
    });
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  const senderName = message.sender?.fullName || message.sender?.username || "User";
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`relative group flex items-start gap-3 ${isSelf ? "flex-row-reverse" : ""}`}>
      {/* Sender Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
          isSelf ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
        }`}
      >
        {senderName.charAt(0).toUpperCase()}
      </div>

      {/* Message Bubble Container */}
      <div className={`space-y-1 max-w-xl ${isSelf ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 ${isSelf ? "justify-end" : ""}`}>
          <span className="text-xs font-semibold text-foreground">
            {senderName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formattedTime}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`relative p-3 rounded-xl text-xs leading-relaxed text-left shadow-xs transition-all ${
            isSelf
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground border border-border/50"
          }`}
        >
          {message.content}

          {/* Reactions Row */}
          {reactions.length > 0 && (
            <div className="flex items-center gap-1 mt-2 pt-1 border-t border-black/10">
              {reactions.map((r, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-background/80 text-foreground px-2 py-0.5 rounded-full text-[11px] font-medium border border-border"
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Status Bar */}
        {isSelf && (
          <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground mt-0.5">
            {message.status === "read" ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-blue-500 font-semibold">Read</span>
              </>
            ) : message.status === "delivered" ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Delivered</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Sent</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Toolbar on Hover */}
      <div
        className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-lg p-1 shadow-md flex items-center gap-1 z-10 ${
          isSelf ? "right-12" : "left-12"
        }`}
      >
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          title="Add reaction"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onReplyToThread(message)}
          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          title="Reply in thread"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowForwardDialog(true)}
          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          title="Forward message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleToggleSave}
          className={`p-1 hover:bg-secondary rounded ${isSaved ? "text-amber-500 font-bold" : "text-muted-foreground hover:text-foreground"}`}
          title={isSaved ? "Saved" : "Save message"}
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCopyText}
          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          title="Copy message"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating Reaction Picker */}
      {showReactionPicker && (
        <div className={`absolute -top-10 z-30 ${isSelf ? "right-12" : "left-12"}`}>
          <ReactionPicker
            onSelectEmoji={handleAddReaction}
            onClose={() => setShowReactionPicker(false)}
          />
        </div>
      )}

      {/* Forwarding Dialog */}
      <ForwardDialog
        isOpen={showForwardDialog}
        messageContent={message.content}
        onClose={() => setShowForwardDialog(false)}
        onForward={(target) => console.log(`Forwarded to ${target}`)}
      />
    </div>
  );
}
