"use client";

import React from "react";

interface ReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const COMMON_EMOJIS = ["👍", "❤️", "🔥", "🎉", "🚀", "😂", "👀", "🙌"];

export function ReactionPicker({ onSelectEmoji, onClose }: ReactionPickerProps) {
  return (
    <div className="bg-card border border-border rounded-full p-1.5 shadow-xl flex items-center gap-1 backdrop-blur-md animate-in zoom-in-95 duration-150">
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelectEmoji(emoji);
            onClose();
          }}
          className="hover:bg-secondary p-1.5 rounded-full text-base transition-transform hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
