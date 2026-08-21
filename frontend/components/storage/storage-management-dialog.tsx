"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  HardDrive,
  Trash2,
  CheckCircle2,
  Clock,
  Sliders,
  DownloadCloud,
  Layers,
  MessageSquare,
  Hash,
  User,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  FileText,
  Mic,
  Database,
  ArrowDownToLine,
  Check,
} from "lucide-react";
import {
  StorageBreakdown,
  getStorageBreakdown,
  clearEntireCache,
  clearCategoryCache,
  clearChatCache,
  saveStoragePreferences,
  formatStorageBytes,
} from "@/services/storage-manager";
import { StorageDonutChart } from "./storage-donut-chart";

interface StorageManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  channels?: { id: string; name: string }[];
  directMessages?: { id: string; name: string }[];
  messagesByChannel?: Record<string, any[]>;
}

export function StorageManagementDialog({
  isOpen,
  onClose,
  channels = [],
  directMessages = [],
  messagesByChannel = {},
}: StorageManagementDialogProps) {
  const [data, setData] = useState<StorageBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [chatFilter, setChatFilter] = useState("");
  const [showCustomClearModal, setShowCustomClearModal] = useState(false);

  // Selected categories for custom clear
  const [selectedCategories, setSelectedCategories] = useState<{
    photos: boolean;
    videos: boolean;
    documents: boolean;
    audio: boolean;
    database: boolean;
  }>({
    photos: true,
    videos: true,
    documents: true,
    audio: true,
    database: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const breakdown = await getStorageBreakdown(channels, directMessages, messagesByChannel);
      setData(breakdown);
    } catch (err) {
      console.warn("Storage breakdown notice:", err);
    } finally {
      setLoading(false);
    }
  }, [channels, directMessages, messagesByChannel]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  // Handle Keep Media Change
  const handleKeepMediaChange = (days: number) => {
    if (!data) return;
    saveStoragePreferences({ keepMediaDays: days });
    setData({ ...data, keepMediaDays: days });
    showToast(`Keep Media policy set to ${days === 0 ? "Forever" : days === 3 ? "3 Days" : days === 7 ? "1 Week" : "1 Month"}`);
  };

  // Handle Max Cache Size Change
  const handleMaxCacheChange = (sizeMB: number) => {
    if (!data) return;
    saveStoragePreferences({ maxCacheSizeMB: sizeMB });
    setData({ ...data, maxCacheSizeMB: sizeMB });
    showToast(`Maximum Cache Limit set to ${sizeMB === 0 ? "No Limit" : sizeMB >= 1024 ? `${sizeMB / 1024} GB` : `${sizeMB} MB`}`);
  };

  // Handle Auto Download Toggles
  const handleToggleAutoDownload = (key: "autoDownloadPhotos" | "autoDownloadVideos" | "autoDownloadDocs") => {
    if (!data) return;
    const newVal = !data[key];
    saveStoragePreferences({ [key]: newVal });
    setData({ ...data, [key]: newVal });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  // Handle Clear Entire Cache
  const handleClearAll = async () => {
    setClearing(true);
    try {
      const res = await clearEntireCache();
      if (res.success) {
        showToast(`Successfully reclaimed ${formatStorageBytes(res.reclaimedBytes)} of local space!`);
        await loadData();
      }
    } finally {
      setClearing(false);
    }
  };

  // Handle Custom Category Clear
  const handleCustomCategoryClearSubmit = async () => {
    const categoriesToClear = Object.entries(selectedCategories)
      .filter(([_, checked]) => checked)
      .map(([cat]) => cat as "photos" | "videos" | "documents" | "audio" | "database");

    if (categoriesToClear.length === 0) return;

    setClearing(true);
    try {
      const res = await clearCategoryCache(categoriesToClear);
      showToast(`Reclaimed ${formatStorageBytes(res.reclaimedBytes)} from selected categories!`);
      setShowCustomClearModal(false);
      await loadData();
    } finally {
      setClearing(false);
    }
  };

  // Handle Clear Chat Cache
  const handleClearSingleChat = async (chatName: string) => {
    const res = await clearChatCache(chatName);
    if (res.success) {
      showToast(`Cleared cache for "${chatName}" (Reclaimed ${formatStorageBytes(res.reclaimedBytes)})`);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chats: prev.chats.map((c) => (c.name === chatName ? { ...c, totalBytes: 0, photosBytes: 0, videosBytes: 0, documentsBytes: 0, audioBytes: 0 } : c)),
        };
      });
    }
  };

  const filteredChats = (data?.chats || []).filter((c) =>
    c.name.toLowerCase().includes(chatFilter.toLowerCase())
  );

  const clearableBytes = (data?.categories || [])
    .filter((c) => c.id !== "database")
    .reduce((acc, c) => acc + c.bytes, 0);

  const handleResetCache = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatx_cleared_categories_v1");
      localStorage.removeItem("chatx_cleared_chats_v1");
    }
    showToast("Storage and media caches re-scanned.");
    await loadData();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-card via-secondary/40 to-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-foreground">
                  Storage & Cache Management
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Telegram-Grade
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage local device cache, auto-purge rules, and conversation disk footprints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCache}
              disabled={loading}
              className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
              title="Re-scan / Reset Cache Footprint"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Notification */}
        {feedbackMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-500 font-semibold animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Donut Visualizer & Category Breakdown */}
          {data && (
            <StorageDonutChart
              categories={data.categories}
              totalUsedBytes={data.totalUsedBytes}
              availableQuotaBytes={data.availableQuotaBytes}
            />
          )}

          {/* Quick Actions / Clear Cache Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleClearAll}
              disabled={clearing || clearableBytes === 0}
              className="py-3 px-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {clearing
                  ? "Clearing Local Cache..."
                  : clearableBytes > 0
                  ? `Clear Entire Cache (${formatStorageBytes(clearableBytes)})`
                  : "Local Cache is Clean (0 B)"}
              </span>
            </button>

            <button
              onClick={() => setShowCustomClearModal(true)}
              disabled={clearableBytes === 0}
              className="py-3 px-4 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-primary" />
              <span>Custom Clear Categories...</span>
            </button>
          </div>

          {/* Telegram Cloud Guarantee Banner */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex items-start gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Zero Risk of Data Loss: </span>
              All photos, videos, and documents remain securely stored in ChatX Cloud. Clearing local cache will only remove temporary device previews, which re-download instantly when accessed.
            </div>
          </div>

          {/* 2. Keep Media Retention Policy */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Keep Media (Auto-Remove Cache)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Photos, videos, and files not accessed during this period will be automatically removed from this browser.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: "3 Days", days: 3 },
                { label: "1 Week", days: 7 },
                { label: "1 Month", days: 30 },
                { label: "Forever", days: 0 },
              ].map((opt) => {
                const isActive = data?.keepMediaDays === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => handleKeepMediaChange(opt.days)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/40 hover:bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Maximum Cache Size Limit */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  Maximum Cache Size
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  If your local cache exceeds this limit, the oldest cached media will be automatically evicted.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[
                { label: "500 MB", mb: 500 },
                { label: "2 GB", mb: 2048 },
                { label: "5 GB", mb: 5120 },
                { label: "10 GB", mb: 10240 },
                { label: "No Limit", mb: 0 },
              ].map((opt) => {
                const isActive = data?.maxCacheSizeMB === opt.mb;
                return (
                  <button
                    key={opt.mb}
                    type="button"
                    onClick={() => handleMaxCacheChange(opt.mb)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-secondary/40 hover:bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Automatic Media Download */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
              Automatic Media Download
            </h3>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleToggleAutoDownload("autoDownloadPhotos")}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  data?.autoDownloadPhotos
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-semibold"
                    : "bg-secondary/30 border-border text-muted-foreground"
                }`}
              >
                <span>Photos</span>
                {data?.autoDownloadPhotos ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">Off</span>}
              </button>

              <button
                type="button"
                onClick={() => handleToggleAutoDownload("autoDownloadVideos")}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  data?.autoDownloadVideos
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-semibold"
                    : "bg-secondary/30 border-border text-muted-foreground"
                }`}
              >
                <span>Videos</span>
                {data?.autoDownloadVideos ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">Off</span>}
              </button>

              <button
                type="button"
                onClick={() => handleToggleAutoDownload("autoDownloadDocs")}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  data?.autoDownloadDocs
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-semibold"
                    : "bg-secondary/30 border-border text-muted-foreground"
                }`}
              >
                <span>Documents</span>
                {data?.autoDownloadDocs ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px]">Off</span>}
              </button>
            </div>
          </div>

          {/* 5. Chats Storage Consumption Breakdown */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-500" />
                  Chats Storage Consumption ({filteredChats.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Ranked by local cache size on this device.
                </p>
              </div>

              <input
                type="text"
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value)}
                placeholder="Filter chats..."
                className="w-36 bg-secondary text-xs px-2.5 py-1.5 rounded-xl border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border/60 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {chat.type === "channel" ? <Hash className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                        <span className="truncate">{chat.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          • {chat.messageCount} messages
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                        {chat.photosBytes > 0 && <span>📸 {formatStorageBytes(chat.photosBytes)}</span>}
                        {chat.videosBytes > 0 && <span>🎥 {formatStorageBytes(chat.videosBytes)}</span>}
                        {chat.documentsBytes > 0 && <span>📄 {formatStorageBytes(chat.documentsBytes)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-foreground">
                      {formatStorageBytes(chat.totalBytes)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleClearSingleChat(chat.name)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title={`Clear cache for ${chat.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            Using Browser StorageManager & CacheStorage Web APIs
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>

      {/* Custom Category Selection Modal */}
      {showCustomClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Select Categories to Clear</h3>
              <button onClick={() => setShowCustomClearModal(false)} className="p-1 hover:bg-secondary rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select which local temporary caches you would like to purge:
            </p>

            <div className="space-y-2">
              {[
                { key: "photos" as const, label: "Photos & Image Previews", size: "48.5 MB", icon: <ImageIcon className="w-4 h-4 text-cyan-500" /> },
                { key: "videos" as const, label: "Videos & Screen Recordings", size: "56.2 MB", icon: <Film className="w-4 h-4 text-purple-500" /> },
                { key: "documents" as const, label: "Documents & Office Files", size: "16.8 MB", icon: <FileText className="w-4 h-4 text-blue-500" /> },
                { key: "audio" as const, label: "Voice Notes & Audio Messages", size: "3.8 MB", icon: <Mic className="w-4 h-4 text-emerald-500" /> },
                { key: "database" as const, label: "Local Search Index & Offline Logs", size: "4.2 MB", icon: <Database className="w-4 h-4 text-amber-500" /> },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedCategories[item.key]}
                      onChange={(e) =>
                        setSelectedCategories((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{item.size}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomClearModal(false)}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCustomCategoryClearSubmit}
                disabled={clearing || !Object.values(selectedCategories).some(Boolean)}
                className="px-4 py-2 bg-destructive text-white text-xs font-semibold rounded-xl hover:bg-destructive/90 transition-all disabled:opacity-50"
              >
                {clearing ? "Clearing..." : "Clear Selected"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
