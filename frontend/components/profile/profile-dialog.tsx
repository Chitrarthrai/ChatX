"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { updateProfile } from "@/services/profile";
import { signOut } from "@/services/auth";
import { User, X, Check, Phone, Clock, ShieldCheck, LogOut, Trash2, AlertCircle } from "lucide-react";
import type { UserStatus } from "@chatx/types";
import { DeleteAccountDialog } from "./delete-account-dialog";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user, profile, refreshProfile, clearLocalUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [status, setStatus] = useState<UserStatus>("online");
  const [customStatus, setCustomStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setTimezone(profile.timezone || "UTC");
      setStatus(profile.status || "online");
      setCustomStatus(profile.customStatus || "");
    }
  }, [profile]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile(user.id, {
        fullName,
        bio,
        phone,
        timezone,
        status,
        customStatus,
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    clearLocalUser();
    try {
      await signOut();
    } catch (err: any) {
      console.error("Failed to revoke sessions:", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm tracking-tight">Edit Profile & Account Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {/* Avatar & Header Preview */}
          <div className="flex items-center gap-4 p-4 bg-secondary/40 rounded-xl border border-border">
            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md">
              {(fullName || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm text-foreground">{fullName || "User"}</span>
              <span className="text-muted-foreground">{user.email}</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-500 mt-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Supabase Account</span>
              </div>
            </div>
          </div>

          {/* Presence Status Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              Presence Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "online", label: "Online", color: "bg-emerald-500" },
                { id: "away", label: "Away", color: "bg-amber-500" },
                { id: "dnd", label: "Do Not Disturb", color: "bg-destructive" },
                { id: "offline", label: "Offline", color: "bg-muted-foreground" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id as UserStatus)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border font-medium transition-all ${
                    status === item.id
                      ? "bg-accent border-primary text-primary font-semibold"
                      : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="w-3.5 h-3.5 absolute left-3 text-muted-foreground" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg pl-8 pr-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Bio / Status Message</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are you working on today?"
              className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {/* Timezone */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Timezone</label>
            <div className="relative flex items-center">
              <Clock className="w-3.5 h-3.5 absolute left-3 text-muted-foreground" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-secondary/60 text-foreground rounded-lg pl-8 pr-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>

          {/* Security & Danger Zone */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between bg-secondary/30 p-2.5 rounded-lg">
              <div>
                <p className="font-semibold text-foreground">Revoke Active Sessions</p>
                <p className="text-[10px] text-muted-foreground">Logout from all web and mobile devices.</p>
              </div>
              <button
                type="button"
                onClick={handleRevokeAllSessions}
                className="bg-secondary hover:bg-accent text-secondary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg border border-border transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout All</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
              <div>
                <p className="font-semibold text-destructive">Delete Account</p>
                <p className="text-[10px] text-muted-foreground">Permanently delete your profile, messages, and files.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="bg-destructive text-destructive-foreground hover:opacity-90 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-muted-foreground hover:bg-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : null}
              <span>{saving ? "Saving..." : savedSuccess ? "Saved!" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
