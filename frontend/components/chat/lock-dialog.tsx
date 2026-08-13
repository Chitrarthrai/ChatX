"use client";

import React, { useState } from "react";
import { Lock, Unlock, ShieldAlert, Key, X, Check } from "lucide-react";

interface LockDialogProps {
  isOpen: boolean;
  conversationTitle: string;
  isCurrentlyLocked: boolean;
  onClose: () => void;
  onConfirmLockState: (pin: string, lock: boolean) => void;
}

export function LockDialog({
  isOpen,
  conversationTitle,
  isCurrentlyLocked,
  onClose,
  onConfirmLockState,
}: LockDialogProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (pin.length < 4) {
      setErrorMsg("PIN code must be at least 4 digits long.");
      return;
    }

    if (!isCurrentlyLocked && pin !== confirmPin) {
      setErrorMsg("PIN codes do not match.");
      return;
    }

    onConfirmLockState(pin, !isCurrentlyLocked);
    setPin("");
    setConfirmPin("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCurrentlyLocked ? <Unlock className="w-4 h-4 text-success" /> : <Lock className="w-4 h-4 text-warning" />}
            <h2 className="font-semibold text-sm tracking-tight">
              {isCurrentlyLocked ? "Unlock Conversation" : "Lock Conversation"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Key className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="font-semibold text-foreground truncate">{conversationTitle}</span>
              <span className="text-[10px] text-muted-foreground">
                {isCurrentlyLocked ? "Enter PIN to unlock" : "Set a secure PIN to restrict access"}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-[11px] font-medium flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              {isCurrentlyLocked ? "Enter 4-Digit Security PIN" : "Create Security PIN"}
            </label>
            <input
              type="password"
              maxLength={6}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-widest text-base bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          {!isCurrentlyLocked && (
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Confirm Security PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-base bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
          )}

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
              disabled={!pin.trim()}
              className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
            >
              {isCurrentlyLocked ? "Unlock Chat" : "Lock Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
