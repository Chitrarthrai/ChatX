"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  X,
  Users,
  Hash,
  User,
  CheckCircle2,
  Loader2,
  Shield,
  Radio,
  Search,
  CheckSquare,
  Square,
  Sparkles
} from "lucide-react";
import { scheduleMeeting, MeetingItem } from "@/services/meetings";
import { fetchDirectMessageContacts, fetchChannels, UserDirectoryItem, ChannelItem } from "@/services/channels";
import { CustomDatePicker } from "./custom-date-picker";
import { CustomTimePicker } from "./custom-time-picker";

interface ScheduleChatMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetChat: string;
  isDM: boolean;
  dmContact?: { id: string; name: string; role?: string };
  channelInfo?: { id: string; name: string; topic?: string };
  currentUserId: string;
  currentUserName: string;
  onSuccessScheduled?: (meeting: MeetingItem) => void;
}

export function ScheduleChatMeetingDialog({
  isOpen,
  onClose,
  targetChat,
  isDM,
  dmContact,
  channelInfo,
  currentUserId,
  currentUserName,
  onSuccessScheduled
}: ScheduleChatMeetingDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [postAnnouncement, setPostAnnouncement] = useState(true);
  const [isWaitingRoom, setIsWaitingRoom] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional: Additional coworkers & groups to invite
  const [showAddMore, setShowAddMore] = useState(false);
  const [allContacts, setAllContacts] = useState<UserDirectoryItem[]>([]);
  const [additionalUserIds, setAdditionalUserIds] = useState<string[]>([]);
  const [additionalGroups, setAdditionalGroups] = useState<string[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  const groupsList = ["Engineering", "Product & Design", "Frontend Core", "DevOps & Cloud", "Executive"];

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Default meeting title based on active chat
      if (isDM) {
        setTitle(`1-on-1 Sync with ${targetChat}`);
      } else {
        setTitle(`${targetChat} Team Meeting`);
      }

      // Default date & time (1 hour from now)
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      setScheduledDate(now.toISOString().split("T")[0]);
      setScheduledTime(now.toTimeString().substring(0, 5));

      // Load directory contacts for optional extra invites
      fetchDirectMessageContacts(currentUserId).then((c) => {
        if (c) setAllContacts(c);
      });
    }
  }, [isOpen, targetChat, isDM, currentUserId]);

  if (!isOpen) return null;

  const toggleAdditionalUser = (uid: string) => {
    setAdditionalUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const toggleAdditionalGroup = (grp: string) => {
    setAdditionalGroups((prev) =>
      prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledDate || !scheduledTime) {
      setError("Please provide a meeting title, scheduled date, and start time.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Collect invitee user IDs
      const inviteeIds = new Set<string>();
      if (isDM && dmContact?.id) {
        inviteeIds.add(dmContact.id);
      }
      additionalUserIds.forEach((id) => inviteeIds.add(id));

      // Target conversation ID for immediate in-chat card announcement
      let targetConvId: string | undefined = undefined;
      if (postAnnouncement) {
        if (isDM && dmContact?.id) {
          const { getOrCreateDirectConversation } = await import("@/services/messages");
          targetConvId = await getOrCreateDirectConversation(currentUserId, dmContact.id);
        } else if (channelInfo?.id) {
          const { getOrCreateChannelConversation } = await import("@/services/messages");
          targetConvId = await getOrCreateChannelConversation(channelInfo.id, currentUserId, channelInfo.name);
        }
      }

      const meeting = await scheduleMeeting({
        title: title.trim(),
        description: description.trim(),
        scheduledDate,
        scheduledTime,
        isWaitingRoom,
        isRecording,
        hostId: currentUserId,
        hostName: currentUserName,
        inviteeUserIds: Array.from(inviteeIds),
        inviteeGroupNames: additionalGroups,
        targetConversationId: postAnnouncement ? targetConvId : undefined,
      });

      if (onSuccessScheduled) {
        onSuccessScheduled(meeting);
      }

      onClose();
    } catch (err: any) {
      console.error("Error scheduling meeting for chat:", err);
      setError(err?.message || "Failed to schedule meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = allContacts.filter(
    (c) =>
      c.id !== currentUserId &&
      (c.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchMemberQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">
                Schedule Meeting for {isDM ? dmContact?.name || targetChat : `#${targetChat}`}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isDM ? "Personal 1-on-1 video conference with direct invite" : "Team video meeting with in-channel announcement"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Target Banner */}
          <div className="p-3 rounded-xl bg-secondary/60 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDM ? (
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {targetChat.charAt(0)}
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Hash className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">{targetChat}</p>
                <p className="text-[10px] text-muted-foreground">{isDM ? "Direct Message Participant" : "Workspace Channel"}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              Target Chat
            </span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Meeting Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture & Engineering Sync"
              className="w-full bg-secondary border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Scheduled Date *</label>
              <CustomDatePicker
                value={scheduledDate}
                onChange={(_, dateStr) => setScheduledDate(dateStr)}
                className="w-full"
                align="left"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Start Time *</label>
              <CustomTimePicker
                value={scheduledTime}
                onChange={(timeStr) => setScheduledTime(timeStr)}
                className="w-full"
                align="right"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Agenda / Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Topics, agenda items, or deliverables to review..."
              className="w-full bg-secondary border border-input rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Post Interactive Card Announcement Checkbox */}
          <div
            onClick={() => setPostAnnouncement(!postAnnouncement)}
            className="flex items-start gap-3 p-3 bg-secondary/40 border border-border/80 rounded-xl cursor-pointer hover:bg-secondary/70 transition-all select-none"
          >
            <input
              type="checkbox"
              checked={postAnnouncement}
              onChange={() => {}}
              className="mt-0.5 rounded text-primary focus:ring-0"
            />
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground text-xs">
                Post Interactive Meeting Card in {isDM ? targetChat : `#${targetChat}`}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Sends an interactive card with "Check in Schedule", "Join Stage", and "Copy Code" buttons directly into this chat in real time.
              </p>
            </div>
          </div>

          {/* Meeting Room Security Options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div
              onClick={() => setIsWaitingRoom(!isWaitingRoom)}
              className="flex items-center gap-2 p-2.5 bg-secondary/30 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/60 transition-all select-none"
            >
              <input type="checkbox" checked={isWaitingRoom} onChange={() => {}} className="rounded text-primary focus:ring-0" />
              <span className="text-[11px] font-medium text-foreground">Waiting Room Guard</span>
            </div>
            <div
              onClick={() => setIsRecording(!isRecording)}
              className="flex items-center gap-2 p-2.5 bg-secondary/30 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/60 transition-all select-none"
            >
              <input type="checkbox" checked={isRecording} onChange={() => {}} className="rounded text-primary focus:ring-0" />
              <span className="text-[11px] font-medium text-foreground">HD Cloud Recording</span>
            </div>
          </div>

          {/* Add Additional Coworkers & Groups Section */}
          <div className="pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setShowAddMore(!showAddMore)}
              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>{showAddMore ? "− Hide additional coworker/group invites" : "+ Invite additional coworkers or teams"}</span>
            </button>

            {showAddMore && (
              <div className="mt-3 space-y-3 p-3 bg-secondary/20 border border-border/60 rounded-xl animate-in fade-in">
                {/* Search Coworkers */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                    Invite Coworkers ({additionalUserIds.length} selected)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchMemberQuery}
                      onChange={(e) => setSearchMemberQuery(e.target.value)}
                      placeholder="Search coworkers by name or role..."
                      className="w-full bg-secondary pl-8 pr-3 py-1.5 rounded-lg border border-input text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {filteredContacts.map((c) => {
                      const isSelected = additionalUserIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleAdditionalUser(c.id)}
                          className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all ${
                            isSelected ? "bg-primary/10 border border-primary/30 text-primary" : "hover:bg-secondary text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">
                              {c.name.charAt(0)}
                            </span>
                            <span className="font-medium truncate">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground">({c.role})</span>
                          </div>
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Groups */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                    Invite Teams / Groups
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {groupsList.map((grp) => {
                      const isSelected = additionalGroups.includes(grp);
                      return (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => toggleAdditionalGroup(grp)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {isSelected ? `✓ ${grp}` : `+ ${grp}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
              <span>Schedule & Send Invite</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
