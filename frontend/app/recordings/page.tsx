"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchRecordings, type MeetingRecordingItem } from "@/services/recordings";
import {
  Video,
  Play,
  Download,
  Star,
  Search,
  ArrowLeft,
  Calendar,
  HardDrive,
  User,
  X,
  Inbox,
  AlertCircle,
  Clock,
  Sparkles,
  Film
} from "lucide-react";

type FilterTab = "all" | "favorites" | "recent";

export default function RecordingsPage() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<MeetingRecordingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [activeVideo, setActiveVideo] = useState<MeetingRecordingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecordings = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchPromise = fetchRecordings();
        const timeoutPromise = new Promise<MeetingRecordingItem[]>((resolve) =>
          setTimeout(() => resolve([]), 2500)
        );

        const data = await Promise.race([fetchPromise, timeoutPromise]);
        setRecordings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load cloud recordings.");
      } finally {
        setLoading(false);
      }
    };

    loadRecordings();
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRecordings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const filtered = recordings.filter((r) => {
    const matchesSearch =
      r.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hostName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "favorites") return matchesSearch && r.isFavorite;
    if (activeFilter === "recent") {
      const recDate = new Date(r.createdAt).getTime();
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      return matchesSearch && recDate >= threeDaysAgo;
    }
    return matchesSearch;
  });

  const favoritesCount = recordings.filter((r) => r.isFavorite).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Video Player Modal Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">{activeVideo.meetingTitle}</h2>
                <p className="text-xs text-neutral-400 flex items-center gap-2">
                  <span>Host: {activeVideo.hostName}</span>
                  <span>•</span>
                  <span>Duration: {activeVideo.duration}</span>
                  <span>•</span>
                  <span>Code: {activeVideo.meetingCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveVideo(null)}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
              title="Close Player"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Video Stage Container */}
          <div className="flex-1 flex items-center justify-center my-4 max-w-5xl mx-auto w-full">
            <video
              controls
              autoPlay
              src={activeVideo.videoUrl}
              className="w-full aspect-video rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl"
            />
          </div>

          {/* Modal Footer Bar */}
          <div className="flex items-center justify-center gap-4 z-10 max-w-5xl mx-auto w-full">
            <a
              href={activeVideo.videoUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4 File ({activeVideo.fileSize})</span>
            </a>
          </div>
        </div>
      )}

      {/* Top Navbar */}
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
              <Film className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Meeting Recordings Library</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {recordings.length}
            </span>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recordings by title..."
            className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Recordings", count: recordings.length },
              { id: "favorites", label: "Favorites", count: favoritesCount },
              { id: "recent", label: "Recent (3 Days)", count: recordings.filter((r) => new Date(r.createdAt).getTime() >= Date.now() - 3 * 24 * 60 * 60 * 1000).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground border border-border/50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recordings Roster */}
        {loading ? (
          /* Pulse Skeleton Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 border border-border rounded-2xl overflow-hidden space-y-3">
                <div className="aspect-video bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-secondary rounded" />
                  <div className="h-3 w-1/2 bg-secondary/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                {searchQuery ? `No recordings for "${searchQuery}"` : "No cloud recordings found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching with a different keyword or title."
                  : activeFilter === "favorites"
                  ? "Star your favorite meeting recordings to access them quickly here."
                  : "Recorded video sessions will automatically appear in this library."}
              </p>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((rec) => (
              <div
                key={rec.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between group"
              >
                {/* Thumbnail Stage Container */}
                <div
                  onClick={() => setActiveVideo(rec)}
                  className="relative aspect-video bg-neutral-900 border-b border-border flex items-center justify-center cursor-pointer overflow-hidden group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                    {rec.duration}
                  </span>
                </div>

                {/* Card Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-xs text-foreground line-clamp-1">{rec.meetingTitle}</h3>
                    <button
                      onClick={(e) => toggleFavorite(e, rec.id)}
                      className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
                      title={rec.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star className={`w-4 h-4 ${rec.isFavorite ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>
                  </div>

                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Host: {rec.hostName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(rec.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{rec.fileSize}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => setActiveVideo(rec)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch Recording</span>
                    </button>
                    <a
                      href={rec.videoUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="Download MP4"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
