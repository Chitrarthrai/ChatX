"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
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
  CheckCheck
} from "lucide-react";

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"messages" | "teams" | "meetings" | "ai">("messages");
  const [selectedChat, setSelectedChat] = useState("Architecture & Engineering");
  const [messageInput, setMessageInput] = useState("");

  const navigationItems = [
    { id: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
    { id: "teams", label: "Teams & Channels", icon: Users },
    { id: "meetings", label: "Meetings", icon: Video, activeIndicator: true },
    { id: "calls", label: "Calls", icon: PhoneCall },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "ai", label: "AI Assistant", icon: Sparkles, highlight: true },
    { id: "archived", label: "Archived & Locked", icon: FolderLock },
  ];

  const channels = [
    { name: "Architecture & Engineering", unread: 2, locked: false, isChannel: true },
    { name: "Frontend & Design System", unread: 0, locked: false, isChannel: true },
    { name: "WebRTC Infrastructure", unread: 0, locked: true, isChannel: true },
  ];

  const directMessages = [
    { name: "Alex Mercer (Tech Lead)", status: "online", role: "Principal Architect", unread: 1 },
    { name: "Sophia Chen (AI Ops)", status: "away", role: "AI Engineer", unread: 0 },
    { name: "Marcus Vance (DevOps)", status: "dnd", role: "Infrastructure", unread: 0 },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Primary Sidebar (Navigation Bar) */}
      <aside className="flex flex-col items-center w-16 py-4 bg-card border-r border-border justify-between z-20">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
            X
          </div>

          <nav className="flex flex-col gap-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={item.label}
                  className={`relative p-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Secondary Sidebar (Conversation / Channel List) */}
      <aside className="w-72 bg-card/60 backdrop-blur-md border-r border-border flex flex-col z-10">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg tracking-tight">ChatX Workspace</h2>
          <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {/* Global Search Input */}
        <div className="p-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages, channels, AI..."
              className="w-full bg-secondary/80 text-foreground placeholder:text-muted-foreground text-xs rounded-md pl-9 pr-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Channels</span>
              <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">3</span>
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
                  {ch.unread > 0 && (
                    <span className="w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                      {ch.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Direct Messages</span>
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

        {/* User Status Bar */}
        <div className="p-3 border-t border-border bg-card/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">
                CU
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground">Current User</span>
              <span className="text-[10px] text-success font-medium">Online (WCAG AA)</span>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
      </aside>

      {/* Main Chat & Workspace Content Area */}
      <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Chat Header */}
        <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/30">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-foreground">{selectedChat}</h1>
              <p className="text-[11px] text-muted-foreground">
                Monorepo architecture, WebRTC SFU integration, Supabase RLS policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium hover:opacity-90 shadow-sm transition-all">
              <Video className="w-3.5 h-3.5" />
              <span>Start Instant Meeting</span>
            </button>
            <button className="p-2 text-muted-foreground hover:bg-secondary rounded-md">
              <Pin className="w-4 h-4" />
            </button>
            <button className="p-2 text-muted-foreground hover:bg-secondary rounded-md">
              <Sparkles className="w-4 h-4 text-primary" />
            </button>
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Announcement Card */}
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-foreground">Phase 1 Monorepo Foundation Active</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ChatX architecture initialized with Next.js App Router, Expo React Native, Supabase RLS schemas, and desaturated WCAG AA slate/indigo palette tokens.
              </p>
            </div>
          </div>

          {/* Sample Chat Messages */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-xs">
              AM
            </div>
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Alex Mercer</span>
                <span className="text-[10px] text-muted-foreground">10:42 AM</span>
              </div>
              <div className="bg-secondary p-3 rounded-lg text-xs text-foreground leading-relaxed">
                Database migrations and RLS policies for tenant isolation have been configured in <code className="bg-background px-1 py-0.5 rounded text-primary">backend/supabase/migrations</code>. All media streaming will run through the SFU boundary.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">
              CU
            </div>
            <div className="space-y-1 max-w-xl text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] text-muted-foreground">10:45 AM</span>
                <span className="text-xs font-semibold text-foreground">You</span>
              </div>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg text-xs leading-relaxed text-left">
                Excellent. Theme variables from <code className="underline">color-system.md</code> are now bound globally to Next.js Tailwind and shared via TypeScript to React Native.
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                <CheckCheck className="w-3 h-3 text-primary" />
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input Bar */}
        <div className="p-4 border-t border-border bg-card/30">
          <div className="bg-card border border-input rounded-lg p-2 focus-within:ring-1 focus-within:ring-ring transition-all">
            <textarea
              rows={2}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message #${selectedChat}...`}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <button className="p-1 hover:bg-secondary rounded text-muted-foreground"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-secondary rounded text-muted-foreground"><Smile className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-secondary rounded text-muted-foreground"><Mic className="w-4 h-4" /></button>
              </div>
              <button className="bg-primary text-primary-foreground p-1.5 rounded-md hover:opacity-90 transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Intelligence Panel (AI & Active Meeting Preview) */}
      <aside className="w-80 border-l border-border bg-card/40 flex flex-col justify-between hidden lg:flex z-10">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Workspace Intelligence</span>
            </h3>
            <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
              RAG Active
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
          {/* Active Meeting Mini-Surround (Dark Tile Rule Demo) */}
          <div className="meeting-stage-dark p-3 rounded-xl border border-border shadow-md space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-white">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span>Live SFU Stage</span>
              </div>
              <span className="text-[10px] text-gray-400">04:12</span>
            </div>
            <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <span className="text-[10px] text-white font-medium">Alex Mercer (Host)</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button className="p-1.5 bg-neutral-800 text-white rounded-full"><MicOff className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 bg-neutral-800 text-white rounded-full"><VideoOff className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="bg-card p-3 rounded-lg border border-border space-y-2">
            <h4 className="font-semibold text-foreground text-xs">Permission-Aware Search</h4>
            <p className="text-muted-foreground text-[11px]">
              Ask questions across chats, transcripts, and documents. RLS policies guarantee data privacy.
            </p>
            <div className="bg-secondary p-2 rounded text-[11px] text-primary flex items-center justify-between cursor-pointer hover:bg-accent">
              <span>"What are the Phase 1 deliverables?"</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card/60">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-success" />
            <span>Encrypted local session active</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
