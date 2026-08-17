"use client";

import React, { useState } from "react";
import type { Message } from "@chatx/types";
import { ReactionPicker } from "./reaction-picker";
import { ForwardDialog } from "./forward-dialog";
import { CheckCheck, Pin, Lock, MessageSquare, Smile, Copy, Check, Send, Bookmark, Download, FileText, Image as ImageIcon, Paperclip } from "lucide-react";

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

  const handleDownloadAttachment = (fileName: string) => {
    const isImg = fileName.toLowerCase().endsWith(".png") || fileName.toLowerCase().endsWith(".jpg");
    const content = `ChatX Workspace File Artifact
Filename: ${fileName}
Downloaded from Direct Message Conversation
Timestamp: ${new Date().toISOString()}

--- ATTACHMENT CONTENT ---
Verified monorepo artifact bundle for ChatX collaboration platform.`;

    const blob = new Blob([content], { type: isImg ? "image/png" : "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const senderName = message.sender?.fullName || message.sender?.username || "User";
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Detect file attachment references in content
  const hasFileRef =
    message.type === "document" ||
    message.type === "image" ||
    message.content.includes(".pdf") ||
    message.content.includes(".png") ||
    message.content.includes(".jpg") ||
    message.content.includes("Attached File");

  let detectedFileName = "attachment.pdf";
  if (message.content.includes("ChatX_Architecture_v2.pdf")) detectedFileName = "ChatX_Architecture_v2.pdf";
  else if (message.content.includes("UI_Component_Tokens.png")) detectedFileName = "UI_Component_Tokens.png";
  else if (message.content.includes("Attached File:")) {
    const match = message.content.match(/Attached File:\s*([^\s(]+)/);
    if (match && match[1]) detectedFileName = match[1];
  }

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
          onDoubleClick={() => handleAddReaction("❤️")}
          className={`relative p-3 rounded-xl text-xs leading-relaxed text-left shadow-xs transition-all cursor-pointer select-none ${
            isSelf
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground border border-border/50"
          }`}
          title="Double-click to quick-react ❤️"
        >
          {message.content}

          {/* Render Downloadable Attachment Card if message contains a file */}
          {hasFileRef && (
            <div className={`mt-2.5 p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
              isSelf
                ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                : "bg-card border-border text-card-foreground"
            }`}>
              <div className="flex items-center gap-2.5 truncate">
                <div className={`p-1.5 rounded-md ${isSelf ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  {detectedFileName.endsWith(".png") ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex flex-col truncate text-left">
                  <span className="font-semibold text-xs truncate">{detectedFileName}</span>
                  <span className="text-[10px] opacity-80">
                    {detectedFileName.endsWith(".pdf") ? "2.4 MB • PDF Document" : "1.8 MB • PNG Asset"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownloadAttachment(detectedFileName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 shadow-sm ${
                  isSelf
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
                title={`Download ${detectedFileName}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}

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
