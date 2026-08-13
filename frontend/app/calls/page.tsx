"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Loader2,
  Calendar,
  Clock
} from "lucide-react";

interface CallLogItem {
  id: string;
  name: string;
  avatarUrl?: string;
  type: "video" | "audio" | "group";
  direction: "incoming" | "outgoing" | "missed";
  duration: string;
  timestamp: string;
  callCode?: string;
}

export default function CallsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "incoming" | "outgoing" | "missed">("all");
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackCallLogs: CallLogItem[] = [
    { id: "1", name: "Alex Mercer", type: "video", direction: "incoming", duration: "14m 20s", timestamp: "Today, 10:45 AM", callCode: "sfu-alex-101" },
    { id: "2", name: "Architecture Core Sync", type: "group", direction: "outgoing", duration: "45m 12s", timestamp: "Yesterday, 3:15 PM", callCode: "sfu-arch-202" },
    { id: "3", name: "Elena Rostova", type: "audio", direction: "missed", duration: "-", timestamp: "Aug 9, 2:00 PM", callCode: "sfu-elena-303" },
    { id: "4", name: "Sophia Chen", type: "video", direction: "outgoing", duration: "22m 05s", timestamp: "Aug 8, 11:30 AM", callCode: "sfu-sophia-404" },
    { id: "5", name: "Marcus Vance", type: "audio", direction: "incoming", duration: "05m 48s", timestamp: "Aug 7, 4:10 PM", callCode: "sfu-marcus-505" },
  ];

  const fetchCallLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      // TODO: replace with real table when calls table is migrated
      const queryPromise = supabase
        .from("calls")
        .select(`
          id,
          direction,
          call_type,
          duration_seconds,
          created_at,
          caller:profiles!caller_id(full_name, username)
        `)
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Request timeout") }), 2000)
      );

      const { data, error: dbError } = await Promise.race([queryPromise, timeoutPromise]);

      if (dbError || !data || data.length === 0) {
        setCallLogs([]);
      } else {
        setCallLogs(
          data.map((c: any) => ({
            id: c.id,
            name: c.caller?.full_name || c.caller?.username || "Unknown Caller",
            type: (c.call_type || "video") as any,
            direction: (c.direction || "incoming") as any,
            duration: c.duration_seconds ? `${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s` : "-",
            timestamp: new Date(c.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
          }))
        );
      }
    } catch {
      setCallLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const filteredLogs = callLogs.filter((log) => {
    const matchesSearch =
      log.name.toLowerCase().includes(search.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(search.toLowerCase());

    const matchesDirection = directionFilter === "all" || log.direction === directionFilter;

    return matchesSearch && matchesDirection;
  });

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
              <PhoneCall className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Call Logs & History</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {callLogs.length}
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Call</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Search and Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 border border-border p-4 rounded-2xl backdrop-blur-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search call logs..."
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

          {/* Direction Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(["all", "incoming", "outgoing", "missed"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  directionFilter === dir
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {dir === "all" ? "All Calls" : dir}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Call Logs Container */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Recent Activity ({filteredLogs.length})</span>
            <Filter className="w-3.5 h-3.5" />
          </div>

          {loading ? (
            /* Skeleton Loader */
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary" />
                    <div className="space-y-2">
                      <div className="h-3 bg-secondary rounded w-36" />
                      <div className="h-2.5 bg-secondary/60 rounded w-24" />
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-secondary" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <PhoneMissed className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-semibold text-sm">No call logs found</h3>
                <p className="text-xs text-muted-foreground">
                  {search
                    ? `No calls match "${search}". Try clearing search.`
                    : "No call records exist for the selected filter."}
                </p>
              </div>
              {(search || directionFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setDirectionFilter("all");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            /* Call Log List */
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                      {log.type === "video" || log.type === "group" ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <Phone className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {log.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {log.direction === "incoming" && (
                          <span className="flex items-center gap-1 text-emerald-500 font-medium">
                            <PhoneIncoming className="w-3.5 h-3.5" /> Incoming
                          </span>
                        )}
                        {log.direction === "outgoing" && (
                          <span className="flex items-center gap-1 text-blue-500 font-medium">
                            <PhoneOutgoing className="w-3.5 h-3.5" /> Outgoing
                          </span>
                        )}
                        {log.direction === "missed" && (
                          <span className="flex items-center gap-1 text-rose-500 font-medium">
                            <PhoneMissed className="w-3.5 h-3.5" /> Missed
                          </span>
                        )}
                        <span>•</span>
                        <span>{log.timestamp}</span>
                        {log.duration !== "-" && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px]">{log.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                    title="Callback"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
