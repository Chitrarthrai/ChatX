"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  Archive,
  ArrowLeft,
  Search,
  RotateCcw,
  Hash,
  User,
  MessageSquare,
  Trash2,
  ExternalLink,
  Inbox,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { fetchChannels, fetchDirectMessageContacts, ChannelItem, UserDirectoryItem } from "@/services/channels";

export default function ArchivePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [archivedList, setArchivedList] = useState<string[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [contacts, setContacts] = useState<UserDirectoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chatx_archived_chats");
      if (saved) {
        try {
          setArchivedList(JSON.parse(saved));
        } catch {
          setArchivedList([]);
        }
      }
    }

    const load = async () => {
      try {
        const [ch, co] = await Promise.all([
          fetchChannels(),
          fetchDirectMessageContacts(user?.id)
        ]);
        setChannels(ch);
        setContacts(co);
      } catch (err) {
        console.warn("Error loading channels:", err);
      }
    };
    load();
  }, [user?.id]);

  const handleUnarchive = (chatName: string) => {
    const updated = archivedList.filter((item) => item !== chatName);
    setArchivedList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_archived_chats", JSON.stringify(updated));
    }
    setNotice(`Restored "${chatName}" back to your active chats.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenChat = (chatName: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_active_chat", chatName);
      localStorage.setItem("chatx_view_mode", "workspace");
    }
    router.push(`/?chat=${encodeURIComponent(chatName)}`);
  };

  const filteredArchived = archivedList.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
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
              <Archive className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Archived Conversations & Channels</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {archivedList.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {notice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Search & Stats Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archived channels and direct messages..."
              className="w-full pl-9 pr-4 py-2 bg-secondary border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {archivedList.length} total archived
          </span>
        </div>

        {/* List of Archived Chats */}
        {filteredArchived.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">No archived conversations</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When you archive channels or direct messages in your workspace using the top-bar Archive button, they will appear here and can be restored at any time.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArchived.map((chatName) => {
              const matchedChannel = channels.find((c) => c.name === chatName);
              const matchedContact = contacts.find((co) => co.name === chatName);
              const isChannel = !matchedContact && (!!matchedChannel || !chatName.includes("@"));

              return (
                <div
                  key={chatName}
                  className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-primary/40 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2.5 rounded-xl bg-secondary text-primary border border-border shrink-0">
                      {isChannel ? <Hash className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">{chatName}</span>
                        <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                          {isChannel ? "Channel" : "Direct Message"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {matchedChannel?.topic || (matchedContact ? matchedContact.email : "Archived conversation")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenChat(chatName)}
                      className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Open conversation in workspace"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </button>

                    <button
                      onClick={() => handleUnarchive(chatName)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1.5 transition-all shadow-sm"
                      title="Restore to active sidebar"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Unarchive</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
