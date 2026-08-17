"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  MessageSquare,
  Video,
  ArrowLeft,
  Shield,
  Loader2,
  UserX,
  Copy,
  Check,
  X
} from "lucide-react";
import type { UserStatus } from "@chatx/types";

interface DirectoryContact {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: UserStatus;
  avatarUrl?: string;
  bio?: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [contacts, setContacts] = useState<DirectoryContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data, error: dbError } = await supabase
        .from("profiles")
        .select("id, full_name, username, email, status, avatar_url, bio")
        .order("created_at", { ascending: false });

      if (!dbError && data) {
        const fetchedProfiles: DirectoryContact[] = data.map((p: any) => ({
          id: p.id,
          name: p.full_name || p.username || "Team Member",
          username: p.username || "user",
          email: p.email || "",
          role: "Member",
          status: (p.status || "online") as UserStatus,
          avatarUrl: p.avatar_url,
          bio: p.bio || `Registered account: ${p.email}`,
        }));

        setContacts(fetchedProfiles);
      } else {
        setContacts([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load directory");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "online":
        return { color: "bg-emerald-500", text: "Online", badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "away":
        return { color: "bg-amber-500", text: "Away", badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "dnd":
        return { color: "bg-rose-500", text: "Do Not Disturb", badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
      case "offline":
      default:
        return { color: "bg-slate-500", text: "Offline", badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
    }
  };

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || search.trim() !== "" || c.status === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [contacts, search, roleFilter]);

  const handleCopyInvite = () => {
    const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/?invite=chatx-workspace` : "https://chatx.platform";
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleStartDM = (contact: DirectoryContact) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_active_dm", contact.name);
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Team Directory</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {contacts.length}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 border border-border p-4 rounded-2xl backdrop-blur-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, or email..."
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(["all", "online", "away", "dnd", "offline"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setRoleFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  roleFilter === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-card/50 border border-border p-5 rounded-2xl space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-secondary rounded w-3/4" />
                    <div className="h-2.5 bg-secondary/60 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-card/20">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
              <UserX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">No contacts found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No contacts match the selected status filter or search query.
              </p>
            </div>
          </div>
        ) : (
          /* Contacts Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const badge = getStatusBadge(c.status);

              return (
                <div
                  key={c.id}
                  className="bg-card border border-border p-5 rounded-2xl space-y-4 hover:border-primary/50 transition-all shadow-sm group hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold flex items-center justify-center text-lg shadow-inner">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${badge.color}`}
                            title={badge.text}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {c.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            @{c.username}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badge.badgeClass}`}>
                        {badge.text}
                      </span>
                    </div>

                    {c.bio && (
                      <p className="text-[11px] text-muted-foreground/90 line-clamp-2 italic">
                        "{c.bio}"
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1 pt-1">
                      <p className="flex items-center gap-2 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span className="truncate">{c.email}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[11px]">
                        <Shield className="w-3.5 h-3.5 text-primary/70" />
                        <span>{c.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => handleStartDM(c)}
                      className="flex-1 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground text-xs font-semibold py-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send DM</span>
                    </button>
                    <button
                      onClick={() => router.push("/calendar")}
                      className="bg-primary/10 text-primary hover:bg-primary/20 p-2.5 rounded-xl transition-all"
                      title="Start HD Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Member Dialog */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">Invite Team Members</h3>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Share this workspace link with your team to invite them to join ChatX automatically:
            </p>

            <div className="flex items-center gap-2 bg-secondary p-2.5 rounded-xl border border-input">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/?invite=chatx-workspace` : "https://chatx.platform"}
                className="bg-transparent text-xs text-foreground flex-1 focus:outline-none"
              />
              <button
                onClick={handleCopyInvite}
                className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 flex items-center gap-1.5 shrink-0"
              >
                {inviteCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{inviteCopied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsInviteOpen(false)}
                className="bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
