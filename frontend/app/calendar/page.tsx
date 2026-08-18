"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  List,
  CalendarRange
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

type CalendarViewMode = "day" | "month" | "week" | "list";

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
  const [mounted, setMounted] = useState(false);

  // View Mode & Selected Date State
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Quick Open Modal with pre-filled Hour Slot
  const handleSlotClick = (hour: number) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    setScheduledDate(dateStr);
    setScheduledTime(timeStr);
    setTitle(`${formatHourLabel(hour)} Team Sync`);
    setIsModalOpen(true);
  };

  // Date Navigation Helpers
  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour.toString().padStart(2, "0")}:00 ${period}`;
  };

  // Filter meetings for the active day
  const dayMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (!m.scheduledStart) return false;
      const mDate = new Date(m.scheduledStart);
      return isSameDay(mDate, selectedDate);
    });
  }, [meetings, selectedDate]);

  // Group day meetings by 24 hours (0..23)
  const hourlyMeetings = useMemo(() => {
    const map: Record<number, MeetingItem[]> = {};
    for (let h = 0; h < 24; h++) {
      map[h] = [];
    }
    dayMeetings.forEach((m) => {
      const h = new Date(m.scheduledStart).getHours();
      if (map[h]) map[h].push(m);
    });
    return map;
  }, [dayMeetings]);

  // Month Grid Calculations
  const monthData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Leading empty/prev month days
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDaysCount - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Trailing next month days to fill 5 or 6 rows (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  }, [selectedDate]);

  // Week Grid Calculations (7 days for the active week)
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay(); // 0 = Sun
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [selectedDate]);

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

  const currentHourNow = new Date().getHours();
  const isTodayActive = isSameDay(selectedDate, new Date());

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Go Back to Workspace"
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

        {/* View Mode Toggle & Schedule Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border text-xs">
            <button
              onClick={() => setViewMode("day")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "day"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="24-Hour Hourly Timeline View"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day (24h)</span>
            </button>

            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Monthly Calendar Grid"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>

            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "week"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="7-Day Weekly Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Full Agenda List"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => {
              const now = new Date();
              setScheduledDate(selectedDate.toISOString().split("T")[0]);
              setScheduledTime(`${(now.getHours() + 1).toString().padStart(2, "0")}:00`);
              setIsModalOpen(true);
            }}
            className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </header>

      {/* Date Navigation & Stepper Toolbar (for Day, Month, and Week views) */}
      <div className="bg-card/40 border-b border-border/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextDay}
            className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isTodayActive
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            Today
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Formatted Date Title */}
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <h2 className="font-bold text-sm text-foreground" suppressHydrationWarning>
              {mounted
                ? viewMode === "month"
                  ? selectedDate.toLocaleDateString([], { month: "long", year: "numeric" })
                  : selectedDate.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" })
                : "Calendar View"}
            </h2>
            {isTodayActive && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </div>
        </div>

        {/* Quick Date Picker / Stats */}
        <div className="flex items-center gap-3 text-xs" suppressHydrationWarning>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarRange className="w-3.5 h-3.5 text-primary" />
            <span>
              <strong className="text-foreground">{dayMeetings.length}</strong> {dayMeetings.length === 1 ? "meeting" : "meetings"} scheduled for this date
            </span>
          </div>

          <input
            type="date"
            value={mounted ? selectedDate.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setSelectedDate(new Date(y, m - 1, d));
              }
            }}
            className="bg-secondary border border-input rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
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
        ) : (
          <>
            {/* VIEW MODE 1: DAY 24-HOUR TIMELINE VIEW */}
            {viewMode === "day" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* 24-Hour Timeline Grid Container */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border/60">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const meetingsAtHour = hourlyMeetings[hour] || [];
                    const isCurrentHourSlot = isTodayActive && currentHourNow === hour;

                    return (
                      <div
                        key={hour}
                        className={`flex items-start gap-4 p-3 transition-colors ${
                          isCurrentHourSlot
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : "hover:bg-secondary/30"
                        }`}
                      >
                        {/* Hour Label Column */}
                        <div className="w-24 shrink-0 pt-1 flex flex-col items-start">
                          <span className={`text-xs font-mono font-bold ${isCurrentHourSlot ? "text-primary" : "text-foreground/80"}`}>
                            {formatHourLabel(hour)}
                          </span>
                          {isCurrentHourSlot && (
                            <span className="text-[9px] font-extrabold uppercase bg-primary text-primary-foreground px-1.5 py-0.2 rounded mt-0.5">
                              NOW
                            </span>
                          )}
                        </div>

                        {/* Meetings or Empty Slot Column */}
                        <div className="flex-1 space-y-2">
                          {meetingsAtHour.length > 0 ? (
                            meetingsAtHour.map((m) => (
                              <div
                                key={m.id}
                                className="bg-secondary/70 hover:bg-secondary border border-border p-4 rounded-xl space-y-3 transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/20 text-primary rounded-xl border border-primary/30 shrink-0">
                                      <Video className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-foreground">{m.title}</h4>
                                        <span
                                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                            m.status === "active"
                                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 animate-pulse"
                                              : "bg-primary/10 text-primary border-primary/30"
                                          }`}
                                        >
                                          {m.status === "active" ? "LIVE NOW" : "SCHEDULED"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                        <span className="flex items-center gap-1 font-medium text-foreground/90">
                                          <Clock className="w-3 h-3 text-primary" />
                                          <span>{m.timeFormatted} ({m.durationFormatted})</span>
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          <span>Host: {m.hostName}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handlePostToChat(m)}
                                      disabled={broadcastingId === m.id}
                                      className="bg-card border border-border text-foreground hover:bg-secondary text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                      title="Post invite card to channel"
                                    >
                                      {broadcastingId === m.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Send className="w-3 h-3 text-primary" />
                                      )}
                                      <span>Post</span>
                                    </button>

                                    <button
                                      onClick={() => handleCopyLink(m.meetingCode)}
                                      className="bg-card border border-border text-foreground hover:bg-secondary text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                      title="Copy meeting join link"
                                    >
                                      {copiedCode === m.meetingCode ? (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-muted-foreground" />
                                      )}
                                      <span>{copiedCode === m.meetingCode ? "Copied" : "Link"}</span>
                                    </button>

                                    <button
                                      onClick={() => handleJoinSession(m.meetingCode)}
                                      className="bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                      <Radio className="w-3 h-3" />
                                      <span>Join Stage</span>
                                    </button>

                                    <button
                                      onClick={() => handleDelete(m.id)}
                                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                      title="Cancel meeting"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {m.description && (
                                  <p className="text-[11px] text-muted-foreground leading-relaxed bg-card/60 p-2.5 rounded-lg border border-border/50">
                                    {m.description}
                                  </p>
                                )}

                                {/* Participants Row */}
                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {(m.invitedGroups || []).map((grp, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium px-2 py-0.5 rounded-full"
                                      >
                                        <Hash className="w-2.5 h-2.5" />
                                        <span>{grp}</span>
                                      </span>
                                    ))}
                                    {(m.participants || []).map((p) => (
                                      <span
                                        key={p.id}
                                        className="inline-flex items-center gap-1 bg-card text-foreground border border-border text-[10px] font-medium px-2 py-0.5 rounded-full"
                                      >
                                        <span className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary text-[8px] flex items-center justify-center font-bold">
                                          {p.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span>{p.name}</span>
                                      </span>
                                    ))}
                                  </div>

                                  <button
                                    onClick={() => handleOpenAddInvites(m)}
                                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    <span>+ Add People</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            /* Empty Hour Slot with Quick Schedule on Click */
                            <button
                              type="button"
                              onClick={() => handleSlotClick(hour)}
                              className="w-full h-9 rounded-xl border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-between px-3 text-muted-foreground/60 hover:text-primary transition-all text-xs group"
                            >
                              <span className="text-[11px] group-hover:font-semibold">
                                + Schedule meeting at {formatHourLabel(hour)}
                              </span>
                              <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW MODE 2: MONTHLY CALENDAR GRID VIEW */}
            {viewMode === "month" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 text-center font-semibold text-xs text-muted-foreground border-b border-border pb-2.5">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="uppercase tracking-wider text-[11px]">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Cells Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {monthData.map(({ date, isCurrentMonth }, idx) => {
                      const dayEvents = meetings.filter((m) => {
                        if (!m.scheduledStart) return false;
                        return isSameDay(new Date(m.scheduledStart), date);
                      });

                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, new Date());

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedDate(date);
                            setViewMode("day");
                          }}
                          className={`min-h-[100px] p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-sm"
                              : isToday
                              ? "bg-secondary/80 border-emerald-500/50"
                              : isCurrentMonth
                              ? "bg-secondary/40 border-border hover:border-primary/40 hover:bg-secondary/70"
                              : "bg-card/30 border-border/30 opacity-40 hover:opacity-80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                                isToday
                                  ? "bg-emerald-500 text-black font-extrabold"
                                  : isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {date.getDate()}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full">
                                {dayEvents.length}
                              </span>
                            )}
                          </div>

                          {/* Meeting Event Chips Preview */}
                          <div className="space-y-1 my-1">
                            {dayEvents.slice(0, 2).map((evt) => (
                              <div
                                key={evt.id}
                                className="bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded text-[10px] font-semibold truncate"
                                title={`${evt.title} (${evt.timeFormatted})`}
                              >
                                {evt.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-[9px] text-muted-foreground font-medium">
                                +{dayEvents.length - 2} more
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] text-muted-foreground hover:text-primary font-medium transition-colors">
                            {dayEvents.length > 0 ? "View 24h schedule →" : "+ Schedule"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: WEEKLY 7-DAY SCHEDULE GRID */}
            {viewMode === "week" && (
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm overflow-x-auto animate-in fade-in duration-200">
                <div className="min-w-[700px] space-y-3">
                  {/* Week Days Header Row */}
                  <div className="grid grid-cols-7 gap-2 text-center border-b border-border pb-3">
                    {weekDays.map((d, i) => {
                      const isSelected = isSameDay(d, selectedDate);
                      const isToday = isSameDay(d, new Date());
                      const dayEventsCount = meetings.filter((m) => m.scheduledStart && isSameDay(new Date(m.scheduledStart), d)).length;

                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setSelectedDate(d);
                            setViewMode("day");
                          }}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : isToday
                              ? "bg-emerald-500/10 border-emerald-500/40"
                              : "bg-secondary/40 border-border hover:bg-secondary"
                          }`}
                        >
                          <div className="text-[11px] font-bold uppercase text-muted-foreground">
                            {d.toLocaleDateString([], { weekday: "short" })}
                          </div>
                          <div className={`text-base font-extrabold ${isToday ? "text-emerald-500" : isSelected ? "text-primary" : "text-foreground"}`}>
                            {d.getDate()}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            {dayEventsCount} {dayEventsCount === 1 ? "meeting" : "meetings"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Hourly Rows in Week Grid */}
                  <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="grid grid-cols-7 gap-2 items-center text-xs py-1 border-b border-border/40">
                        {weekDays.map((d, dayIdx) => {
                          const evts = meetings.filter((m) => {
                            if (!m.scheduledStart) return false;
                            const mDate = new Date(m.scheduledStart);
                            return isSameDay(mDate, d) && mDate.getHours() === hour;
                          });

                          return (
                            <div key={dayIdx} className="min-h-[38px] p-1">
                              {evts.length > 0 ? (
                                evts.map((evt) => (
                                  <div
                                    key={evt.id}
                                    onClick={() => {
                                      setSelectedDate(d);
                                      setViewMode("day");
                                    }}
                                    className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold truncate cursor-pointer hover:opacity-90"
                                    title={`${evt.title} (${evt.timeFormatted})`}
                                  >
                                    {evt.title}
                                  </div>
                                ))
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(d);
                                    handleSlotClick(hour);
                                  }}
                                  className="w-full h-full rounded border border-transparent hover:border-dashed hover:border-border text-[9px] text-muted-foreground/30 hover:text-muted-foreground flex items-center justify-center"
                                >
                                  {formatHourLabel(hour)}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 4: FULL AGENDA LIST VIEW */}
            {viewMode === "list" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {meetings.length === 0 ? (
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
                  meetings.map((m) => (
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
                                    : "bg-primary/10 text-primary border-primary/30"
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
                          {(m.invitedGroups || []).map((grp, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium px-2 py-0.5 rounded-full"
                            >
                              <Hash className="w-2.5 h-2.5" />
                              <span>{grp}</span>
                            </span>
                          ))}
                          {(m.participants || []).map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border text-[10px] font-medium px-2 py-0.5 rounded-full"
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-primary/20 text-primary text-[8px] flex items-center justify-center font-bold">
                                {p.name.charAt(0).toUpperCase()}
                              </span>
                              <span>{p.name}</span>
                            </span>
                          ))}
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
                  ))
                )}
              </div>
            )}
          </>
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
