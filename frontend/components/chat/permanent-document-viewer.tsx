"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  Presentation,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  ExternalLink
} from "lucide-react";
import {
  parseDocumentFile,
  ParsedDocContent,
} from "@/services/document-preview";

interface PermanentDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "image" | "video" | "document";
  fileName: string;
  fileSize?: string;
  senderName?: string;
}

// In-memory document parsing cache across modal re-renders
const permanentDocMemoryCache = new Map<string, ParsedDocContent>();

export function PermanentDocumentViewer({
  isOpen,
  onClose,
  mediaUrl = "",
  mediaType,
  fileName = "Document.pdf",
  fileSize = "1.5 MB",
  senderName = "Teammate",
}: PermanentDocumentViewerProps) {
  const lowerName = (fileName || "document").toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || (mediaType === "document" && !lowerName.match(/\.(docx|doc|xlsx|xls|pptx|ppt|csv|png|jpg|jpeg|gif|webp|mp4|mov)$/));
  const isWord = lowerName.match(/\.(doc|docx|rtf)$/);
  const isExcel = lowerName.match(/\.(xls|xlsx|csv)$/);
  const isPptx = lowerName.match(/\.(ppt|pptx)$/);

  const cacheKey = `${fileName}_${mediaUrl ? mediaUrl.slice(0, 120) : "nourl"}_${fileSize}`;

  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [parsedDoc, setParsedDoc] = useState<ParsedDocContent | null>(() => {
    return permanentDocMemoryCache.get(cacheKey) || null;
  });
  const [loadingDoc, setLoadingDoc] = useState<boolean>(() => {
    if (isWord || isExcel || isPptx) {
      return !permanentDocMemoryCache.has(cacheKey);
    }
    return false;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = parsedDoc?.pageEstimate || (isWord ? 3 : isExcel ? 1 : isPptx ? (parsedDoc?.slides?.length || 4) : 1);

  // Load and parse document with zero-flicker caching
  useEffect(() => {
    if (!isOpen) return;

    if (permanentDocMemoryCache.has(cacheKey)) {
      setParsedDoc(permanentDocMemoryCache.get(cacheKey)!);
      setLoadingDoc(false);
      return;
    }

    if (!isWord && !isExcel && !isPptx) return;

    let isMounted = true;
    setLoadingDoc(true);

    async function load() {
      try {
        let fileObj: File;
        if (mediaUrl && (mediaUrl.startsWith("data:") || mediaUrl.startsWith("blob:") || mediaUrl.startsWith("http"))) {
          const res = await fetch(mediaUrl);
          const blob = await res.blob();
          fileObj = new File([blob], fileName, { type: blob.type || "application/octet-stream" });
        } else {
          fileObj = new File([], fileName);
        }
        const content = await parseDocumentFile(fileObj);
        permanentDocMemoryCache.set(cacheKey, content);
        if (isMounted) {
          setParsedDoc(content);
          setLoadingDoc(false);
        }
      } catch (err) {
        console.warn("Permanent doc load error:", err);
        if (isMounted) setLoadingDoc(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [isOpen, cacheKey, mediaUrl, fileName, isWord, isExcel, isPptx]);

  // Zoom Controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  // Pagination Controls
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Rotate
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Print Document
  const handlePrint = () => {
    if (isPdf && mediaUrl) {
      const printWindow = window.open(mediaUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  // Direct Download
  const handleDownload = async () => {
    if (mediaUrl) {
      try {
        const response = await fetch(mediaUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return;
      } catch (err) {
        console.warn("Permanent doc blob download notice:", err);
      }
    }

    const content = `ChatX Workspace File Artifact
Filename: ${fileName}
Size: ${fileSize}
Downloaded from Permanent Document Suite
Timestamp: ${new Date().toISOString()}`;

    const blob = new Blob([content], { type: "application/octet-stream" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  };


  // Copy Content / Text
  const handleCopyText = () => {
    const textToCopy = parsedDoc?.paragraphs?.join("\n\n") || `Document: ${fileName} (${fileSize})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-between text-zinc-100 select-none animate-in fade-in duration-200"
    >
      {/* Top Workspace Header & Control Toolbar */}
      <header className="w-full bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between z-30 shadow-md backdrop-blur-md">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${
            isPdf ? "bg-rose-600 text-white" : isWord ? "bg-sky-600 text-white" : isExcel ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground"
          }`}>
            {isPdf ? "PDF" : isWord ? "W" : isExcel ? "X" : <FileText className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm text-white truncate max-w-xs sm:max-w-md" title={fileName}>
              {fileName}
            </h3>
            <p className="text-[10px] text-zinc-400">
              {fileSize} • Shared by {senderName} • Permanent View
            </p>
          </div>
        </div>

        {/* Center: Pagination & Zoom Controls */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-1 shadow-inner">
          {/* Page Selector */}
          <div className="flex items-center gap-1 border-r border-zinc-800 pr-2 mr-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs font-mono font-medium text-zinc-200 px-1">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    setCurrentPage(val);
                  }
                }}
                className="w-8 bg-zinc-900 border border-zinc-700 rounded text-center text-xs py-0.5 text-white focus:outline-none focus:border-primary"
              />
              <span className="text-zinc-500">/</span>
              <span>{totalPages}</span>
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom In & Out */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="text-[11px] font-mono font-bold text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-all"
              title="Reset Zoom to 100%"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 250}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Rotate Tool */}
          <button
            onClick={handleRotate}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white border-l border-zinc-800 pl-2 ml-1 transition-all cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions (Download, Print, Copy, Fullscreen, Close) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleCopyText}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Copy Document Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Print Document (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 px-3 rounded-lg bg-primary hover:opacity-90 text-primary-foreground transition-all shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Download Original File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white transition-all shadow-sm cursor-pointer ml-1"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main High-Definition Viewport Stage */}
      <main className="flex-1 w-full overflow-auto p-4 sm:p-8 flex items-center justify-center relative bg-zinc-950/80">
        <div
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
          className="w-full max-w-5xl flex items-center justify-center"
        >
          {isPdf ? (
            /* PDF Interactive Stage */
            <div className="w-full h-[78vh] min-h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-700 flex flex-col relative">
              <iframe
                src={`${mediaUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title={fileName}
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          ) : isWord ? (
            /* Word DOCX A4 Sheet Stage */
            <div className="w-full max-w-2xl bg-white text-zinc-900 rounded-xl shadow-2xl p-8 sm:p-12 space-y-5 border border-zinc-300 min-h-[70vh]">
              {/* Word Header Ribbon */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    W
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 truncate max-w-sm">{fileName}</h4>
                    <p className="text-[11px] text-zinc-500">Microsoft Word Document • {fileSize}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                  DOCX
                </span>
              </div>

              {/* Word Formatted Body */}
              <div className="space-y-4 font-sans text-xs sm:text-sm text-zinc-800 leading-relaxed min-h-[300px]">
                {loadingDoc ? (
                  <div className="space-y-3 py-6">
                    <div className="h-5 bg-zinc-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-zinc-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-zinc-200 rounded w-5/6 animate-pulse" />
                  </div>
                ) : parsedDoc && parsedDoc.paragraphs && parsedDoc.paragraphs.length > 0 ? (
                  parsedDoc.paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      className={idx === 0 ? "font-bold text-base sm:text-lg text-zinc-950 border-b border-zinc-200 pb-2" : "leading-relaxed"}
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-500 space-y-2">
                    <FileText className="w-12 h-12 text-sky-500 mx-auto opacity-80" />
                    <p className="font-semibold text-sm">Microsoft Word Document Ready for Reading & Export.</p>
                  </div>
                )}
              </div>

              {/* Word Footer */}
              <div className="border-t border-zinc-200 pt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Page {currentPage} of {totalPages}</span>
                <span>ChatX Word Viewer</span>
              </div>
            </div>
          ) : isExcel ? (
            /* Excel Spreadsheet Stage */
            <div className="w-full max-w-4xl bg-white text-zinc-900 rounded-xl shadow-2xl p-6 space-y-4 border border-zinc-300">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    X
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 truncate max-w-sm">{fileName}</h4>
                    <p className="text-[11px] text-zinc-500">Excel Spreadsheet • {fileSize}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  XLSX
                </span>
              </div>

              {parsedDoc && parsedDoc.tableData && parsedDoc.tableData.length > 0 ? (
                <div className="overflow-x-auto border border-zinc-200 rounded-lg max-h-[60vh] overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-800 sticky top-0">
                        <th className="p-2 border-r border-zinc-200 font-mono text-center w-10 text-[11px] bg-zinc-200/80">#</th>
                        {parsedDoc.tableData[0]?.map((col, cIdx) => (
                          <th key={cIdx} className="p-2 border-r border-zinc-200 font-semibold">{col || `Col ${String.fromCharCode(65 + cIdx)}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedDoc.tableData.slice(1, 100).map((row, rIdx) => (
                        <tr key={rIdx} className={`border-b border-zinc-100 hover:bg-emerald-50/40 ${rIdx % 2 === 1 ? 'bg-zinc-50/60' : ''}`}>
                          <td className="p-2 border-r border-zinc-200 font-mono text-center text-[11px] bg-zinc-50">{rIdx + 1}</td>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-2 border-r border-zinc-200">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 space-y-2">
                  <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
                  <p className="font-semibold text-sm">Spreadsheet Ready for Inspection.</p>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>{parsedDoc?.tableData?.length || 1} Rows • Sheet 1</span>
                <span>ChatX Excel Viewer</span>
              </div>
            </div>
          ) : mediaType === "image" ? (
            /* Image HD Stage */
            <img
              src={mediaUrl}
              alt={fileName}
              className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          ) : mediaType === "video" ? (
            /* Video HD Stage */
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          ) : (
            /* Generic Document View */
            <div className="w-full max-w-xl bg-white text-zinc-900 rounded-xl shadow-2xl p-8 space-y-4 border border-zinc-300 text-center">
              <FileIcon className="w-16 h-16 text-primary mx-auto opacity-80" />
              <h4 className="font-bold text-base text-zinc-900">{fileName}</h4>
              <p className="text-xs text-zinc-500">{fileSize} • File Ready for Download</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md inline-flex items-center gap-2 hover:opacity-90"
              >
                <Download className="w-4 h-4" /> Download File
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
