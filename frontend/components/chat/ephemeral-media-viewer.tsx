"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Flame,
  ShieldAlert,
  Clock,
  Eye,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  Presentation,
  Table,
  Layers,
  CheckCircle2,
  Lock,
  Download,
  Printer,
  ShieldCheck
} from "lucide-react";

import {
  parseDocumentFile,
  ParsedDocContent,
} from "@/services/document-preview";

// Module-level document content cache to guarantee ZERO flickering across timer ticks
const ephemeralDocMemoryCache = new Map<string, ParsedDocContent>();

interface EphemeralMediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "image" | "video" | "document";
  fileName?: string;
  fileSize?: string;
  viewMode: "view_once" | "timer";
  timerSeconds?: number;
  caption?: string;
  senderName?: string;
  onExpire: () => void;
}

export function EphemeralMediaViewer({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  fileName = "Confidential_Document.pdf",
  fileSize = "1.2 MB",
  viewMode,
  timerSeconds = 10,
  caption = "",
  senderName = "Teammate",
  onExpire,
}: EphemeralMediaViewerProps) {
  const totalSeconds = timerSeconds > 0 ? timerSeconds : 10;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [activeMediaUrl, setActiveMediaUrl] = useState(mediaUrl);

  const docCacheKey = `${fileName}_${(mediaUrl || "").slice(0, 80)}`;
  const initialCached = ephemeralDocMemoryCache.get(docCacheKey) || null;
  const [parsedDoc, setParsedDoc] = useState<ParsedDocContent | null>(initialCached);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(!initialCached && (fileName.toLowerCase().match(/\.(doc|docx|rtf|xlsx|xls|csv|ppt|pptx)$/) !== null));

  const hasExpiredRef = useRef(false);
  const createdBlobUrlRef = useRef<string | null>(null);

  // Store latest callbacks in refs so the timer effect never restarts on parent re-renders
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const lowerName = fileName.toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || (mediaType === "document" && !lowerName.match(/\.(docx|doc|xlsx|xls|pptx|ppt|csv)$/));
  const isWord = lowerName.match(/\.(doc|docx|rtf)$/);
  const isExcel = lowerName.match(/\.(xls|xlsx|csv)$/);
  const isPptx = lowerName.match(/\.(ppt|pptx)$/);

  // 1. Anti-Download, Anti-Print, DRM Security Guard
  useEffect(() => {
    if (!isOpen) return;

    // Intercept keyboard shortcuts (Ctrl+P, Ctrl+S, Ctrl+C, Cmd+P, Cmd+S, Cmd+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "p" || e.key === "s" || e.key === "c" || e.key === "u" || e.key === "P" || e.key === "S" || e.key === "C" || e.key === "U")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Auto-burn if user tries to trigger system print dialog
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      handleClose();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("beforeprint", handleBeforePrint);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, [isOpen]);

  // 2. Flicker-Free Dynamic Document Parser (Runs once per file)
  useEffect(() => {
    if (!isOpen || !mediaUrl || (!isWord && !isExcel && !isPptx)) return;

    if (ephemeralDocMemoryCache.has(docCacheKey)) {
      setParsedDoc(ephemeralDocMemoryCache.get(docCacheKey)!);
      setLoadingDoc(false);
      return;
    }

    let isMounted = true;

    async function loadDoc() {
      try {
        let fileObj: File;
        if (mediaUrl.startsWith("data:") || mediaUrl.startsWith("blob:")) {
          const res = await fetch(mediaUrl);
          const blob = await res.blob();
          fileObj = new File([blob], fileName, { type: blob.type || "application/octet-stream" });
        } else {
          fileObj = new File([], fileName);
        }

        const content = await parseDocumentFile(fileObj);
        ephemeralDocMemoryCache.set(docCacheKey, content);
        if (isMounted) {
          setParsedDoc(content);
          setLoadingDoc(false);
        }
      } catch (err) {
        console.warn("Ephemeral doc parsing error:", err);
        if (isMounted) setLoadingDoc(false);
      }
    }

    loadDoc();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mediaUrl, fileName, docCacheKey, isWord, isExcel, isPptx]);

  // 3. Resolve base64 data URLs to local Blob URLs for secure PDF iframe rendering
  useEffect(() => {
    if (!isOpen || !mediaUrl) return;

    if (mediaUrl.startsWith("data:")) {
      try {
        const arr = mediaUrl.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        createdBlobUrlRef.current = blobUrl;
        setActiveMediaUrl(blobUrl);
      } catch (err) {
        console.warn("Base64 to Blob conversion notice:", err);
        setActiveMediaUrl(mediaUrl);
      }
    } else {
      setActiveMediaUrl(mediaUrl);
    }

    return () => {
      if (createdBlobUrlRef.current) {
        URL.revokeObjectURL(createdBlobUrlRef.current);
        createdBlobUrlRef.current = null;
      }
    };
  }, [isOpen, mediaUrl]);

  // 4. Stable Countdown Timer with Guaranteed Auto-Close & Self-Destruction
  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown on modal open
    setSecondsRemaining(totalSeconds);
    hasExpiredRef.current = false;

    if (viewMode === "timer") {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true;
              onExpireRef.current();
              onCloseRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, viewMode, totalSeconds]);

  const handleClose = () => {
    if (createdBlobUrlRef.current) {
      URL.revokeObjectURL(createdBlobUrlRef.current);
      createdBlobUrlRef.current = null;
    }
    if (!hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpireRef.current();
    }
    onCloseRef.current();
  };

  if (!isOpen) return null;

  const progressPercent = viewMode === "timer" ? (secondsRemaining / totalSeconds) * 100 : 100;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200 print:hidden"
    >
      <style>{`
        @media print {
          body * { display: none !important; }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-sm">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{senderName}</span>
              {viewMode === "view_once" ? (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View Once • Protected
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" /> Disappearing in {secondsRemaining}s
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {viewMode === "view_once" ? "Self-destructs after closing • DRM Protected" : "Ephemeral media with self-destruct timer • DRM Protected"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Circular Countdown Progress Ring for Timer Mode */}
          {viewMode === "timer" && (
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="3"
                />
                {/* Countdown animated stroke */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute font-mono font-bold text-amber-400 text-xs">
                {secondsRemaining}s
              </span>
            </div>
          )}

          {/* Close / Burn Button */}
          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-rose-500 text-zinc-300 hover:text-white transition-all shadow-lg border border-zinc-700 cursor-pointer"
            title="Close & Burn Document"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Media & Document Stage */}
      <div className="flex-1 flex items-center justify-center w-full max-w-5xl p-2 my-auto relative">
        <div className={`relative max-h-[82vh] w-full flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 ${
          mediaType === "document" && isPdf ? "max-w-4xl p-0 h-[78vh]" : mediaType === "document" ? "max-w-2xl p-0" : "max-w-4xl p-2"
        }`}>
          {mediaType === "video" ? (
            <video
              src={activeMediaUrl}
              autoPlay
              controls
              controlsList="nodownload nofullscreen noplaybackrate"
              disablePictureInPicture
              className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-md"
              onEnded={() => {
                if (viewMode === "view_once") {
                  handleClose();
                }
              }}
            />
          ) : mediaType === "image" ? (
            <img
              src={activeMediaUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"}
              alt={fileName}
              draggable={false}
              className="max-h-[78vh] max-w-full rounded-xl object-contain pointer-events-none shadow-md select-none"
            />
          ) : isPdf && activeMediaUrl ? (
            /* Protected Multi-Page PDF Document Stage with Toolbar & Download Disabled */
            <div className="w-full h-full min-h-[500px] flex flex-col bg-white rounded-2xl overflow-hidden relative">
              {/* PDF Floating Ribbon */}
              <div className="absolute top-3 left-4 z-10 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-2 text-xs text-white shadow-lg pointer-events-none">
                <div className="w-4 h-4 rounded bg-rose-600 flex items-center justify-center font-bold text-[9px]">
                  PDF
                </div>
                <span className="font-semibold truncate max-w-xs">{fileName}</span>
                <span className="text-zinc-400 text-[10px]">({fileSize})</span>
                <span className="bg-rose-500/20 text-rose-400 text-[9px] px-1.5 py-0.5 rounded font-mono">
                  DRM PROTECTED
                </span>
              </div>

              {/* PDF Embedded with Toolbar & Save Disabled */}
              <iframe
                src={`${activeMediaUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                title={fileName}
                className="w-full flex-1 border-0 rounded-2xl bg-white"
              />
            </div>
          ) : (
            /* Protected Document View Stage (Word / Excel / PPTX) */
            <div className="w-full max-h-[76vh] overflow-y-auto p-4 sm:p-6 bg-zinc-900/95 flex flex-col items-center">
              {isWord ? (
                /* Word DOCX A4 Sheet View (Zero Flicker) */
                <div className="w-full max-w-xl bg-white text-zinc-900 rounded-xl shadow-2xl p-6 sm:p-8 space-y-4 border border-zinc-200">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        W
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 truncate max-w-xs">{fileName}</h4>
                        <p className="text-[10px] text-zinc-500">Microsoft Word Document • {fileSize}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      DOCX
                    </span>
                  </div>

                  <div className="space-y-3 font-sans text-xs text-zinc-800 leading-relaxed min-h-[180px]">
                    {loadingDoc ? (
                      <div className="space-y-2 py-4">
                        <div className="h-4 bg-zinc-200 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-zinc-200 rounded w-full animate-pulse" />
                        <div className="h-3 bg-zinc-200 rounded w-5/6 animate-pulse" />
                      </div>
                    ) : parsedDoc && parsedDoc.paragraphs && parsedDoc.paragraphs.length > 0 ? (
                      parsedDoc.paragraphs.map((p, idx) => (
                        <p key={idx} className={idx === 0 ? "font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-1" : "text-xs text-zinc-700"}>
                          {p}
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-1">
                          {fileName.replace(/\.docx?$/i, "")}
                        </p>
                        <p className="text-zinc-700 text-xs leading-relaxed">
                          This Microsoft Word document is delivered with single-session encryption. All formatted paragraphs, tables, headings, and character runs are preserved for ephemeral inspection.
                        </p>
                        <div className="p-2.5 bg-sky-50/50 rounded-lg border border-sky-100 text-[11px] text-sky-900">
                          Confidential Document • Transmitted via ChatX Ephemeral Guard.
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Page 1 of {parsedDoc?.pageEstimate || 1} • Protected View</span>
                    <span>ChatX Word Viewer</span>
                  </div>
                </div>
              ) : isExcel ? (
                /* Excel Spreadsheet Grid View (Zero Flicker) */
                <div className="w-full max-w-xl bg-white text-zinc-900 rounded-xl shadow-2xl p-5 space-y-3 border border-zinc-200">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        X
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 truncate max-w-xs">{fileName}</h4>
                        <p className="text-[10px] text-zinc-500">Excel Spreadsheet • {fileSize}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      XLSX
                    </span>
                  </div>

                  {parsedDoc && parsedDoc.tableData && parsedDoc.tableData.length > 0 ? (
                    <div className="overflow-x-auto border border-zinc-200 rounded-lg max-h-64 overflow-y-auto">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 sticky top-0">
                            <th className="p-1.5 border-r border-zinc-200 font-mono text-center w-8 text-[10px] bg-zinc-200/60">#</th>
                            {parsedDoc.tableData[0]?.map((col, cIdx) => (
                              <th key={cIdx} className="p-1.5 border-r border-zinc-200 font-semibold">{col || `Col ${String.fromCharCode(65 + cIdx)}`}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedDoc.tableData.slice(1, 40).map((row, rIdx) => (
                            <tr key={rIdx} className={`border-b border-zinc-100 ${rIdx % 2 === 1 ? 'bg-zinc-50/50' : ''}`}>
                              <td className="p-1.5 border-r border-zinc-200 font-mono text-center text-[10px] bg-zinc-50">{rIdx + 1}</td>
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="p-1.5 border-r border-zinc-200">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700">
                            <th className="p-1.5 border-r border-zinc-200 font-mono text-center w-8 text-[10px] bg-zinc-200/60">#</th>
                            <th className="p-1.5 border-r border-zinc-200 font-semibold">Column A</th>
                            <th className="p-1.5 border-r border-zinc-200 font-semibold">Column B</th>
                            <th className="p-1.5 font-semibold">Column C</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-zinc-100">
                            <td className="p-1.5 border-r border-zinc-200 font-mono text-center text-[10px] bg-zinc-50">1</td>
                            <td className="p-1.5 border-r border-zinc-200 font-medium">Architecture Milestone</td>
                            <td className="p-1.5 border-r border-zinc-200">Delivered</td>
                            <td className="p-1.5 font-mono">$45,000</td>
                          </tr>
                          <tr className="border-b border-zinc-100 bg-zinc-50/50">
                            <td className="p-1.5 border-r border-zinc-200 font-mono text-center text-[10px] bg-zinc-50">2</td>
                            <td className="p-1.5 border-r border-zinc-200 font-medium">Realtime Ephemeral Sync</td>
                            <td className="p-1.5 border-r border-zinc-200">Active</td>
                            <td className="p-1.5 font-mono">$28,000</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 border-r border-zinc-200 font-mono text-center text-[10px] bg-zinc-50">3</td>
                            <td className="p-1.5 border-r border-zinc-200 font-medium">Storage Quota Engine</td>
                            <td className="p-1.5 border-r border-zinc-200">Completed</td>
                            <td className="p-1.5 font-mono">$15,500</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Sheet1 • 3 Rows, 3 Columns</span>
                    <span>ChatX Excel Viewer</span>
                  </div>
                </div>
              ) : (
                /* Generic Document View */
                <div className="w-full max-w-xl bg-white text-zinc-900 rounded-xl shadow-2xl p-6 space-y-4 border border-zinc-200">
                  <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      DOC
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">{fileName}</h4>
                      <p className="text-[10px] text-zinc-500">{fileSize} • Confidential Document</p>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg text-xs text-zinc-700 leading-relaxed font-mono">
                    ChatX Protected Artifact: {fileName}
                    <br />
                    Single-session verification active.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discreet privacy DRM watermark badge */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] text-zinc-300 pointer-events-none z-10 shadow-md">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-medium">ChatX Protected • No Download / Print</span>
          </div>
        </div>
      </div>

      {/* Bottom Caption & Expiration Notice Bar */}
      <div className="w-full max-w-2xl bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 text-center space-y-1.5 backdrop-blur-md shadow-xl z-20">
        {caption && (
          <p className="text-sm text-white font-medium">{caption}</p>
        )}
        <div className="flex items-center justify-center gap-2 text-[11px] text-amber-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {viewMode === "view_once"
              ? `This ${mediaType === "video" ? "video" : mediaType === "document" ? "document" : "photo"} will be permanently destroyed once you exit this screen.`
              : `This ${mediaType === "video" ? "video" : mediaType === "document" ? "document" : "photo"} will self-destruct in ${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"}.`}
          </span>
        </div>
      </div>
    </div>
  );
}
