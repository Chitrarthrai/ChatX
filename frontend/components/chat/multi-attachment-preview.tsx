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
  FileArchive,
  FileCheck,
  File,
  Sparkles
} from "lucide-react";

export interface AttachmentItem {
  file: File;
  previewUrl: string;
  id: string;
}

interface MultiAttachmentPreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onAddMoreFiles: () => void;
  ephemeralMode: "normal" | "view_once" | "timer";
  onSetEphemeralMode: (mode: "normal" | "view_once" | "timer") => void;
  timerSeconds: number;
  onCycleTimerSeconds: () => void;
  onClearAll: () => void;
}

export function getFileFormatInfo(file: File): {
  category: "image" | "video" | "pdf" | "word" | "excel" | "code" | "archive" | "document";
  label: string;
  colorClass: string;
  bgClass: string;
} {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") || name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp)$/)) {
    return { category: "image", label: "Image", colorClass: "text-blue-400", bgClass: "bg-blue-500/10 border-blue-500/30" };
  }
  if (type.startsWith("video/") || name.match(/\.(mp4|webm|mov|mkv|avi)$/)) {
    return { category: "video", label: "Video", colorClass: "text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/30" };
  }
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return { category: "pdf", label: "PDF", colorClass: "text-rose-400", bgClass: "bg-rose-500/10 border-rose-500/30" };
  }
  if (name.match(/\.(doc|docx|rtf|odt)$/) || type.includes("word") || type.includes("officedocument.wordprocessingml")) {
    return { category: "word", label: "Word Doc", colorClass: "text-sky-400", bgClass: "bg-sky-500/10 border-sky-500/30" };
  }
  if (name.match(/\.(xls|xlsx|csv|ods)$/) || type.includes("spreadsheet") || type.includes("excel")) {
    return { category: "excel", label: "Spreadsheet", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/30" };
  }
  if (name.match(/\.(js|jsx|ts|tsx|html|css|json|py|java|c|cpp|go|rs|sql|sh)$/)) {
    return { category: "code", label: "Code File", colorClass: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/30" };
  }
  if (name.match(/\.(zip|rar|tar|gz|7z|bz2)$/)) {
    return { category: "archive", label: "Archive", colorClass: "text-yellow-400", bgClass: "bg-yellow-500/10 border-yellow-500/30" };
  }
  return { category: "document", label: "Document", colorClass: "text-zinc-400", bgClass: "bg-zinc-500/10 border-zinc-500/30" };
}

export function MultiAttachmentPreview({
  files,
  onRemoveFile,
  onAddMoreFiles,
  ephemeralMode,
  onSetEphemeralMode,
  timerSeconds,
  onCycleTimerSeconds,
  onClearAll,
}: MultiAttachmentPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    if (selectedIndex >= files.length) {
      setSelectedIndex(Math.max(0, files.length - 1));
    }

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  if (files.length === 0) return null;

  const activeFile = files[selectedIndex] || files[0];
  const activePreview = previews[selectedIndex] || previews[0];
  const activeFormat = getFileFormatInfo(activeFile);
  const totalSizeMB = (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);

  return (
    <div className="mb-3 bg-secondary/80 border border-border rounded-2xl p-3 shadow-md backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-2.5">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">
              {files.length} {files.length === 1 ? "Attachment" : "Attachments"}
            </span>
            <span className="text-[10px] text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full border border-border/60 font-medium">
              {totalSizeMB} MB Total
            </span>
          </div>
        </div>

        {/* Ephemeral Mode Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSetEphemeralMode("view_once")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              ephemeralMode === "view_once"
                ? "bg-amber-500 text-black shadow-xs font-extrabold"
                : "bg-background/80 text-muted-foreground hover:text-foreground border border-border"
            }`}
            title="Single-view ephemeral media"
          >
            <Eye className="w-3 h-3" />
            <span>View Once (1x)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (ephemeralMode !== "timer") {
                onSetEphemeralMode("timer");
              } else {
                onCycleTimerSeconds();
              }
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              ephemeralMode === "timer"
                ? "bg-amber-500 text-black shadow-xs font-extrabold"
                : "bg-background/80 text-muted-foreground hover:text-foreground border border-border"
            }`}
            title="Self-destruct timer"
          >
            <Flame className="w-3 h-3" />
            <span>{ephemeralMode === "timer" ? `${timerSeconds}s Timer` : "Timer"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSetEphemeralMode("normal")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              ephemeralMode === "normal"
                ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                : "bg-background/80 text-muted-foreground hover:text-foreground border border-border"
            }`}
            title="Regular permanent attachment"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Permanent</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1 cursor-pointer"
            title="Remove all attachments"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Focus Preview & Info */}
      <div className="flex items-center gap-3 bg-background/50 p-2.5 rounded-xl border border-border/40">
        {/* Large Thumbnail Preview */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-border shrink-0 flex items-center justify-center shadow-inner">
          {activeFormat.category === "image" ? (
            <img
              src={activePreview}
              alt={activeFile.name}
              className="w-full h-full object-cover"
            />
          ) : activeFormat.category === "video" ? (
            <>
              <video
                src={activePreview}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Play className="w-5 h-5 text-white fill-white/90" />
              </div>
            </>
          ) : activeFormat.category === "pdf" ? (
            <div className="flex flex-col items-center justify-center text-rose-400">
              <FileText className="w-7 h-7" />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">PDF</span>
            </div>
          ) : activeFormat.category === "word" ? (
            <div className="flex flex-col items-center justify-center text-sky-400">
              <FileText className="w-7 h-7" />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">DOC</span>
            </div>
          ) : activeFormat.category === "excel" ? (
            <div className="flex flex-col items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-7 h-7" />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">XLS</span>
            </div>
          ) : activeFormat.category === "code" ? (
            <div className="flex flex-col items-center justify-center text-amber-400">
              <FileCode className="w-7 h-7" />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">CODE</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400">
              <File className="w-7 h-7" />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">FILE</span>
            </div>
          )}
        </div>

        {/* File Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-foreground truncate max-w-sm">
              {activeFile.name}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${activeFormat.bgClass} ${activeFormat.colorClass}`}>
              {activeFormat.label}
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground mt-0.5">
            {(activeFile.size / (1024 * 1024)).toFixed(2)} MB • {activeFile.type || "Document"}
          </p>

          <p className="text-[10px] text-amber-500 font-medium mt-0.5">
            {ephemeralMode === "view_once"
              ? "👁️ Will self-destruct immediately after single recipient view"
              : ephemeralMode === "timer"
              ? `🔥 Will burn ${timerSeconds} seconds after opening`
              : "🔒 Standard permanent document"}
          </p>
        </div>
      </div>

      {/* Horizontal Multi-Attachment Carousel Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        {files.map((file, idx) => {
          const info = getFileFormatInfo(file);
          const preview = previews[idx];
          const isSelected = idx === selectedIndex;

          return (
            <div
              key={`${file.name}-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              className={`relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border p-1 flex flex-col items-center justify-between cursor-pointer transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/30 bg-card shadow-md scale-105"
                  : "border-border/70 bg-card/60 hover:bg-card hover:border-border"
              }`}
            >
              {/* Thumbnail Display */}
              <div className="w-full flex-1 rounded-lg overflow-hidden flex items-center justify-center bg-secondary/40 relative">
                {info.category === "image" && preview ? (
                  <img src={preview} alt={file.name} className="w-full h-full object-cover" />
                ) : info.category === "video" && preview ? (
                  <>
                    <video src={preview} className="w-full h-full object-cover" muted playsInline />
                    <Play className="w-3.5 h-3.5 text-white absolute" />
                  </>
                ) : info.category === "pdf" ? (
                  <FileText className="w-5 h-5 text-rose-400" />
                ) : info.category === "word" ? (
                  <FileText className="w-5 h-5 text-sky-400" />
                ) : info.category === "excel" ? (
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                ) : (
                  <File className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              {/* Truncated File Name */}
              <span className="text-[9px] font-medium text-foreground truncate w-full text-center px-0.5 mt-0.5">
                {file.name}
              </span>

              {/* Individual Delete Badge Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(idx);
                }}
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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
          className="shrink-0 w-20 h-20 rounded-xl border border-dashed border-border/80 hover:border-primary bg-background/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all cursor-pointer"
          title="Add more files to this message"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[9px] font-bold">Add More</span>
        </button>
      </div>
    </div>
  );
}
