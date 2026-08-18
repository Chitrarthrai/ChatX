"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // "HH:MM" 24h format e.g. "17:00"
  onChange: (timeString: string) => void;
  className?: string;
  placeholder?: string;
  align?: "left" | "right";
}

export function CustomTimePicker({
  value,
  onChange,
  className = "",
  placeholder = "Select time",
  align = "right",
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Generate 15/30-minute interval slots across 24 hours
  const timeSlots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hStr = String(h).padStart(2, "0");
      const mStr = String(m).padStart(2, "0");
      const timeVal = `${hStr}:${mStr}`;

      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const label = `${String(displayHour).padStart(2, "0")}:${mStr} ${period}`;

      timeSlots.push({ value: timeVal, label });
    }
  }

  // Format display label for active value
  const formatDisplayTime = (val: string) => {
    if (!val) return placeholder;
    const parts = val.split(":");
    if (parts.length < 2) return val;
    const h = parseInt(parts[0], 10);
    const mStr = parts[1];
    if (isNaN(h)) return val;
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${String(displayHour).padStart(2, "0")}:${mStr} ${period}`;
  };

  const handleSelectTime = (timeVal: string) => {
    onChange(timeVal);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-secondary/80 hover:bg-secondary text-foreground border border-input rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-all select-none"
      >
        <div className="flex items-center gap-2 truncate">
          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{value ? formatDisplayTime(value) : placeholder}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 z-50 w-44 bg-card/95 backdrop-blur-xl border border-border/90 rounded-2xl shadow-2xl p-1.5 text-foreground max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 select-none`}
          ref={listRef}
        >
          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1">
            Select Time Slot
          </div>
          <div className="space-y-0.5">
            {timeSlots.map((slot) => {
              const isSelected = slot.value === value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => handleSelectTime(slot.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-foreground hover:bg-secondary hover:text-primary"
                  }`}
                >
                  <span>{slot.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
