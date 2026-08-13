"use client";

import React, { useState } from "react";
import { Send, X, Search, Check, Hash, User } from "lucide-react";

interface ForwardDialogProps {
  isOpen: boolean;
  messageContent: string;
  onClose: () => void;
  onForward: (targetChannel: string) => void;
}

export function ForwardDialog({ isOpen, messageContent, onClose, onForward }: ForwardDialogProps) {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [search, setSearch] = useState("");

  const targets = [
    { name: "Architecture & Engineering", type: "channel" },
    { name: "Frontend & Design System", type: "channel" },
    { name: "WebRTC Infrastructure", type: "channel" },
    { name: "Alex Mercer", type: "user" },
    { name: "Sarah Jenkins", type: "user text-emerald-500" },
  ];

  if (!isOpen) return null;

  const handleSend = () => {
    if (selectedTarget) {
      onForward(selectedTarget);
      onClose();
    }
  };

  const filtered = targets.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm">Forward Message</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-secondary/50 p-3 rounded-xl border border-border text-muted-foreground italic truncate">
            "{messageContent}"
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channel or user..."
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTarget(t.name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  selectedTarget === t.name
                    ? "bg-primary/10 border-primary text-primary font-semibold"
                    : "bg-card border-border hover:bg-secondary text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.type.includes("channel") ? <Hash className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-emerald-500" />}
                  <span>{t.name}</span>
                </div>
                {selectedTarget === t.name && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-secondary/40 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedTarget}
            className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
