"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Eye,
  Flame,
  ShieldCheck,
  Play,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Send,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { DocumentVisualPreview } from "./document-visual-preview";
import { getFileFormatInfo } from "./multi-attachment-preview";

interface MediaPreviewDialogProps {
  isOpen: boolean;
  files: File[];
  onClose: () => void;
  onSend: (data: {
    files: File[];
    viewMode: "normal" | "view_once" | "timer";
    timerSeconds: number;
    caption: string;
  }) => void;
  onAddMoreFiles: () => void;
  onRemoveFile: (index: number) => void;
  initialMode?: "normal" | "view_once" | "timer";
  initialTimerSeconds?: number;
}

export function MediaPreviewDialog({
  isOpen,
  files,
  onClose,
  onSend,
  onAddMoreFiles,
  onRemoveFile,
  initialMode = "normal",
  initialTimerSeconds = 10,
}: MediaPreviewDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"normal" | "view_once" | "timer">(initialMode);
  const [timerSeconds, setTimerSeconds] = useState<number>(initialTimerSeconds);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    if (selectedIndex >= files.length) {
      setSelectedIndex(Math.max(0, files.length - 1));
    }

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  if (!isOpen || files.length === 0) return null;

  const activeFile = files[selectedIndex] || files[0];
  const activePreview = previews[selectedIndex] || previews[0];
  const activeFormat = getFileFormatInfo(activeFile);
  const totalSizeMB = (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);

  const handleCycleTimer = () => {
    setTimerSeconds((prev) => (prev === 5 ? 10 : prev === 10 ? 30 : prev === 30 ? 60 : 5));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSend({
      files,
      viewMode,
      timerSeconds: viewMode === "timer" ? timerSeconds : 0,
      caption: caption.trim(),
    });
    setCaption("");
    onClose();
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-card via-secondary/40 to-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-foreground">
                Media Preview
              </span>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border font-medium">
                {files.length} {files.length === 1 ? "file" : "files"} • {totalSizeMB} MB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ephemeral Mode Switcher in Header */}
            <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("view_once")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "view_once"
                    ? "bg-amber-500 text-black shadow-md font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="View Once (1-Time)"
              >
                <div className="w-4 h-4 rounded-full bg-black text-amber-500 font-bold text-[9px] flex items-center justify-center">
                  1
                </div>
                <span>View Once</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (viewMode !== "timer") {
                    setViewMode("timer");
                  } else {
                    handleCycleTimer();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "timer"
                    ? "bg-amber-500 text-black shadow-md font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Self-destruct timer (click to cycle duration)"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{viewMode === "timer" ? `${timerSeconds}s Timer` : "Timer"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("normal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "normal"
                    ? "bg-primary text-primary-foreground shadow-md font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Permanent upload"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Permanent</span>
              </button>
            </div>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer ml-2"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Central Preview Viewport */}
        <div className="flex-1 relative bg-black/90 flex items-center justify-center p-4 min-h-[360px] max-h-[55vh] overflow-hidden group">
          {activeFormat.category === "image" ? (
            <img
              src={activePreview}
              alt={activeFile.name}
              className="max-h-[52vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : activeFormat.category === "video" ? (
            <video
              src={activePreview}
              controls
              playsInline
              className="max-h-[52vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            /* Real Document Visual Preview Stage (PDF iframe, Word A4 Sheet, CSV table, Code) */
            <DocumentVisualPreview file={activeFile} previewUrl={activePreview} />
          )}

          {/* Navigation Arrows for Multi-File */}
          {files.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-all opacity-80 hover:opacity-100 shadow-lg cursor-pointer"
                title="Previous media"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-all opacity-80 hover:opacity-100 shadow-lg cursor-pointer"
                title="Next media"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Floating Status Badge */}
          <div className="absolute top-4 left-4">
            {viewMode === "view_once" && (
              <span className="bg-amber-500 text-black font-bold text-[11px] px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> View Once (1-Time View)
              </span>
            )}
            {viewMode === "timer" && (
              <span className="bg-amber-500 text-black font-bold text-[11px] px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Disappears in {timerSeconds}s
              </span>
            )}
          </div>
        </div>

        {/* Bottom Multi-Thumbnail Carousel Strip (when files > 1) */}
        {files.length > 1 && (
          <div className="p-3 px-6 bg-secondary/50 border-t border-border flex items-center gap-2.5 overflow-x-auto">
            {files.map((file, idx) => {
              const format = getFileFormatInfo(file);
              const preview = previews[idx];
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={`${file.name}-${idx}`}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative group shrink-0 w-16 h-16 rounded-xl overflow-hidden border p-0.5 flex items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/40 bg-card shadow-lg scale-105"
                      : "border-border/70 bg-card/60 hover:border-border"
                  }`}
                >
                  {format.category === "image" && preview ? (
                    <img src={preview} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                  ) : format.category === "video" && preview ? (
                    <>
                      <video src={preview} className="w-full h-full object-cover rounded-lg" muted playsInline />
                      <Play className="w-4 h-4 text-white absolute" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-1">
                      <FileText className={`w-6 h-6 ${format.colorClass}`} />
                      <span className="text-[8px] font-bold truncate max-w-[50px] mt-0.5">{file.name}</span>
                    </div>
                  )}

                  {/* Individual Delete Button on Thumbnail */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title={`Remove ${file.name}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}

            {/* "+ Add More Files" Button */}
            <button
              type="button"
              onClick={onAddMoreFiles}
              className="shrink-0 w-16 h-16 rounded-xl border border-dashed border-border hover:border-primary bg-background/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all cursor-pointer"
              title="Add more files"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[8px] font-bold">Add More</span>
            </button>
          </div>
        )}

        {/* Bottom Caption & Action Dispatch Bar */}
        <form onSubmit={handleSubmit} className="p-4 px-6 bg-card border-t border-border flex items-center justify-between gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption... (optional)"
              className="w-full bg-secondary/80 text-foreground placeholder:text-muted-foreground text-xs rounded-xl px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {viewMode === "view_once"
                  ? `Send View Once (${files.length})`
                  : viewMode === "timer"
                  ? `Send ${timerSeconds}s Timer (${files.length})`
                  : `Send (${files.length})`}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
