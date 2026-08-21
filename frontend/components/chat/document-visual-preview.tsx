"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Presentation,
  CheckCircle2,
  Table,
  Layers
} from "lucide-react";
import {
  parseDocumentFile,
  getCachedDocContent,
  ParsedDocContent
} from "@/services/document-preview";

interface DocumentVisualPreviewProps {
  file: File;
  previewUrl: string;
}

export function DocumentVisualPreview({ file, previewUrl }: DocumentVisualPreviewProps) {
  // Initialize with cached parsed content if available to completely eliminate flickering
  const cachedInitial = getCachedDocContent(file);
  const [docContent, setDocContent] = useState<ParsedDocContent | null>(cachedInitial);
  const [loading, setLoading] = useState<boolean>(!cachedInitial);

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx = name.match(/\.(docx|doc|rtf)$/);
  const isExcel = name.match(/\.(xlsx|xls|csv)$/);
  const isPptx = name.match(/\.(pptx|ppt)$/);
  const isCode = name.match(/\.(js|jsx|ts|tsx|html|css|json|py|java|c|cpp|go|rs|sql|sh|md|txt)$/);

  useEffect(() => {
    if (isPdf) {
      setLoading(false);
      return;
    }

    const cached = getCachedDocContent(file);
    if (cached) {
      setDocContent(cached);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    parseDocumentFile(file)
      .then((parsed) => {
        if (isMounted) {
          setDocContent(parsed);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Doc parsing error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [file, isPdf]);

  // 1. PDF Real Document Viewer (iframe / embedded renderer)
  if (isPdf) {
    return (
      <div className="w-full h-full min-h-[380px] max-h-[54vh] relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-white flex flex-col">
        {/* Floating PDF Info Ribbon */}
        <div className="absolute top-2.5 left-3 z-10 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-[11px] text-white shadow-md pointer-events-none">
          <FileText className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold">{file.name}</span>
          <span className="text-zinc-400 font-normal">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
        </div>

        <iframe
          src={`${previewUrl}#toolbar=0&navpanes=0`}
          title={file.name}
          className="w-full flex-1 border-0 rounded-2xl bg-white"
        />
      </div>
    );
  }

  // 2. Microsoft Word / DOCX A4 Sheet Canvas (Flicker-Free)
  if (isDocx) {
    return (
      <div className="w-full h-full min-h-[360px] max-h-[54vh] overflow-y-auto rounded-2xl border border-border bg-zinc-900/90 p-4 flex flex-col items-center shadow-2xl scrollbar-thin">
        <div className="w-full max-w-xl bg-white text-zinc-900 rounded-xl shadow-2xl p-6 sm:p-8 space-y-4 border border-zinc-200 transition-all">
          {/* Word Ribbon */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                W
              </div>
              <div>
                <h4 className="font-bold text-xs text-zinc-900 truncate max-w-xs">{file.name}</h4>
                <p className="text-[10px] text-zinc-500">Microsoft Word Document • {(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              DOCX
            </span>
          </div>

          {/* Formatted Paragraphs */}
          <div className="space-y-3 font-sans text-xs text-zinc-800 leading-relaxed min-h-[160px]">
            {loading && !docContent ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-zinc-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-zinc-200 rounded w-full animate-pulse" />
                <div className="h-3 bg-zinc-200 rounded w-5/6 animate-pulse" />
              </div>
            ) : docContent && docContent.paragraphs && docContent.paragraphs.length > 0 ? (
              docContent.paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-1" : "text-xs"}>
                  {p}
                </p>
              ))
            ) : (
              <div className="py-6 text-center text-zinc-500 space-y-2">
                <FileText className="w-10 h-10 text-sky-500 mx-auto opacity-70" />
                <p className="font-medium text-xs">Formatted Word Document Ready.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Page 1 of {docContent?.pageEstimate || 1}</span>
            <span>ChatX Word Viewer</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Microsoft Excel / Spreadsheet Grid Table Canvas
  if (isExcel) {
    const colHeaders = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const rows = docContent?.tableData || [];

    return (
      <div className="w-full h-full min-h-[360px] max-h-[54vh] overflow-auto rounded-2xl border border-border bg-zinc-950 p-4 shadow-2xl flex flex-col">
        {/* Excel Green Header Ribbon */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              X
            </div>
            <div>
              <h4 className="font-bold text-xs text-white truncate max-w-xs">{file.name}</h4>
              <p className="text-[10px] text-zinc-400">Excel Workbook • {(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            SPREADSHEET
          </span>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-inner">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="bg-zinc-800/80 text-zinc-400 border-b border-zinc-700">
                <th className="p-2 px-3 border-r border-zinc-700 text-center w-10 text-[10px] bg-zinc-800">#</th>
                {colHeaders.slice(0, Math.max(3, rows[0]?.length || 4)).map((ch) => (
                  <th key={ch} className="p-2 px-3 border-r border-zinc-700 font-bold text-[11px] text-zinc-300">
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-800/80 hover:bg-emerald-950/20 transition-colors">
                  <td className="p-2 border-r border-zinc-800 text-center text-zinc-500 text-[10px] bg-zinc-950/40">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2 px-3 border-r border-zinc-800/60 text-zinc-200 text-xs truncate max-w-xs ${
                        rIdx === 0 ? "font-bold text-emerald-400 bg-zinc-950/60" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between px-1">
          <span>Sheet1 • {rows.length} rows loaded</span>
          <span>ChatX Excel Viewer</span>
        </div>
      </div>
    );
  }

  // 4. PowerPoint / Presentation Canvas
  if (isPptx) {
    const slides = docContent?.slides || [`Slide 1: ${file.name}`];

    return (
      <div className="w-full h-full min-h-[360px] max-h-[54vh] overflow-y-auto rounded-2xl border border-border bg-zinc-950 p-4 shadow-2xl flex flex-col items-center">
        {/* PowerPoint Header Ribbon */}
        <div className="w-full max-w-xl flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              P
            </div>
            <div>
              <h4 className="font-bold text-xs text-white truncate max-w-xs">{file.name}</h4>
              <p className="text-[10px] text-zinc-400">PowerPoint Presentation • {(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            PPTX
          </span>
        </div>

        {/* 16:9 Presentation Slide Card */}
        <div className="w-full max-w-xl aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-orange-400 font-bold border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Presentation className="w-4 h-4" />
              <span>Slide 1 Overview</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">16:9 HD</span>
          </div>

          <div className="my-auto space-y-2 text-center py-4">
            <h3 className="font-bold text-base text-white">{slides[0] || file.name}</h3>
            {slides[1] && <p className="text-xs text-zinc-400 max-w-md mx-auto">{slides[1]}</p>}
          </div>

          <div className="text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-2">
            <span>Slide 1 of {slides.length}</span>
            <span>ChatX Presentation Viewer</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Code & Text File Syntax View
  if (isCode && docContent?.rawText) {
    return (
      <div className="w-full h-full min-h-[360px] max-h-[54vh] overflow-auto rounded-2xl border border-border bg-zinc-950 p-4 shadow-2xl font-mono text-xs text-zinc-300">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 text-[10px] text-zinc-500">
          <span>{file.name}</span>
          <span>SOURCE CODE PREVIEW</span>
        </div>
        <pre className="whitespace-pre-wrap leading-relaxed text-amber-300/90 text-xs">
          {docContent.rawText}
        </pre>
      </div>
    );
  }

  // 6. Generic Document Fallback
  return (
    <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
        <File className="w-10 h-10 text-amber-400" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-base text-white truncate max-w-md mx-auto">{file.name}</h3>
        <p className="text-xs text-zinc-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Document</p>
      </div>
    </div>
  );
}
