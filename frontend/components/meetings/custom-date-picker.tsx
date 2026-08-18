"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check
} from "lucide-react";

interface CustomDatePickerProps {
  value: Date | string;
  onChange: (date: Date, dateString: string) => void;
  className?: string;
  placeholder?: string;
  highlightDates?: (Date | string)[];
  align?: "left" | "right";
  showPresets?: boolean;
}

export function CustomDatePicker({
  value,
  onChange,
  className = "",
  placeholder = "Select date",
  highlightDates = [],
  align = "right",
  showPresets = true,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date
  const selectedDate = typeof value === "string" ? (value ? new Date(value) : new Date()) : value || new Date();

  // Active viewing month/year in the calendar popover
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());

  useEffect(() => {
    if (value) {
      const d = typeof value === "string" ? new Date(value) : value;
      if (!isNaN(d.getTime())) {
        setViewMonth(d.getMonth());
        setViewYear(d.getFullYear());
      }
    }
  }, [value]);

  // Click outside listener to close popover
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleSelectDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(date, formatted);
    setIsOpen(false);
  };

  const handleSelectPreset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    handleSelectDate(d);
  };

  // Generate days grid for current viewing month
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthTotalDays = new Date(viewYear, viewMonth, 0).getDate();

  const daysGrid = [];

  // Prev month filler days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysGrid.push({
      date: new Date(viewYear, viewMonth - 1, prevMonthTotalDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysGrid.push({
      date: new Date(viewYear, viewMonth, i),
      isCurrentMonth: true,
    });
  }

  // Next month filler days to complete grid
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({
      date: new Date(viewYear, viewMonth + 1, i),
      isCurrentMonth: false,
    });
  }

  const MONTH_NAMES_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Deterministic format to avoid SSR/Client locale hydration mismatch
  const formatDisplayString = (d: Date) => {
    if (!d || isNaN(d.getTime())) return "";
    const dayName = DAY_NAMES_SHORT[d.getDay()];
    const monthName = MONTH_NAMES_SHORT[d.getMonth()];
    const dayNum = d.getDate();
    const yearNum = d.getFullYear();
    return `${dayName}, ${monthName} ${dayNum}, ${yearNum}`;
  };

  const isHighlighted = (date: Date) => {
    return highlightDates.some((hd) => {
      const hDate = typeof hd === "string" ? new Date(hd) : hd;
      return isSameDay(hDate, date);
    });
  };

  const today = new Date();

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-secondary/80 hover:bg-secondary text-foreground border border-input rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-all select-none"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate" suppressHydrationWarning>
            {value ? formatDisplayString(selectedDate) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Glassmorphism Dark-Mode Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 z-50 w-72 bg-card/95 backdrop-blur-xl border border-border/90 rounded-2xl shadow-2xl p-4 text-foreground animate-in fade-in zoom-in-95 duration-150 select-none`}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-foreground tracking-tight">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Abbreviations */}
          <div className="grid grid-cols-7 text-center font-semibold text-[10px] text-muted-foreground/80 pt-3 pb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 py-1 text-xs">
            {daysGrid.map(({ date, isCurrentMonth }, idx) => {
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isSameDay(date, today);
              const hasEvents = isHighlighted(date);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={`h-8 w-8 mx-auto rounded-xl flex flex-col items-center justify-center relative font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                      : isTodayDate
                      ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
                      : isCurrentMonth
                      ? "text-foreground hover:bg-secondary hover:text-primary"
                      : "text-muted-foreground/30 hover:text-muted-foreground/60"
                  }`}
                >
                  <span className="text-[11px] leading-none">{date.getDate()}</span>
                  {hasEvents && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action Presets */}
          {showPresets && (
            <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
              <button
                type="button"
                onClick={() => handleSelectPreset(0)}
                className="px-2 py-1 rounded-lg bg-secondary text-foreground hover:bg-primary/20 hover:text-primary transition-all font-semibold"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(1)}
                className="px-2 py-1 rounded-lg bg-secondary text-foreground hover:bg-primary/20 hover:text-primary transition-all font-semibold"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(7)}
                className="px-2 py-1 rounded-lg bg-secondary text-foreground hover:bg-primary/20 hover:text-primary transition-all font-semibold"
              >
                +1 Week
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
