"use client";

import React from "react";
import { Eye, Flame, Lock, Play, Image as ImageIcon, Video, FileText, AlertCircle, CheckCheck } from "lucide-react";

export interface EphemeralMediaPayload {
  type: "ephemeral_media";
  id: string;
  mediaType: "image" | "video" | "document";
  url: string;
  fileName: string;
  fileSize?: string;
  viewMode: "view_once" | "timer";
  timerSeconds?: number;
  viewedBy: string[];
  isExpired: boolean;
  caption?: string;
  senderId?: string;
  senderName?: string;
}

interface EphemeralMediaCardProps {
  payload: EphemeralMediaPayload;
  isSelf: boolean;
  currentUserId?: string;
  onOpenViewer: () => void;
}

export function EphemeralMediaCard({
  payload,
  isSelf,
  currentUserId,
  onOpenViewer,
}: EphemeralMediaCardProps) {
  const hasUserViewed = currentUserId ? payload.viewedBy?.includes(currentUserId) : false;
  const isExpired = payload.isExpired || (hasUserViewed && payload.viewMode === "view_once");

  const mediaLabel = payload.mediaType === "video"
    ? "View Once Video"
    : payload.mediaType === "document"
    ? `View Once Doc (${payload.fileName.split('.').pop()?.toUpperCase() || "File"})`
    : "View Once Photo";

  const expiredLabel = payload.mediaType === "video"
    ? "Video Expired"
    : payload.mediaType === "document"
    ? "Document Expired"
    : "Photo Expired";

  if (isExpired) {
    return (
      <div className="mt-1 rounded-2xl bg-secondary/40 border border-border/80 p-3.5 max-w-sm text-left select-none opacity-85 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground tracking-tight">
                {expiredLabel}
              </span>
              <span className="text-[9px] font-bold text-destructive uppercase tracking-wider bg-destructive/10 px-1.5 py-0.2 rounded border border-destructive/20">
                Self-Destructed
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {payload.viewMode === "view_once"
                ? "Destroyed after single view"
                : `Burned after ${payload.timerSeconds || 10}s timer`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 max-w-sm text-left">
      <button
        type="button"
        onClick={onOpenViewer}
        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/95 to-secondary/60 border border-border hover:border-amber-500/50 p-4 transition-all duration-200 shadow-md hover:shadow-lg text-left cursor-pointer"
      >
        {/* Subtle glowing ambient gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          {/* Circular Badge Icon */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-inner">
              {payload.mediaType === "video" ? (
                <Play className="w-5 h-5 fill-amber-500/40 text-amber-500 ml-0.5" />
              ) : payload.mediaType === "document" ? (
                <FileText className="w-5 h-5 text-amber-500" />
              ) : (
                <Eye className="w-5 h-5 text-amber-500" />
              )}
            </div>

            {/* Badge Indicator */}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center shadow-md border-2 border-card">
              {payload.viewMode === "view_once" ? "1" : "⏱"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground tracking-tight">
                {mediaLabel}
              </span>
              {payload.viewMode === "timer" && (
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> {payload.timerSeconds || 10}s
                </span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {payload.caption || payload.fileName || (payload.mediaType === "video" ? "Tap to play video" : "Tap to open document")}
            </p>

            <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-500 font-medium">
              <span>{isSelf ? "Self-destruct enabled" : "Opens full-screen • 1-time view"}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
