"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, Flame, Clock, Send, Image as ImageIcon, Video, ShieldCheck, Sparkles } from "lucide-react";

interface EphemeralUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onSend: (data: {
    file: File;
    viewMode: "normal" | "view_once" | "timer";
    timerSeconds: number;
    caption: string;
  }) => void;
}

export function EphemeralUploadModal({
  isOpen,
  onClose,
  file,
  onSend,
}: EphemeralUploadModalProps) {
  const [viewMode, setViewMode] = useState<"normal" | "view_once" | "timer">("view_once");
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const isVideo = file.type.startsWith("video/");
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({
      file,
      viewMode,
      timerSeconds: viewMode === "timer" ? timerSeconds : 0,
      caption: caption.trim(),
    });
    setCaption("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 via-amber-500/5 to-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {viewMode === "view_once" ? (
                <Eye className="w-4 h-4" />
              ) : viewMode === "timer" ? (
                <Flame className="w-4 h-4" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                {viewMode === "view_once"
                  ? "Send View-Once Media"
                  : viewMode === "timer"
                  ? `Send Disappearing Media (${timerSeconds}s)`
                  : "Send Attachment"}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {file.name} • {fileSizeMB} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Preview Box */}
        <div className="p-4 bg-secondary/30 flex items-center justify-center relative min-h-[200px] max-h-[280px] overflow-hidden">
          {previewUrl && (
            isVideo ? (
              <video
                src={previewUrl}
                controls
                className="max-h-[240px] max-w-full rounded-xl object-contain shadow-md"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Upload Preview"
                className="max-h-[240px] max-w-full rounded-xl object-contain shadow-md"
              />
            )
          )}

          {/* Floating Badge Indicator */}
          <div className="absolute top-6 right-6">
            {viewMode === "view_once" && (
              <span className="bg-amber-500 text-black font-bold text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Eye className="w-3 h-3" /> View Once
              </span>
            )}
            {viewMode === "timer" && (
              <span className="bg-amber-500 text-black font-bold text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Flame className="w-3 h-3" /> {timerSeconds}s Timer
              </span>
            )}
          </div>
        </div>

        {/* Ephemeral Mode Controls */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Disappearing Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setViewMode("view_once")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  viewMode === "view_once"
                    ? "bg-amber-500/15 border-amber-500 text-amber-400 shadow-xs"
                    : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">
                  1
                </div>
                <span>View Once</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("timer")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  viewMode === "timer"
                    ? "bg-amber-500/15 border-amber-500 text-amber-400 shadow-xs"
                    : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Timer</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("normal")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  viewMode === "normal"
                    ? "bg-primary/15 border-primary text-primary shadow-xs"
                    : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Permanent</span>
              </button>
            </div>
          </div>

          {/* Self-Destruct Timer Options when Timer Mode is Active */}
          {viewMode === "timer" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Select Self-Destruct Duration
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setTimerSeconds(sec)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      timerSeconds === sec
                        ? "bg-amber-500 text-black border-amber-500 shadow-xs"
                        : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sec === 60 ? "1 min" : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Caption */}
          <div className="space-y-1">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption... (optional)"
              className="w-full bg-secondary text-xs text-foreground placeholder:text-muted-foreground rounded-xl px-3.5 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {viewMode === "view_once"
                  ? "Send 1-Time View"
                  : viewMode === "timer"
                  ? `Send (${timerSeconds}s Timer)`
                  : "Send Media"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
