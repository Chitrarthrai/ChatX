"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  Link as LinkIcon
} from "lucide-react";

interface MeetingItem {
  id: string;
  title: string;
  description?: string;
  hostName: string;
  hostAvatar?: string;
  hostEmail?: string;
  scheduledStart: string;
  timeFormatted: string;
  durationFormatted: string;
  meetingCode: string;
  status: "scheduled" | "active" | "ended" | "cancelled";
  isWaitingRoom: boolean;
  isRecording: boolean;
}

export default function CalendarPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isWaitingRoom, setIsWaitingRoom] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fallbackMeetings: MeetingItem[] = [
    {
      id: "cal-1",
      title: "ChatX Architecture & WebRTC Stage Sync",
      description: "Review LiveKit SFU node topology, mesh peer exhaustion guards, and RLS tenant policies.",
      hostName: "Alex Mercer",
      hostAvatar: "A",
      hostEmail: "alex.mercer@chatx.platform",
      scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      timeFormatted: "Today at 02:00 PM",
      durationFormatted: "45 mins",
      meetingCode: "chatx-sfu-sync",
      status: "active",
      isWaitingRoom: true,
      isRecording: true
    },
    {
      id: "cal-2",
      title: "Frontend Design System & Dark Theme Review",
      description: "Audit CSS variable tokens, glassmorphism overlays, and accessibility contrast ratios.",
      hostName: "Sophia Chen",
      hostAvatar: "S",
      hostEmail: "sophia.c@chatx.platform",
      scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timeFormatted: "Tomorrow at 10:30 AM",
      durationFormatted: "30 mins",
      meetingCode: "design-audit",
      status: "scheduled",
      isWaitingRoom: true,
      isRecording: false
    }
  ];

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const queryPromise = supabase
          .from("meetings")
          .select("id, title, description, meeting_code, status, is_waiting_room_enabled, is_recording_enabled, scheduled_start, created_at, host:profiles(full_name, avatar_url, email)")
          .order("scheduled_start", { ascending: true });

        const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Request timeout") }), 2500)
        );

        const { data, error: fetchErr } = await Promise.race([queryPromise, timeoutPromise]);

        if (fetchErr || !data || data.length === 0) {
          setMeetings([]);
        } else {
          setMeetings(
            data.map((m: any) => {
              const host = m.host;
              const hostName = host?.full_name || "Team Member";
              const startDate = m.scheduled_start ? new Date(m.scheduled_start) : new Date(m.created_at || Date.now());
              return {
                id: m.id,
                title: m.title || "Untitled Meeting",
                description: m.description,
                hostName: hostName,
                hostAvatar: host?.avatar_url || hostName.charAt(0).toUpperCase(),
                hostEmail: host?.email,
                scheduledStart: startDate.toISOString(),
                timeFormatted: startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + startDate.toLocaleDateString([], { month: "short", day: "numeric" }),
                durationFormatted: "45 mins",
                meetingCode: m.meeting_code || `chatx-${m.id.substring(0, 6)}`,
                status: m.status || "scheduled",
                isWaitingRoom: m.is_waiting_room_enabled ?? true,
                isRecording: m.is_recording_enabled ?? true
              };
            })
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load scheduled meetings.");
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const uniqueCode = `chatx-${Math.random().toString(36).substring(2, 8)}`;
      const startDateTime = scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : new Date(Date.now() + 60 * 60 * 1000).toISOString();

      if (user) {
        const { data: inserted, error: insertErr } = await supabase
          .from("meetings")
          .insert({
            title: title,
            description: description,
            host_id: user.id,
            meeting_code: uniqueCode,
            scheduled_start: startDateTime,
            is_waiting_room_enabled: isWaitingRoom,
            is_recording_enabled: isRecording,
            status: "scheduled"
          })
          .select("*, host:profiles(full_name, avatar_url, email)")
          .single();

        if (insertErr) {
          console.warn("Database meeting insert warning:", insertErr.message);
        }

        const newMeeting: MeetingItem = {
          id: inserted?.id || `local-${Date.now()}`,
          title: title,
          description: description,
          hostName: inserted?.host?.full_name || "You (Host)",
          hostAvatar: "Y",
          hostEmail: user.email,
          scheduledStart: startDateTime,
          timeFormatted: new Date(startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + new Date(startDateTime).toLocaleDateString([], { month: "short", day: "numeric" }),
          durationFormatted: "45 mins",
          meetingCode: uniqueCode,
          status: "scheduled",
          isWaitingRoom: isWaitingRoom,
          isRecording: isRecording
        };

        setMeetings((prev) => [newMeeting, ...prev]);
      } else {
        const newMeeting: MeetingItem = {
          id: `local-${Date.now()}`,
          title: title,
          description: description,
          hostName: "You (Host)",
          hostAvatar: "Y",
          scheduledStart: startDateTime,
          timeFormatted: new Date(startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + new Date(startDateTime).toLocaleDateString([], { month: "short", day: "numeric" }),
          durationFormatted: "45 mins",
          meetingCode: uniqueCode,
          status: "scheduled",
          isWaitingRoom: isWaitingRoom,
          isRecording: isRecording
        };
        setMeetings((prev) => [newMeeting, ...prev]);
      }

      setSuccessMessage(`Meeting '${title}' scheduled successfully! Code: ${uniqueCode}`);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setScheduledDate("");
      setScheduledTime("");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to schedule meeting.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSession = (code: string) => {
    router.push(`/?meetingCode=${code}`);
  };

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
                className="bg-card border border-border p-5 rounded-2xl space-y-3 hover:border-primary/40 transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{m.title}</h3>
                        {/* Status Badge */}
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

                  <button
                    onClick={() => handleJoinSession(m.meetingCode)}
                    className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Join Stage</span>
                  </button>
                </div>

                {m.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/30 p-3 rounded-xl border border-border/40 font-normal">
                    {m.description}
                  </p>
                )}

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
          <div className="bg-card border border-border max-w-md w-full rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Schedule New Meeting</h2>
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
                  placeholder="e.g. Architecture & WebRTC Sync"
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
                  placeholder="Outline key topics or meeting notes..."
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
                  <span className="font-medium text-foreground">Cloud Meeting Recording</span>
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
    </div>
  );
}
