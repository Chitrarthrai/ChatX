"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Upload,
  Search,
  Download,
  Trash2,
  Share2,
  HardDrive,
  ChevronRight,
  ArrowLeft,
  Filter,
  Loader2,
  FolderPlus,
  Plus
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: "document" | "image" | "video" | "archive";
  folderId?: string;
  folderName: string;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl?: string;
}

interface FolderItem {
  id: string;
  name: string;
  fileCount?: number;
}

export default function FilesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: "all", name: "All Files" },
    { id: "general", name: "General" },
    { id: "engineering", name: "Engineering" },
    { id: "architecture", name: "Architecture" },
    { id: "design", name: "Design System" },
  ]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackFiles: FileItem[] = [
    { id: "1", name: "Monorepo_Architecture_Spec.pdf", size: "2.4 MB", sizeBytes: 2516582, type: "document", folderName: "Engineering", uploadedBy: "Alex Mercer", uploadedAt: "Today", fileUrl: "#" },
    { id: "2", name: "LiveKit_SFU_Cluster_Diagram.png", size: "4.8 MB", sizeBytes: 5033164, type: "image", folderName: "Architecture", uploadedBy: "Dev Team", uploadedAt: "Yesterday", fileUrl: "#" },
    { id: "3", name: "Sprint_Demo_Recording_v1.mp4", size: "142 MB", sizeBytes: 148897792, type: "video", folderName: "General", uploadedBy: "Sarah Jenkins", uploadedAt: "3 days ago", fileUrl: "#" },
    { id: "4", name: "Color_System_Tokens.json", size: "12 KB", sizeBytes: 12288, type: "document", folderName: "Design System", uploadedBy: "You", uploadedAt: "Just now", fileUrl: "#" },
  ];

  const fetchLiveFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const queryPromise = supabase
        .from("files")
        .select(`
          id,
          name,
          file_size,
          mime_type,
          file_url,
          created_at,
          uploader_id,
          folder_id
        `)
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Request timeout") }), 3000)
      );

      const { data, error: dbError } = await Promise.race([queryPromise, timeoutPromise]);

      if (!dbError && data && data.length > 0) {
        const fetched: FileItem[] = data.map((f: any) => {
          const mime = (f.mime_type || "").toLowerCase();
          let fileType: "document" | "image" | "video" | "archive" = "document";
          if (mime.includes("image")) fileType = "image";
          else if (mime.includes("video")) fileType = "video";
          else if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar")) fileType = "archive";

          const uploaderName = "Team Member";
          const folderName = "General";
          const bytes = f.file_size || 1024;
          const sizeStr = bytes > 1024 * 1024 
            ? `${(bytes / 1024 / 1024).toFixed(1)} MB` 
            : `${Math.round(bytes / 1024)} KB`;

          return {
            id: f.id,
            name: f.name || "Untitled File",
            size: sizeStr,
            sizeBytes: bytes,
            type: fileType,
            folderName,
            uploadedBy: uploaderName,
            uploadedAt: new Date(f.created_at || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" }),
            fileUrl: f.file_url || "#",
          };
        });


        setFiles(fetched);
      } else {
        setFiles([]);
      }
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    const mimeStr = file.type || "application/octet-stream";
    const fileType: "document" | "image" | "video" | "archive" = mimeStr.includes("image")
      ? "image"
      : mimeStr.includes("video")
      ? "video"
      : "document";

    const newFileItem: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${Math.round(file.size / 1024)} KB`,
      sizeBytes: file.size,
      type: fileType,
      folderName: "Uploads",
      uploadedBy: "You",
      uploadedAt: "Just now",
      fileUrl: objectUrl,
    };

    setFiles((prev) => [newFileItem, ...prev]);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("files").insert({
        uploader_id: user?.id || null,
        name: file.name,
        file_url: objectUrl,
        file_size: file.size,
        mime_type: mimeStr,
      });
    } catch (err) {
      console.warn("Local optimistic upload maintained following API attempt:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (file: FileItem) => {
    if (file.fileUrl && file.fileUrl !== "#") {
      const a = document.createElement("a");
      a.href = file.fileUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Downloading artifact: ${file.name}`);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder =
      selectedFolder === "all" ||
      f.folderName.toLowerCase().includes(selectedFolder.toLowerCase());

    return matchesSearch && matchesFolder;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <HardDrive className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Enterprise File Storage</h1>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border">
              {files.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? "Uploading..." : "Upload File"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Search & Folder Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border p-4 rounded-2xl backdrop-blur-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, folders, uploaders..."
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Folder Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedFolder === folder.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{folder.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Count Banner */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span>Showing <strong className="text-foreground font-semibold">{filteredFiles.length}</strong> {filteredFiles.length === 1 ? "file" : "files"}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-card/50 border border-border p-4 rounded-2xl space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-secondary rounded-xl" />
                  <div className="w-6 h-6 bg-secondary rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2.5 bg-secondary/60 rounded w-1/2" />
                </div>
                <div className="pt-2 border-t border-border/50 flex justify-between">
                  <div className="h-2 bg-secondary rounded w-1/3" />
                  <div className="h-2 bg-secondary rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 bg-card/30 border border-dashed border-border rounded-3xl text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <FolderPlus className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-semibold text-sm">No files found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? `No files match your query "${searchQuery}". Try clearing search.`
                  : "No files available in this folder yet. Click upload to get started."}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          /* Files Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-card border border-border p-4 rounded-2xl space-y-3 hover:border-primary/50 transition-all shadow-sm group hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-105 transition-transform">
                      {file.type === "image" ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : file.type === "video" ? (
                        <Film className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <p className="font-bold text-xs truncate text-foreground group-hover:text-primary transition-colors" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-muted-foreground font-mono">{file.size}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-[11px] text-primary/80 font-medium">{file.folderName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[100px]">{file.uploadedBy}</span>
                  <span>{file.uploadedAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
