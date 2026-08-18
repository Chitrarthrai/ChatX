"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseRestFetch } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import {
  Bookmark,
  ArrowLeft,
  Trash2,
  Search,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Inbox,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface SavedItem {
  id: string;
  messageId: string;
  senderName: string;
  senderAvatar: string;
  senderEmail: string;
  content: string;
  channelName: string;
  savedAt: string;
  note?: string;
}

export default function SavedMessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [savedList, setSavedList] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      setError(null);

      try {
        const activeUserId = user?.id || (typeof window !== "undefined" ? (() => {
          try {
            return JSON.parse(localStorage.getItem("chatx_active_user") || "{}")?.id;
          } catch { return ""; }
        })() : "");

        if (!activeUserId) {
          setSavedList([]);
          setLoading(false);
          return;
        }

        const savedRows: any = await supabaseRestFetch(
          `saved_messages?user_id=eq.${activeUserId}&select=id,message_id,note,saved_at&order=saved_at.desc`
        );

        if (!savedRows || !Array.isArray(savedRows) || savedRows.length === 0) {
          setSavedList([]);
          setLoading(false);
          return;
        }

        const msgIds = savedRows.map((r: any) => r.message_id).filter(Boolean);
        let messagesData: any[] = [];
        let profilesData: any[] = [];

        if (msgIds.length > 0) {
          const msgs: any = await supabaseRestFetch(
            `messages?id=in.(${msgIds.join(',')})&select=id,content,sender_id,created_at`
          );
          messagesData = Array.isArray(msgs) ? msgs : [];

          const senderIds = Array.from(new Set(messagesData.map((m: any) => m.sender_id).filter(Boolean)));
          if (senderIds.length > 0) {
            const profs: any = await supabaseRestFetch(
              `profiles?id=in.(${senderIds.join(',')})&select=id,full_name,email,avatar_url`
            );
            profilesData = Array.isArray(profs) ? profs : [];
          }
        }

        const profileMap = new Map<string, any>(profilesData.map((p: any) => [p.id, p]));
        const msgMap = new Map<string, any>(messagesData.map((m: any) => [m.id, m]));

        const items: SavedItem[] = savedRows.map((item: any) => {
          const msg = msgMap.get(item.message_id);
          const profile = msg ? profileMap.get(msg.sender_id) : null;
          const name = profile?.full_name || profile?.email || "Team Member";
          return {
            id: item.id,
            messageId: item.message_id || "",
            senderName: name,
            senderAvatar: name.charAt(0).toUpperCase(),
            senderEmail: profile?.email || "",
            content: msg?.content || item.note || "Saved Message",
            channelName: "Workspace Conversation",
            savedAt: new Date(item.saved_at || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }),
            note: item.note
          };
        });

        setSavedList(items);
      } catch (err: any) {
        setError(err.message || "Failed to load saved messages.");
        setSavedList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = createClient();
      await supabase.from("saved_messages").delete().eq("id", id);
      setSavedList((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setSavedList((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = savedList.filter(
    (item) =>
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.senderName.toLowerCase().includes(search.toLowerCase()) ||
      item.channelName.toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Bookmark className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Saved Messages & Bookmarks</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {savedList.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved messages by keyword, team member, or channel..."
            className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 border border-border p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-secondary rounded" />
                      <div className="h-2.5 w-40 bg-secondary rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-6 bg-secondary rounded-lg" />
                </div>
                <div className="h-12 bg-secondary/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                {search ? "No matching saved messages" : "No saved messages yet"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {search
                  ? `No bookmarks match "${search}". Try adjusting your search keywords.`
                  : "Bookmark important messages in any chat channel to access them quickly here."}
              </p>
            </div>
          </div>
        ) : (
          /* Saved Messages Roster */
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border p-5 rounded-2xl space-y-3 hover:border-primary/40 transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                      {item.senderAvatar.length === 1 ? item.senderAvatar : "U"}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                        <span>{item.senderName}</span>
                        {item.senderEmail && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({item.senderEmail})
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-foreground/80">#{item.channelName}</span>
                        <span>•</span>
                        <span>{item.savedAt}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyContent(item.id, item.content)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                      title="Copy Message Text"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => router.push("/")}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      title="Jump to Chat Workspace"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50"
                      title="Remove Bookmark"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-secondary/30 p-3.5 rounded-xl border border-border/40 text-xs leading-relaxed text-foreground/90 font-normal">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
