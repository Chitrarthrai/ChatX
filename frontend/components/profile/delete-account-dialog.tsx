"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Trash2, Check } from "lucide-react";
import { signOut } from "@/services/auth";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const { user } = useAuth();
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation.toLowerCase() !== "delete my account") {
      setError('Type "delete my account" exactly to confirm.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      // Delete profile row (cascade will clean up related data)
      await supabase.from("profiles").delete().eq("id", user.id);
      // Sign out
      await signOut();
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-destructive/50 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <h3 className="font-bold text-sm text-destructive">Delete Account</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-6 space-y-4 text-xs">
          <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-destructive">This action is permanent and irreversible.</p>
              <p className="text-muted-foreground leading-relaxed">
                All your messages, files, contacts, meetings and personal data will be permanently deleted from ChatX servers.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-destructive text-xs font-medium">{error}</p>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Type <span className="text-destructive font-mono">delete my account</span> to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="delete my account"
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-destructive"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || confirmation.toLowerCase() !== "delete my account"}
              className="bg-destructive hover:opacity-90 text-destructive-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {loading ? "Deleting..." : "Permanently Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
