"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface TypingIndicatorProps {
  typingUsers?: string[];
}

export function TypingIndicator({ typingUsers = [] }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground animate-in fade-in duration-150">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
      </div>
      <span>
        {typingUsers.length === 1
          ? `${typingUsers[0]} is typing...`
          : typingUsers.length === 2
          ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
          : "Multiple people are typing..."}
      </span>
    </div>
  );
}
