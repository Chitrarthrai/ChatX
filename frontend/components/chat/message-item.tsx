"use client";

import React, { useState } from "react";
import type { Message } from "@chatx/types";
import { ReactionPicker } from "./reaction-picker";
import { ForwardDialog } from "./forward-dialog";
import { useRouter } from "next/navigation";
import { 
  CheckCheck, 
  Pin, 
  Lock, 
  MessageSquare, 
  Smile, 
  Copy, 
  Check, 
  Send, 
  Bookmark, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Edit3, 
  Trash2, 
  X,
  Sparkles,
  Calendar,
  Clock,
  Users,
  Radio,
  ExternalLink,
  BarChart2
} from "lucide-react";

export interface MessageReactionItem {
  emoji: string;
  count: number;
  users: string[];
}

interface MessageItemProps {
  message: Message;
  isSelf: boolean;
  onReplyToThread: (msg: Message) => void;
  reactions?: MessageReactionItem[];
  onToggleReaction?: (messageId: string, emoji: string) => void;
  currentUserId?: string;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onTogglePin?: (messageId: string, isPinned: boolean) => void;
  onToggleSave?: (messageId: string, isSaved: boolean) => void;
  isSaved?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  voters: string[];
}

export interface PollPayload {
  type: string;
  id: string;
  question: string;
  options: PollOption[];
  isMultipleChoice?: boolean;
  isAnonymous?: boolean;
  creatorId?: string;
  creatorName?: string;
}

