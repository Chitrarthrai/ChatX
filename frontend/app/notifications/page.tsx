"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Video,
  ShieldAlert,
  CheckCheck,
  Trash2,
  Inbox,
  Loader2,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications,
  type AppNotification
} from "@/services/notifications";
import { createClient } from "@/lib/supabase/client";

type CategoryTab = "all" | "unread" | "mention" | "meeting" | "ai";

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fallbackNotifications: AppNotification[] = [
    {
      id: "notif-1",
      userId: "u-active",
      type: "mention",
      title: "Mentioned in #Architecture",
      body: "Alex Mercer tagged you: '@team check out the updated tenant RLS policies in 00003_extended_schema.sql'.",
      isRead: false,
      linkUrl: "/",
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: "notif-2",
      userId: "u-active",
      type: "meeting_invite",
      title: "Upcoming Video Stage Meeting",
      body: "Sprint Architecture Review & SFU Stage sync starts in 15 minutes.",
      isRead: false,
      linkUrl: "/",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: "notif-3",
      userId: "u-active",
      type: "ai_summary",
      title: "AI Meeting Executive Summary Ready",
      body: "Executive summary and 4 key action items from yesterday's engineering sync are ready for review.",
      isRead: true,
      linkUrl: "/",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "notif-4",
      userId: "u-active",
      type: "system",
      title: "Security Policy Update",
      body: "Role-based access controls (RBAC) and OAuth session expiration tokens have been re-verified.",
      isRead: true,
      linkUrl: "/admin",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    let channelSub: any;

    const initNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const authPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<any>((resolve) =>
          setTimeout(() => resolve({ data: { user: null } }), 1500)
        );

        const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);

        if (user) {
          setCurrentUserId(user.id);
          const data = await fetchNotifications(user.id);
          if (data && data.length > 0) {
            setNotifications(data);
          } else {
            setNotifications([]);
          }

          // Subscribe to Realtime notifications
          channelSub = subscribeToNotifications(user.id, (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
          });
        } else {
          setNotifications([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load notifications.");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();

    return () => {
      if (channelSub) channelSub.unsubscribe();
    };
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      if (currentUserId) {
        await markAllNotificationsAsRead(currentUserId);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.warn("Failed to mark all read remotely:", err.message);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationAsRead(id);
    } catch {
      /* Optimistic state retained */
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteNotification(id);
    } catch {
      /* Optimistic state update */
    } finally {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDeletingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "mention") return item.type === "mention";
    if (activeTab === "meeting") return item.type === "meeting_invite" || item.type === "message";
    if (activeTab === "ai") return item.type === "ai_summary";
    return true;
  });

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

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
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 disabled:opacity-40 disabled:no-underline"
        >
          {markingAll ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCheck className="w-3.5 h-3.5" />
          )}
          <span>Mark all as read</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
          {[
            { id: "all", label: "All Notifications", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "mention", label: "Mentions", count: notifications.filter((n) => n.type === "mention").length },
            { id: "meeting", label: "Meetings", count: notifications.filter((n) => n.type === "meeting_invite").length },
            { id: "ai", label: "AI Insights", count: notifications.filter((n) => n.type === "ai_summary").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CategoryTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground border border-border/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notification Roster */}
        {loading ? (
          /* Pulse Skeleton Loader */
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card/50 border border-border p-4 rounded-2xl flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-secondary rounded w-1/3" />
                  <div className="h-3 bg-secondary/60 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">No notifications found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeTab === "unread"
                  ? "You're all caught up! There are no unread notifications."
                  : `No notification entries recorded under category '${activeTab}'.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleRead(item.id, item.isRead)}
                className={`p-5 flex items-start gap-4 transition-colors cursor-pointer group ${
                  !item.isRead ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-secondary/30"
                }`}
              >
                {/* Type Icon Badge */}
                <div className="p-2.5 rounded-xl bg-card border border-border shrink-0 mt-0.5 shadow-sm">
                  {item.type === "mention" && <MessageSquare className="w-4 h-4 text-blue-500" />}
                  {item.type === "meeting_invite" && <Video className="w-4 h-4 text-emerald-500" />}
                  {item.type === "ai_summary" && <Sparkles className="w-4 h-4 text-purple-500" />}
                  {(item.type === "system" || item.type === "message") && <ShieldAlert className="w-4 h-4 text-amber-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs flex items-center gap-2 text-foreground">
                      <span>{item.title}</span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      )}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>

                {/* Dismiss Action */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.linkUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(item.linkUrl!);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDeleteNotification(e, item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-50"
                    title="Dismiss Notification"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
