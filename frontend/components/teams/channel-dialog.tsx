"use client";

import React, { useState } from "react";
import { Hash, Volume2, Megaphone, Lock, Globe, X, Plus } from "lucide-react";
import type { ChannelType } from "@chatx/types";

interface ChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channel: { name: string; topic: string; type: ChannelType; isPrivate: boolean }) => void;
}

export function ChannelDialog({ isOpen, onClose, onCreateChannel }: ChannelDialogProps) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ChannelType>("text");
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedName = name.toLowerCase().replace(/\s+/g, "-");
    onCreateChannel({
      name: formattedName,
      topic,
      type,
      isPrivate,
    });

    setName("");
    setTopic("");
    setType("text");
    setIsPrivate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm tracking-tight">Create Channel</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Channel Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channel Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "text", label: "Text", icon: Hash },
                { id: "voice", label: "Voice", icon: Volume2 },
                { id: "announcement", label: "Announce", icon: Megaphone },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as ChannelType)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-accent border-primary text-primary font-semibold"
                        : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channel Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Channel Name</label>
            <div className="relative flex items-center">
              <Hash className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. backend-architecture"
                className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg pl-9 pr-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Topic (Optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg px-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-xl border border-border">
            <div className="flex items-center gap-2.5">
              {isPrivate ? <Lock className="w-4 h-4 text-warning" /> : <Globe className="w-4 h-4 text-success" />}
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground">Private Channel</span>
                <span className="text-[10px] text-muted-foreground">Only invited members can access</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