function parsePollMessage(content: string): PollPayload | null {
  if (!content.includes("POLL_DATA:")) return null;
  try {
    const raw = content.split("POLL_DATA:")[1];
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseMeetingMessage(content: string) {
  const isMeeting =
    content.includes("Scheduled Video Meeting") ||
    content.includes("Meeting Invites Updated") ||
    content.includes("Scheduled Meeting Reminder") ||
    content.includes("meetingCode=");

  if (!isMeeting) return null;

  let title = "Video Conference Stage";
  let time = "";
  let meetingCode = "";
  let invited = "";
  let type: "scheduled" | "updated" | "reminder" = "scheduled";

  if (content.includes("Meeting Invites Updated")) type = "updated";
  else if (content.includes("Scheduled Meeting Reminder")) type = "reminder";

  const codeMatch = content.match(/meetingCode=([a-zA-Z0-9_-]+)/);
  if (codeMatch && codeMatch[1]) {
    meetingCode = codeMatch[1];
  } else {
    const directCode = content.match(/chatx-[a-zA-Z0-9_-]+/);
    if (directCode) meetingCode = directCode[0];
  }

  if (type === "scheduled") {
    const titleMatch = content.match(/Scheduled Video Meeting\*\*:\s*([^\n*]+)/);
    if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();
  } else if (type === "updated") {
    const titleMatch = content.match(/to \*\*([^*]+)\*\*/);
    if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();
  } else {
    const titleMatch = content.match(/Scheduled Meeting Reminder\*\*:\s*\*\*?([^*\n]+)\*\*?/);
    if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();
  }

  const timeMatch = content.match(/(?:Time|\*\*Time\*\*):\s*([^\n👥🔑👉]+)/);
  if (timeMatch && timeMatch[1]) time = timeMatch[1].replace(/\*\*/g, "").trim();

  const invitedMatch = content.match(/(?:Invited|\*\*Invited\*\*|Added)\s*:?\s*([^\n🔑👉]+)/);
  if (invitedMatch && invitedMatch[1]) {
    invited = invitedMatch[1].replace(/to \*\*[^*]+\*\*/, "").replace(/\*\*/g, "").trim();
  }

  return {
    isMeeting: true,
    type,
    title,
    time: time || "Scheduled Meeting",
    meetingCode: meetingCode || "chatx-stage",
    invited: invited || "Workspace Members",
  };
}

export function MessageItem({ 
  message, 
  isSelf, 
  onReplyToThread, 
  reactions = [], 
  onToggleReaction, 
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onTogglePin,
  onToggleSave,
  isSaved = false
}: MessageItemProps) {
  const router = useRouter();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [meetingCopied, setMeetingCopied] = useState(false);

  const meetingData = parseMeetingMessage(message.content);
  const pollData = parsePollMessage(message.content);

  const handleVotePoll = (optionId: string) => {
    if (!pollData || !currentUserId || !onEditMessage) return;

    const isMultiple = !!pollData.isMultipleChoice;
    const updatedOptions = pollData.options.map((opt: PollOption) => {
      const alreadyVoted = opt.voters.includes(currentUserId);
      if (opt.id === optionId) {
        return {
          ...opt,
          voters: alreadyVoted
            ? opt.voters.filter((v: string) => v !== currentUserId)
            : [...opt.voters, currentUserId],
        };
      } else if (!isMultiple) {
        return {
          ...opt,
          voters: opt.voters.filter((v: string) => v !== currentUserId),
        };
      }
      return opt;
    });

    const updatedPoll: PollPayload = {
      ...pollData,
      options: updatedOptions,
    };

    onEditMessage(message.id, `POLL_DATA:${JSON.stringify(updatedPoll)}`);
  };

  const handleAddReaction = (emoji: string) => {
    if (onToggleReaction) {
      onToggleReaction(message.id, emoji);
    }
    setShowReactionPicker(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyMeetingLink = (code: string) => {
    const link = `http://localhost:3000/?meetingCode=${code}`;
    navigator.clipboard.writeText(link);
    setMeetingCopied(true);
    setTimeout(() => setMeetingCopied(false), 2000);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editValue.trim();
    if (!trimmed) return;
    if (onEditMessage) {
      onEditMessage(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(message.content);
    setIsEditing(false);
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
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
          isSelf ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
        }`}
      >
        {senderName.charAt(0).toUpperCase()}
      </div>

      <div className={`space-y-1 max-w-xl ${isSelf ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 ${isSelf ? "justify-end" : ""}`}>
          {message.isPinned && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}
          <span className="text-xs font-semibold text-foreground">
            {senderName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formattedTime}
          </span>
          {message.isEdited && (
            <span className="text-[10px] text-muted-foreground italic">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="bg-card border border-primary rounded-xl p-2 shadow-md min-w-[260px] text-left">
            <textarea
              autoFocus
              rows={2}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-1.5 mt-1.5 pt-1.5 border-t border-border">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2 py-0.5 rounded text-[11px] text-muted-foreground hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-0.5 rounded bg-primary text-primary-foreground font-semibold text-[11px] hover:opacity-90 transition-all shadow-xs"
              >
                Save
              </button>
            </div>
          </form>
        ) : pollData ? (
          /* Interactive Channel Poll Widget */
          <div className="mt-1 rounded-2xl bg-card border border-border shadow-md overflow-hidden text-foreground w-full max-w-lg text-left">
            <div className="bg-gradient-to-r from-primary/20 via-blue-500/10 to-indigo-500/15 p-3.5 border-b border-border flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30 shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground leading-tight tracking-tight">
                    {pollData.question}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Channel Poll
                    </span>
                    {pollData.isMultipleChoice && (
                      <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                        Multiple Choice
                      </span>
                    )}
                    {pollData.isAnonymous && (
                      <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 space-y-2 bg-card/60">
              {(() => {
                const totalVotes = pollData.options.reduce((acc, o) => acc + o.voters.length, 0);
                return pollData.options.map((opt) => {
                  const hasVoted = currentUserId ? opt.voters.includes(currentUserId) : false;
                  const count = opt.voters.length;
                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleVotePoll(opt.id)}
                      className={`w-full relative overflow-hidden text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        hasVoted
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border bg-secondary/40 hover:bg-secondary/70"
                      }`}
                    >
                      {/* Progress bar fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-primary/15 transition-all duration-300 pointer-events-none"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="flex items-center gap-2.5 relative z-10 truncate">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            hasVoted
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground bg-background"
                          }`}
                        >
                          {hasVoted && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="font-semibold text-xs text-foreground truncate">{opt.text}</span>
                      </div>

                      <div className="flex items-center gap-2 relative z-10 shrink-0 text-xs">
                        <span className="text-[11px] font-bold text-primary">{percentage}%</span>
                        <span className="text-[10px] text-muted-foreground">({count})</span>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>

            <div className="p-2.5 px-3.5 bg-secondary/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{pollData.options.reduce((acc, o) => acc + o.voters.length, 0)} total votes</span>
              <span className="text-[10px]">Click any option to vote or change vote</span>
            </div>
          </div>
        ) : meetingData ? (
          /* Specialized Scheduled Meeting Card */
          <div className="mt-1 rounded-2xl bg-card border border-border shadow-md overflow-hidden text-foreground w-full max-w-lg text-left">
            <div className="bg-gradient-to-r from-primary/20 via-indigo-500/15 to-purple-500/10 p-3.5 border-b border-border flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground leading-tight tracking-tight">
                    {meetingData.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mt-1 inline-block">
                    {meetingData.type === "updated" ? "Invites Updated" : "Scheduled Meeting"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 space-y-2.5 bg-card/60">
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{meetingData.time}</span>
              </div>

              {meetingData.invited && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{meetingData.invited}</span>
                </div>
              )}

              <div className="flex items-center justify-between bg-secondary/60 p-2 rounded-xl border border-border/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">Meeting Code:</span>
                  <span className="font-mono font-bold text-primary text-xs bg-background px-2 py-0.5 rounded border border-border">
                    {meetingData.meetingCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyMeetingLink(meetingData.meetingCode)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium px-2 py-0.5 rounded hover:bg-secondary transition-all"
                >
                  {meetingCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{meetingCopied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => router.push("/calendar")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold transition-all shadow-xs"
                title="Open Calendar to check your schedule"
              >
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Check in Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/?meetingCode=${meetingData.meetingCode}`)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Join Stage</span>
              </button>
            </div>
          </div>
        ) : (
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

            {reactions && reactions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-2 pt-1 border-t border-black/10">
                {reactions.map((r, idx) => {
                  const isReactedByMe = currentUserId ? r.users.includes(currentUserId) : false;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onToggleReaction && onToggleReaction(message.id, r.emoji)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                        isReactedByMe
                          ? "bg-primary/20 text-primary border-primary/40 shadow-sm"
                          : "bg-background/80 text-foreground border-border hover:bg-secondary"
                      }`}
                      title={isReactedByMe ? `Remove ${r.emoji}` : `React with ${r.emoji}`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

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

        {isSelf && (
          <button
            onClick={() => {
              setEditValue(message.content);
              setIsEditing(!isEditing);
            }}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
            title="Edit message"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onTogglePin && onTogglePin(message.id, !message.isPinned)}
          className={`p-1 hover:bg-secondary rounded ${message.isPinned ? "text-amber-500 font-bold" : "text-muted-foreground hover:text-foreground"}`}
          title={message.isPinned ? "Unpin message" : "Pin message"}
        >
          <Pin className="w-3.5 h-3.5" />
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
          onClick={() => onToggleSave && onToggleSave(message.id, !isSaved)}
          className={`p-1 hover:bg-secondary rounded ${isSaved ? "text-amber-500 font-bold" : "text-muted-foreground hover:text-foreground"}`}
          title={isSaved ? "Saved" : "Save message"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
        </button>

        <button
          onClick={handleCopyText}
          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          title="Copy message"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {isSelf && (
          <button
            onClick={() => onDeleteMessage && onDeleteMessage(message.id)}
            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-all"
            title="Delete message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showReactionPicker && (
        <div className={`absolute -top-10 z-30 ${isSelf ? "right-12" : "left-12"}`}>
          <ReactionPicker
            onSelectEmoji={handleAddReaction}
            onClose={() => setShowReactionPicker(false)}
          />
        </div>
      )}

      <ForwardDialog
        isOpen={showForwardDialog}
        messageContent={message.content}
        onClose={() => setShowForwardDialog(false)}
        onForward={(target) => console.log(`Forwarded to ${target}`)}
      />
    </div>
  );
}
