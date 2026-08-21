"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/services/auth";
import {
  Settings,
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Laptop,
  Globe,
  ArrowLeft,
  Key,
  Smartphone,
  LogOut,
  CheckCircle2,
  Loader2,
  Save,
  Clock,
  Sparkles,
  HardDrive,
  Sliders,
} from "lucide-react";
import { StorageManagementDialog } from "@/components/storage/storage-management-dialog";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");

  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (currentUser) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, username, bio, timezone, language")
            .eq("id", currentUser.id)
            .single();

          if (prof) {
            setFullName(prof.full_name || "");
            setUsername(prof.username || currentUser.email?.split("@")[0] || "");
            setBio(prof.bio || "");
            setTimezone(prof.timezone || "UTC");
            setLanguage(prof.language || "en");
          } else if (authProfile) {
            setFullName(authProfile.fullName || "");
            setUsername(authProfile.username || "");
            setBio(authProfile.bio || "");
          }
        } else if (authProfile) {
          setFullName(authProfile.fullName || "");
          setUsername(authProfile.username || "");
          setBio(authProfile.bio || "");
        }
      } catch (err: any) {
        console.warn("Using local auth profile state:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [authProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            username: username,
            bio: bio,
            timezone: timezone,
            language: language,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser.id);

        if (updateErr) throw updateErr;

        if (refreshProfile) await refreshProfile();
        setSuccessMessage("Settings and profile preferences updated successfully!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setSuccessMessage("Profile updated locally.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      /* Session cleared */
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_view_mode", "landing");
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight">Application & Account Settings</h1>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="bg-destructive text-destructive-foreground hover:opacity-90 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {error}
          </div>
        )}

        {loading ? (
          /* Skeleton Loader */
          <div className="space-y-6 animate-pulse">
            <div className="bg-card/50 border border-border p-6 rounded-2xl space-y-4">
              <div className="h-4 bg-secondary rounded w-1/4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-secondary rounded-xl" />
                <div className="h-10 bg-secondary rounded-xl" />
              </div>
            </div>
            <div className="bg-card/50 border border-border p-6 rounded-2xl space-y-4">
              <div className="h-4 bg-secondary rounded w-1/3" />
              <div className="h-12 bg-secondary rounded-xl" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Profile Preferences */}
            <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Account Profile</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">
                    Email Address
                  </label>
                  <input
                    disabled
                    value={user?.email || "user@chatx.platform"}
                    className="w-full bg-secondary/60 text-foreground p-2.5 rounded-xl border border-input opacity-70 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Managed via Supabase Auth</p>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-medium">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-secondary border border-input text-foreground p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">EST (Eastern Standard Time)</option>
                    <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                    <option value="Asia/Kolkata">IST (India Standard Time)</option>
                    <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 text-xs font-medium">
                  Bio / Headline
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your team about your role..."
                  className="w-full bg-secondary border border-input text-foreground text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none"
                />
              </div>
            </div>

            {/* Appearance & Theme Selector */}
            <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Appearance & Theme</span>
              </h2>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Choose how ChatX looks to you on this device.</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      theme === "dark"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/60 hover:bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      theme === "light"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/60 hover:bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      theme === "system"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/60 hover:bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                    <span>System</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Telegram-Style Data & Storage Management */}
            <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-500" />
                  <span>Data & Local Storage</span>
                </h2>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-500 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Telegram-Grade
                </span>
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl border border-border/80 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Storage Usage & Cache Controls</p>
                  <p className="text-[11px] text-muted-foreground">
                    Inspect local media breakdown, configure auto-purge retention rules, and clear cache without losing cloud data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStorageOpen(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Manage Storage</span>
                </button>
              </div>
            </div>

            {/* Privacy & Notifications */}
            <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Privacy & Notifications</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Read Receipts</p>
                    <p className="text-muted-foreground">Allow team members to see when you've viewed their messages.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-semibold text-foreground">Desktop & Push Notifications</p>
                    <p className="text-muted-foreground">Receive instant desktop notifications for direct mentions and calls.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground text-xs font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Telegram-Style Storage & Cache Management Modal */}
      <StorageManagementDialog
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
      />
    </div>
  );
}
