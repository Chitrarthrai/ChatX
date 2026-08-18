"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  Calendar as CalendarIcon,
  Video,
  Plus,
  ArrowLeft,
  Clock,
  User,
  CheckCircle2,
  Loader2,
  X,
  Shield,
  Radio,
  Inbox,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  Trash2,
  Users,
  Hash,
  Share2,
  UserPlus,
  Search,
  CheckSquare,
  Square,
  MessageSquare
} from "lucide-react";
import { 
  fetchMeetings, 
  scheduleMeeting, 
  addMeetingParticipants, 
  deleteMeeting, 
  subscribeToMeetings,
  MeetingItem 
} from "@/services/meetings";
import { fetchChannels, fetchDirectMessageContacts, ChannelItem, UserDirectoryItem } from "@/services/channels";
import { sendMessage } from "@/services/messages";

export default function CalendarPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [contacts, setContacts] = useState<UserDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [shouldPostAnnouncement, setShouldPostAnnouncement] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [isWaitingRoom, setIsWaitingRoom] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [creating, setCreating] = useState(false);

  // Add People / Groups to existing meeting state
  const [activeMeetingForInvites, setActiveMeetingForInvites] = useState<MeetingItem | null>(null);
  const [addInvitesUserIds, setAddInvitesUserIds] = useState<string[]>([]);
  const [addInvitesGroups, setAddInvitesGroups] = useState<string[]>([]);
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const [addGroupSearch, setAddGroupSearch] = useState("");
  const [shouldNotifyOnAdd, setShouldNotifyOnAdd] = useState(false);
  const [addNotifyChannelId, setAddNotifyChannelId] = useState("");
  const [savingInvites, setSavingInvites] = useState(false);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [meetingList, channelList, contactList] = await Promise.all([
          fetchMeetings(),
          fetchChannels(),
          fetchDirectMessageContacts(user?.id)
        ]);

        if (isMounted) {
          setMeetings(meetingList);
          setChannels(channelList);
          setContacts(contactList);
          if (channelList.length > 0) {
            setSelectedChannelId(channelList[0].id);
            setAddNotifyChannelId(channelList[0].id);
          }

          const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const targetChatName = urlParams?.get("chat");
          if (targetChatName) {
            const matchedChan = channelList.find((c) => c.name === targetChatName);
            const matchedContact = contactList.find((co) => co.name === targetChatName);
            if (matchedChan) {
              setSelectedChannelId(matchedChan.id);
              setTitle(`${matchedChan.name} Sync`);
              setShouldPostAnnouncement(true);
              setIsModalOpen(true);
            } else if (matchedContact) {
              setSelectedUserIds([matchedContact.id]);
              setTitle(`1-on-1 Sync with ${matchedContact.name}`);
              setShouldPostAnnouncement(true);
              setIsModalOpen(true);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load calendar meetings.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Subscribe to realtime meeting changes
    const channel = subscribeToMeetings(() => {
      fetchMeetings().then((updated) => {
        if (isMounted) setMeetings(updated);
      });
    });

    return () => {
      isMounted = false;
      if (channel) {
        const supabase = (channel as any).supabase;
        if (supabase) supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const activeUserId = user?.id || profile?.id || (typeof window !== "undefined" ? (() => {
        try {
          return JSON.parse(localStorage.getItem("chatx_active_user") || "{}")?.id;
        } catch { return ""; }
      })() : "");

      const hostName = profile?.fullName || user?.email || "Host User";
      const targetConv = shouldPostAnnouncement && selectedChannelId ? selectedChannelId : undefined;

      const newMeeting = await scheduleMeeting({
        title,
        description,
        scheduledDate,
        scheduledTime,
        isWaitingRoom,
        isRecording,
        hostId: activeUserId,
        hostName,
        inviteeUserIds: selectedUserIds,
        inviteeGroupNames: selectedGroups,
        targetConversationId: targetConv
      });

      setMeetings((prev) => [newMeeting, ...prev]);
      const noticeMsg = targetConv
        ? `Meeting "${title}" scheduled successfully & announcement broadcasted to channel!`
        : `Meeting "${title}" scheduled successfully in your calendar!`;
      setSuccessMessage(noticeMsg);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setScheduledDate("");
      setScheduledTime("");
      setSelectedUserIds([]);
      setSelectedGroups([]);
      setMemberSearchQuery("");
      setGroupSearchQuery("");
      setShouldPostAnnouncement(false);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setError(err.message || "Failed to schedule meeting.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAddInvites = (meeting: MeetingItem) => {
    setActiveMeetingForInvites(meeting);
    const existingUserIds = meeting.participants.map((p) => p.userId);
    setAddInvitesUserIds(existingUserIds);
    setAddInvitesGroups(meeting.invitedGroups || []);
    setAddMemberSearch("");
    setAddGroupSearch("");
    setShouldNotifyOnAdd(false);
  };

  const handleSaveInvites = async () => {
    if (!activeMeetingForInvites) return;
    setSavingInvites(true);
    try {
      const activeUserId = user?.id || profile?.id || "";
      const newUids = addInvitesUserIds.filter(
        (id) => !activeMeetingForInvites.participants.some((p) => p.userId === id)
      );

      const targetConv = shouldNotifyOnAdd && addNotifyChannelId ? addNotifyChannelId : undefined;

      await addMeetingParticipants(
        activeMeetingForInvites.id,
        activeMeetingForInvites.title,
        activeMeetingForInvites.meetingCode,
        newUids,
        addInvitesGroups,
        targetConv,
        activeUserId
      );

      // Refresh meetings
      const updated = await fetchMeetings();
      setMeetings(updated);
      setSuccessMessage(`Updated invited participants for "${activeMeetingForInvites.title}"!`);
      setActiveMeetingForInvites(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to add participants.");
    } finally {
      setSavingInvites(false);
    }
  };

  const handlePostToChat = async (m: MeetingItem) => {
    setBroadcastingId(m.id);
    try {
      const activeUserId = user?.id || profile?.id || "";
      const targetConv = selectedChannelId || (channels.length > 0 ? channels[0].id : "");
      if (targetConv && activeUserId) {
        const msg = `📅 **Scheduled Meeting Reminder**: **${m.title}**\n🕒 **Time**: ${m.timeFormatted} (${m.durationFormatted})\n🔑 **Code**: \`${m.meetingCode}\`\n👉 **Join Now**: http://localhost:3000/?meetingCode=${m.meetingCode}`;
        await sendMessage({ conversationId: targetConv, content: msg, type: 'text' }, activeUserId);
        setSuccessMessage(`Posted "${m.title}" invite card to chat channel!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to broadcast to chat.");
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to cancel and remove this scheduled meeting?")) return;
    try {
      await deleteMeeting(meetingId);
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      setSuccessMessage("Scheduled meeting cancelled.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to delete meeting.");
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `http://localhost:3000/?meetingCode=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleJoinSession = (code: string) => {
    router.push(`/?meetingCode=${code}`);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectGroup = (groupName: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  };

  // Filtered contacts and groups for Schedule Modal
  const filteredContacts = contacts.filter((c) => {
    const q = memberSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q)
    );
  });

  const filteredGroups = channels.filter((c) => {
    const q = groupSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q);
  });

  // Filtered contacts and groups for Add Invites Modal
  const filteredAddContacts = contacts.filter((c) => {
    const q = addMemberSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q)
    );
  });

  const filteredAddGroups = channels.filter((c) => {
    const q = addGroupSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Scheduled Meetings & Calendar Sync</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {meetings.length}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 border border-border p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-44 bg-secondary rounded" />
                      <div className="h-3 w-28 bg-secondary rounded" />
                    </div>
                  </div>
                  <div className="h-8 w-24 bg-secondary rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">No meetings scheduled</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Schedule a new video meeting session with your team members to collaborate on SFU stage.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule First Meeting</span>
            </button>
          </div>
        ) : (
          /* Meetings Roster */
          <div className="space-y-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="bg-card border border-border p-5 rounded-2xl space-y-4 hover:border-primary/40 transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{m.title}</h3>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            m.status === "active"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 animate-pulse"
                              : m.status === "scheduled"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {m.status === "active" ? "LIVE NOW" : m.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 font-medium text-foreground/80">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{m.timeFormatted}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span>Host: {m.hostName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePostToChat(m)}
                      disabled={broadcastingId === m.id}
                      className="bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                      title="Post announcement card to chat channel"
                    >
                      {broadcastingId === m.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>Post to Chat</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(m.meetingCode)}
                      className="bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                      title="Copy meeting join link"
                    >
                      {copiedCode === m.meetingCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span>{copiedCode === m.meetingCode ? "Copied" : "Copy Link"}</span>
                    </button>

                    <button
                      onClick={() => handleJoinSession(m.meetingCode)}
                      className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Join Stage</span>
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      title="Delete meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {m.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/30 p-3 rounded-xl border border-border/40 font-normal">
                    {m.description}
                  </p>
                )}

                {/* Participants & Groups Row */}
                <div className="bg-secondary/20 p-3 rounded-xl border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Invited Participants & Groups</span>
                    </span>
                    <button
                      onClick={() => handleOpenAddInvites(m)}
                      className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Add People / Groups</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Channel / Group badges */}
                    {(m.invitedGroups && m.invitedGroups.length > 0 ? m.invitedGroups : []).map((grp, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium px-2 py-0.5 rounded-full"
                      >
                        <Hash className="w-2.5 h-2.5" />
                        <span>{grp}</span>
                      </span>
                    ))}

                    {/* Member badges */}
                    {m.participants && m.participants.length > 0 ? (
                      m.participants.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border text-[10px] font-medium px-2 py-0.5 rounded-full"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary text-[8px] flex items-center justify-center font-bold">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <span>{p.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">
                        {m.invitedGroups && m.invitedGroups.length > 0
                          ? "Invited groups configured above"
                          : "Private meeting (Invite specific members/groups below)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Flags Bar */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-[10px] bg-secondary px-2 py-0.5 rounded border border-border">
                      <LinkIcon className="w-3 h-3 text-primary" />
                      <span>{m.meetingCode}</span>
                    </span>
                    {m.isWaitingRoom && (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Shield className="w-3 h-3 text-emerald-500" /> Waiting Room Enabled
                      </span>
                    )}
                    {m.isRecording && (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Video className="w-3 h-3 text-amber-500" /> Auto Cloud Recording
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border max-w-lg w-full rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Schedule New Video Meeting</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Meeting Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Architecture Review & SFU Planning"
                  className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Description / Agenda
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline key agenda topics or sync notes..."
                  className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Optional Chat Channel Announcement */}
              <div className="p-3 bg-secondary/30 rounded-xl border border-border/60 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-foreground">Post Live Announcement into Channel</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shouldPostAnnouncement}
                    onChange={(e) => setShouldPostAnnouncement(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>

                {shouldPostAnnouncement && (
                  <div className="pt-2 border-t border-border/40 animate-in fade-in duration-150">
                    <label className="block text-[11px] text-muted-foreground mb-1 font-medium">
                      Select Broadcast Channel
                    </label>
                    <select
                      value={selectedChannelId}
                      onChange={(e) => setSelectedChannelId(e.target.value)}
                      className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring text-xs"
                    >
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.name} ({c.topic || "Workspace channel"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Invite Channel Groups with Quick Search */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-muted-foreground font-medium">
                    Invite Channel Groups ({selectedGroups.length} selected)
                  </label>
                </div>

                {channels.length > 4 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                      placeholder="Search channels & groups..."
                      className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                  {filteredGroups.map((c) => {
                    const tag = `#${c.name}`;
                    const isSelected = selectedGroups.includes(tag);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleSelectGroup(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-secondary text-foreground border-border hover:bg-secondary/80"
                        }`}
                      >
                        <Hash className="w-3 h-3" />
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Invite Team Members with Search Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-muted-foreground font-medium">
                    Invite Specific Team Members ({selectedUserIds.length} selected)
                  </label>
                  {selectedUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Selected Chips Preview */}
                {selectedUserIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2 bg-secondary/40 rounded-xl border border-border/50 max-h-20 overflow-y-auto">
                    {selectedUserIds.map((uid) => {
                      const c = contacts.find((u) => u.id === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary border border-primary/30"
                        >
                          <span>{c?.name || "Member"}</span>
                          <button
                            type="button"
                            onClick={() => toggleSelectUser(uid)}
                            className="hover:text-destructive"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search coworkers by name, email, or username..."
                    className="w-full pl-8 pr-3 py-2 bg-secondary border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {memberSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMemberSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Contact List */}
                <div className="max-h-36 overflow-y-auto space-y-1 border border-border rounded-xl p-1.5 bg-secondary/30">
                  {filteredContacts.length === 0 ? (
                    <div className="text-muted-foreground text-[11px] p-2 text-center">
                      {memberSearchQuery ? "No members found matching search" : "No contacts available"}
                    </div>
                  ) : (
                    filteredContacts.map((contact) => {
                      const isSelected = selectedUserIds.includes(contact.id);
                      return (
                        <label
                          key={contact.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="font-semibold text-foreground truncate text-xs">{contact.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{contact.email}</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(contact.id)}
                            className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">Enable Host Waiting Room</span>
                  <input
                    type="checkbox"
                    checked={isWaitingRoom}
                    onChange={(e) => setIsWaitingRoom(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">Auto Cloud Meeting Recording</span>
                  <input
                    type="checkbox"
                    checked={isRecording}
                    onChange={(e) => setIsRecording(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarIcon className="w-4 h-4" />
                  )}
                  <span>{creating ? "Scheduling..." : "Schedule Meeting"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add People / Groups Modal for Existing Meeting */}
      {activeMeetingForInvites && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border max-w-md w-full rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-bold text-sm text-foreground">Add People & Groups</h2>
                  <p className="text-[10px] text-muted-foreground truncate max-w-xs">{activeMeetingForInvites.title}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMeetingForInvites(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Optional Announcement */}
              <div className="p-3 bg-secondary/30 rounded-xl border border-border/60 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-foreground">Notify Chat Channel</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shouldNotifyOnAdd}
                    onChange={(e) => setShouldNotifyOnAdd(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>
                {shouldNotifyOnAdd && (
                  <select
                    value={addNotifyChannelId}
                    onChange={(e) => setAddNotifyChannelId(e.target.value)}
                    className="w-full bg-secondary border border-input text-foreground p-2 rounded-xl text-xs"
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Groups */}
              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium">
                  Select Channel Groups ({addInvitesGroups.length} selected)
                </label>

                {channels.length > 4 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={addGroupSearch}
                      onChange={(e) => setAddGroupSearch(e.target.value)}
                      placeholder="Search groups..."
                      className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {filteredAddGroups.map((c) => {
                    const tag = `#${c.name}`;
                    const isSelected = addInvitesGroups.includes(tag);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setAddInvitesGroups((prev) =>
                            prev.includes(tag) ? prev.filter((g) => g !== tag) : [...prev, tag]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-secondary text-foreground border-border hover:bg-secondary/80"
                        }`}
                      >
                        <Hash className="w-3 h-3" />
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team Members with Search */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-muted-foreground font-medium">
                    Search & Select Coworkers ({addInvitesUserIds.length} selected)
                  </label>
                  {addInvitesUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddInvitesUserIds([])}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={addMemberSearch}
                    onChange={(e) => setAddMemberSearch(e.target.value)}
                    placeholder="Search by name, email, or username..."
                    className="w-full pl-8 pr-3 py-2 bg-secondary border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {addMemberSearch && (
                    <button
                      type="button"
                      onClick={() => setAddMemberSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1 border border-border rounded-xl p-1.5 bg-secondary/30">
                  {filteredAddContacts.length === 0 ? (
                    <div className="text-muted-foreground text-[11px] p-2 text-center">
                      {addMemberSearch ? "No members found matching search" : "No contacts available"}
                    </div>
                  ) : (
                    filteredAddContacts.map((contact) => {
                      const isSelected = addInvitesUserIds.includes(contact.id);
                      return (
                        <label
                          key={contact.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="font-semibold text-foreground truncate text-xs">{contact.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{contact.email}</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setAddInvitesUserIds((prev) =>
                                prev.includes(contact.id)
                                  ? prev.filter((id) => id !== contact.id)
                                  : [...prev, contact.id]
                              );
                            }}
                            className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveMeetingForInvites(null)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInvites}
                  disabled={savingInvites}
                  className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {savingInvites ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{savingInvites ? "Saving..." : "Save Invites"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
