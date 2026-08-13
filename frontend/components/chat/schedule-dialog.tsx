"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, X, Send } from "lucide-react";

interface ScheduleDialogProps {
  isOpen: boolean;
  messageContent: string;
  onClose: () => void;
  onSchedule: (scheduledFor: string) => void;
}

export function ScheduleDialog({ isOpen, messageContent, onClose, onSchedule }: ScheduleDialogProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledFor = `${date}T${time}:00`;
    onSchedule(scheduledFor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">Schedule Message</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4 text-xs">
          <div className="bg-secondary/50 p-3 rounded-xl border border-border text-muted-foreground italic truncate">
            "{messageContent}"
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Select Date</label>
            <div className="relative flex items-center">
              <CalendarIcon className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Select Time</label>
            <div className="relative flex items-center">
              <Clock className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="p-4 bg-secondary/40 border-t border-border flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Schedule Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
