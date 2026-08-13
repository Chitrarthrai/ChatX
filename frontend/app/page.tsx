"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth-provider";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ChannelDialog } from "@/components/teams/channel-dialog";
import { ProfileDialog } from "@/components/profile/profile-dialog";
import { PollDialog } from "@/components/chat/poll-dialog";
import { LockDialog } from "@/components/chat/lock-dialog";
import { ThreadDrawer } from "@/components/chat/thread-drawer";
import { AIDrawer } from "@/components/ai/ai-drawer";
import { MessageItem } from "@/components/chat/message-item";
import { signOut } from "@/services/auth";
import { fetchChannels, createChannel, fetchProfilesDirectory } from "@/services/channels";
import { sendMessage, subscribeToMessages, fetchMessages, markMessagesAsRead } from "@/services/messages";
import type { ChannelType, Message } from "@chatx/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import {
  MessageSquare,
  Video,
  Users,
  Hash,
  Sparkles,
  PhoneCall,
  FolderLock,
  Calendar,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  VideoOff,
  ShieldCheck,
  ChevronRight,
  Pin,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  X,
  Copy,
  Check,
  Hand,
  Monitor,
  PhoneOff,
  Plus,
  User,
  BarChart2,
  HardDrive,
  Shield,
  Globe,
  Maximize2,
  Archive
} from "lucide-react";
import { LandingPage } from "@/components/landing-page";
import { SiteTour } from "@/components/site-tour";
import { DeviceSettingsDialog } from "@/components/meetings/device-settings-dialog";
import { TypingIndicator } from "@/components/chat/typing-indicator";

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const { user, profile, clearLocalUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "teams" | "meetings" | "ai">("messages");
  const [selectedChat, setSelectedChat] = useState("Architecture & Engineering");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("chatx_view_mode");
      if (user || savedMode === "workspace_preview") {
        setViewMode("workspace");
      } else {
        setViewMode("landing");
      }
    }
  }, [user]);

  const handleEnterWorkspace = () => {
    setViewMode("workspace");
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_view_mode", "workspace");
    }
  };

  const handleGoToLanding = () => {
    setViewMode("landing");
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_view_mode", "landing");
    }
  };

  const handleSignOut = async () => {
    clearLocalUser();
    try {
      await signOut();
    } catch (err) {
      console.warn("Sign out:", err);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_view_mode", "landing");
    }
    setIsAuthOpen(false);
    setViewMode("landing");
  };

  // Draft persistence per channel
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(`chatx_draft_${selectedChat}`);
      setMessageInput(savedDraft || "");
    }
  }, [selectedChat]);

  const handleMessageInputChange = (val: string) => {
    setMessageInput(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(`chatx_draft_${selectedChat}`, val);
    }
  };

  const [channels, setChannels] = useState<{ name: string; topic: string; type: ChannelType; locked: boolean }[]>([]);
  const [directMessages, setDirectMessages] = useState<{ name: string; status: "online" | "away" | "dnd" | "offline"; role: string }[]>([]);

  useEffect(() => {
    fetchChannels().then((data) => {
      setChannels(data);
    });
    fetchProfilesDirectory().then((profs) => {
      setDirectMessages(profs.map((p) => ({ name: p.name, status: p.status, role: p.role })));
    });
  }, []);

  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({
    "Architecture & Engineering": [
      {
        id: "1",
        conversationId: "c1",
        senderId: "u1",
        content: "Database migrations and RLS policies for tenant isolation have been configured in backend/supabase/migrations. All media streaming will run through the SFU boundary.",
        type: "text",
        isEdited: false,
        isPinned: true,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: "u1",
          email: "alex@chatx.platform",
          username: "alexm",
          fullName: "Alex Mercer",
          status: "online",
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        id: "2",
        conversationId: "c1",
        senderId: "u2",
        content: "Theme variables from color-system.md are now bound globally to Next.js Tailwind and shared via TypeScript to React Native.",
        type: "text",
        isEdited: false,
        isPinned: false,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: "u2",
          email: "user@chatx.platform",
          username: "you",
          fullName: "You",
          status: "online",
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ],
  });

  const handleCreateChannel = async (newChannel: { name: string; topic: string; type: ChannelType; isPrivate: boolean }) => {
    const created = await createChannel(newChannel.name, newChannel.topic, newChannel.type, newChannel.isPrivate);
    setChannels((prev) => [...prev, created]);
    setSelectedChat(created.name);
  };

  const handleCreatePoll = (poll: { question: string; options: string[]; isMultipleChoice: boolean; isAnonymous: boolean }) => {
    const pollMsg: Message = {
      id: Date.now().toString(),
      conversationId: "c1",
      senderId: user?.id || "u2",
      content: `📊 POLL: ${poll.question}\nOptions: ${poll.options.join(" | ")}`,
      type: "poll",
      isEdited: false,
      isPinned: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: user?.id || "u2",
        email: user?.email || "user@chatx.platform",
        username: profile?.username || "you",
        fullName: profile?.fullName || user?.email || "You",
        status: profile?.status || "online",
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), pollMsg],
    }));
  };

  const handleConfirmLockState = (pin: string, lock: boolean) => {
    setChannels((prev) =>
      prev.map((c) => (c.name === selectedChat ? { ...c, locked: lock } : c))
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const contentText = messageInput.trim();
    if (!contentText) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      conversationId: "00000000-0000-0000-0000-000000000001",
      senderId: user?.id || "u2",
      content: contentText,
      type: "text",
      isEdited: false,
      isPinned: false,
      isLocked: false,
      status: "sent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: user?.id || "u2",
        email: user?.email || "user@chatx.platform",
        username: profile?.username || "you",
        fullName: profile?.fullName || user?.email || "You",
        status: profile?.status || "online",
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }));

    // Dispatch realtime insert to Supabase backend
    sendMessage(
      { conversationId: "00000000-0000-0000-0000-000000000001", content: contentText, type: "text" },
      user?.id || "985d80d9-de69-4322-9945-d7df9c362105"
    ).then((sentMsg) => {
      // Simulate recipient delivery & read progression
      setTimeout(() => {
        setMessagesByChannel((prev) => ({
          ...prev,
          [selectedChat]: (prev[selectedChat] || []).map((m) =>
            m.id === newMsg.id ? { ...m, status: "delivered" } : m
          ),
        }));
      }, 1200);

      setTimeout(() => {
        setMessagesByChannel((prev) => ({
          ...prev,
          [selectedChat]: (prev[selectedChat] || []).map((m) =>
            m.id === newMsg.id ? { ...m, status: "read" } : m
          ),
        }));
      }, 2500);
    }).catch((err) => console.warn("Supabase realtime message insert info:", err));

    setMessageInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(`chatx_draft_${selectedChat}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const attachmentMsg: Message = {
      id: Date.now().toString(),
      conversationId: "c1",
      senderId: user?.id || "u2",
      content: `📎 Attached File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      type: "document",
      isEdited: false,
      isPinned: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: user?.id || "u2",
        email: user?.email || "user@chatx.platform",
        username: profile?.username || "you",
        fullName: profile?.fullName || user?.email || "You",
        status: profile?.status || "online",
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    setMessagesByChannel((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), attachmentMsg],
    }));
  };

  const handleVoiceRecord = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceMsg: Message = {
        id: Date.now().toString(),
        conversationId: "c1",
        senderId: user?.id || "u2",
        content: `🎙️ Voice Note (0:14) — Audio stream recorded and attached`,
        type: "text",
        isEdited: false,
        isPinned: false,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: user?.id || "u2",
          email: user?.email || "user@chatx.platform",
          username: profile?.username || "you",
          fullName: profile?.fullName || user?.email || "You",
          status: profile?.status || "online",
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      setMessagesByChannel((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), voiceMsg],
      }));
    }, 1500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://chatx.platform/meet/chatx-demo-room`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentMessages = messagesByChannel[selectedChat] || [];
  const currentChannelInfo = channels.find((c) => c.name === selectedChat);

  if (viewMode === "landing") {
    return (
      <>
        <AuthDialog
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode={authMode}
          onSuccessLogin={() => handleEnterWorkspace()}
        />
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthMode(mode || "login");
            setIsAuthOpen(true);
          }}
          onEnterApp={handleEnterWorkspace}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground relative">
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
        onSuccessLogin={() => handleEnterWorkspace()}
      />
      <SiteTour />
      <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <ChannelDialog
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
      <PollDialog
        isOpen={isPollOpen}
        onClose={() => setIsPollOpen(false)}
        onCreatePoll={handleCreatePoll}
      />
      <LockDialog
        isOpen={isLockOpen}
        conversationTitle={`#${selectedChat}`}
        isCurrentlyLocked={!!currentChannelInfo?.locked}
        onClose={() => setIsLockOpen(false)}
        onConfirmLockState={handleConfirmLockState}
      />
      <DeviceSettingsDialog
        isOpen={isDeviceSettingsOpen}
        onClose={() => setIsDeviceSettingsOpen(false)}
      />

      {/* Instant Video Meeting Modal Overlay */}
      {isMeetingActive && (
        <div className="fixed inset-0 z-50 meeting-stage-dark flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <h2 className="text-white font-semibold text-sm">Live Meeting: ChatX Architecture Sync</h2>
              <span className="text-xs bg-neutral-800 text-gray-300 px-2 py-0.5 rounded font-mono">08:45</span>
              <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>24 ms • SFU HD Stream</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded-lg border border-neutral-700 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied" : "Copy Link"}</span>
              </button>
              <button
                onClick={() => setIsMeetingActive(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 my-6 items-center justify-center max-w-5xl mx-auto w-full">
            <div className="relative aspect-video bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-primary/30 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary">
                AM
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs flex items-center gap-2">
                <span>Alex Mercer (Host)</span>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
            </div>

            <div className="relative aspect-video bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center shadow-2xl">
              {isVideoOff ? (
                <div className="w-20 h-20 rounded-full bg-neutral-800 text-gray-400 flex items-center justify-center text-2xl font-bold">
                  {(profile?.fullName || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center text-gray-500 text-xs">
                  Camera Feed Active
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs flex items-center gap-2">
                <span>{profile?.fullName || "You"}</span>
                {isMuted && <MicOff className="w-3.5 h-3.5 text-destructive" />}
                {isHandRaised && <Hand className="w-3.5 h-3.5 text-warning" />}
              </div>
            </div>
          </div>

          {/* Lobby Waiting Room Admission Banner */}
          <div className="z-10 mx-auto w-full max-w-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span><strong>Sarah Jenkins</strong> is waiting in the meeting lobby</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => alert("Admitted Sarah Jenkins to meeting")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] px-3 py-1 rounded-lg transition-all">
                Admit
              </button>
              <button onClick={() => alert("Declined entry")} className="bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-semibold text-[11px] px-3 py-1 rounded-lg transition-all">
                Decline
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 z-10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition-all ${
                isMuted ? "bg-destructive text-destructive-foreground" : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3.5 rounded-full transition-all ${
                isVideoOff ? "bg-destructive text-destructive-foreground" : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
              title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`p-3.5 rounded-full transition-all ${
                isHandRaised ? "bg-warning text-warning-foreground" : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
              title="Raise Hand"
            >
              <Hand className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsDeviceSettingsOpen(true)}
              className="p-3.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-full transition-all"
              title="Audio & Video Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (document.pictureInPictureElement) {
                  document.exitPictureInPicture();
                } else {
                  alert("Picture-in-Picture mode activated");
                }
              }}
              className="p-3.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-full transition-all"
              title="Toggle Picture-in-Picture Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            <button className="p-3.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-full transition-all" title="Share Screen">
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsMeetingActive(false)}
              className="p-3.5 bg-destructive text-destructive-foreground hover:opacity-90 rounded-full font-bold px-6 flex items-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Sidebar Navigation */}
      <aside className="flex flex-col items-center w-16 py-4 bg-card border-r border-border justify-between z-20">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
            X
          </div>

          <nav className="flex flex-col gap-3">
            <button
              onClick={() => setActiveTab("messages")}
              title="Messages"
              className={`relative p-2.5 rounded-lg transition-all ${
                activeTab === "messages"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <Link
              href="/calendar"
              title="Calendar & Scheduled Meetings"
              className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <Calendar className="w-5 h-5" />
            </Link>

            <Link
              href="/recordings"
              title="Cloud Meeting Recordings"
              className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <HardDrive className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
              title="AI Assistant"
              className={`p-2.5 rounded-lg transition-all ${
                isAIDrawerOpen
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <Link
              href="/admin"
              title="Admin & Security Console"
              className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <Shield className="w-5 h-5" />
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            title="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleGoToLanding}
            className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Landing Page"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Edit Profile"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Sign Out / Exit Workspace"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Secondary Sidebar Channel List */}
      <aside className="w-72 bg-card/60 backdrop-blur-md border-r border-border flex flex-col z-10">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg tracking-tight">ChatX Workspace</h2>
          <Link href="/notifications" title="Notifications" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="p-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages, channels, AI..."
              className="w-full bg-secondary/80 text-foreground placeholder:text-muted-foreground text-xs rounded-md pl-9 pr-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </form>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Channels</span>
              <button
                onClick={() => setIsCreateChannelOpen(true)}
                title="Create Channel"
                className="p-1 hover:bg-secondary rounded text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((ch) => (
                <button
                  key={ch.name}
                  onClick={() => setSelectedChat(ch.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                    selectedChat === ch.name
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {ch.locked ? <Lock className="w-3.5 h-3.5 text-warning" /> : <Hash className="w-3.5 h-3.5" />}
                    <span className="truncate">{ch.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Direct Messages</span>
              <Link
                href="/contacts"
                title="Add Direct Message / Directory"
                className="p-1 hover:bg-secondary rounded text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-1">
              {directMessages.map((dm) => (
                <button
                  key={dm.name}
                  onClick={() => setSelectedChat(dm.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                    selectedChat === dm.name
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                        {dm.name.charAt(0)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-card ${
                          dm.status === "online"
                            ? "bg-success"
                            : dm.status === "away"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col text-left truncate">
                      <span className="truncate font-medium text-foreground">{dm.name}</span>
                      <span className="text-[10px] text-muted-foreground">{dm.role}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center justify-between p-3 border-t border-border">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 truncate hover:opacity-80 transition-opacity text-left"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">
                  {(profile?.fullName || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-semibold text-foreground truncate">
                  {profile?.fullName || user.email}
                </span>
                <span className="text-[10px] text-success font-medium">Supabase Auth Active</span>
              </div>
            </button>
            <button
              onClick={handleSignOut}
              title="Sign Out / Exit"
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-border flex items-center justify-between gap-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-3 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Auth</span>
            </button>
            <button
              onClick={handleSignOut}
              title="Sign Out / Exit Workspace"
              className="p-2 bg-secondary hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all flex items-center gap-1 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Feed */}
      <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
        <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/30">
          <div className="flex items-center gap-3">
            {currentChannelInfo?.locked ? (
              <Lock className="w-5 h-5 text-warning" />
            ) : (
              <Hash className="w-5 h-5 text-primary" />
            )}
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
                <span>{selectedChat}</span>
                {currentChannelInfo?.locked && (
                  <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20 font-medium">
                    PIN Protected
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {currentChannelInfo?.topic || "Monorepo architecture, WebRTC SFU integration, Supabase RLS policies"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLockOpen(true)}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-md"
              title={currentChannelInfo?.locked ? "Unlock Channel" : "Lock Channel with PIN"}
            >
              {currentChannelInfo?.locked ? (
                <Lock className="w-4 h-4 text-warning" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsPollOpen(true)}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-md"
              title="Create Channel Poll"
            >
              <BarChart2 className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={() => {
                alert(`Archived channel #${selectedChat}`);
              }}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-md"
              title="Archive Conversation"
            >
              <Archive className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsMeetingActive(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium hover:opacity-90 shadow-sm transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Start Instant Meeting</span>
            </button>
          </div>
        </header>

        {/* Dynamic Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-foreground">Supabase Realtime & Auth Integration Active</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Supabase backend service layer configured with SSR auth helpers, real-time message streams, presence tracking, and RLS multi-tenant policies.
              </p>
            </div>
          </div>

          {currentMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isSelf={msg.senderId === user?.id || msg.sender?.fullName === "You"}
              onReplyToThread={(m) => setActiveThreadMessage(m)}
            />
          ))}
          <TypingIndicator />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card/30">
          <div className="bg-card border border-input rounded-lg p-2 focus-within:ring-1 focus-within:ring-ring transition-all">
            {showEmojiPicker && (
              <div className="flex items-center gap-1.5 p-2 bg-secondary rounded-lg border border-border text-xs mb-2 animate-in fade-in duration-150">
                {["👍", "🚀", "🔥", "❤️", "🎉", "💯", "✅", "🙌"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      handleMessageInputChange(messageInput + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1 hover:bg-accent rounded text-base transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={2}
              value={messageInput}
              onChange={(e) => handleMessageInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder={isRecordingVoice ? "🎙️ Recording audio message..." : `Message #${selectedChat}... (Press Enter to send)`}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button type="button" onClick={() => setIsPollOpen(true)} className="p-1 hover:bg-secondary rounded text-muted-foreground" title="Create Poll"><BarChart2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1 hover:bg-secondary rounded text-muted-foreground" title="Attach File"><Paperclip className="w-4 h-4" /></button>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 hover:bg-secondary rounded text-muted-foreground" title="Add Quick Emoji"><Smile className="w-4 h-4" /></button>
                <button type="button" onClick={handleVoiceRecord} className={`p-1 rounded transition-all ${isRecordingVoice ? "bg-destructive text-white animate-pulse" : "hover:bg-secondary text-muted-foreground"}`} title="Record Voice Note"><Mic className="w-4 h-4" /></button>
              </div>
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="bg-primary text-primary-foreground p-1.5 rounded-md hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Slide-Out Thread Drawer when replying to a message */}
      {activeThreadMessage && (
        <ThreadDrawer
          parentMessage={activeThreadMessage}
          onClose={() => setActiveThreadMessage(null)}
        />
      )}

      {/* Slide-Out AI Assistant Drawer */}
      {isAIDrawerOpen && !activeThreadMessage && (
        <AIDrawer
          isOpen={isAIDrawerOpen}
          onClose={() => setIsAIDrawerOpen(false)}
        />
      )}

      {/* Right Intelligence Panel */}
      {!activeThreadMessage && !isAIDrawerOpen && (
        <aside className="w-80 border-l border-border bg-card/40 flex flex-col justify-between hidden lg:flex z-10">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Workspace Intelligence</span>
              </h3>
              <button
                onClick={() => setIsAIDrawerOpen(true)}
                className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium hover:opacity-80"
              >
                Open Chat
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
            <div
              onClick={() => setIsMeetingActive(true)}
              className="meeting-stage-dark p-3 rounded-xl border border-border shadow-md space-y-2 cursor-pointer hover:border-primary transition-all"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span>Live SFU Stage</span>
                </div>
                <span className="text-[10px] text-gray-400">Join Stage</span>
              </div>
              <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white font-medium">Alex Mercer (Host)</span>
                </div>
              </div>
            </div>

            <div className="bg-card p-3 rounded-lg border border-border space-y-2">
              <h4 className="font-semibold text-foreground text-xs">Permission-Aware Search</h4>
              <p className="text-muted-foreground text-[11px]">
                Ask questions across chats, transcripts, and documents. RLS policies guarantee data privacy.
              </p>
              <div
                onClick={() => setIsAIDrawerOpen(true)}
                className="bg-secondary p-2 rounded text-[11px] text-primary flex items-center justify-between cursor-pointer hover:bg-accent"
              >
                <span>"What are the Phase 1 deliverables?"</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-card/60">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Supabase RLS & Session Guard Active</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
