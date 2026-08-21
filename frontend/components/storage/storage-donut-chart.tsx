"use client";

import React, { useState } from "react";
import { formatStorageBytes, StorageCategoryMetric } from "@/services/storage-manager";
import { Image, Film, FileText, Mic, Database, HardDrive } from "lucide-react";

interface StorageDonutChartProps {
  categories: StorageCategoryMetric[];
  totalUsedBytes: number;
  availableQuotaBytes: number;
}

export function StorageDonutChart({
  categories,
  totalUsedBytes,
  availableQuotaBytes,
}: StorageDonutChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets
  let cumulativePercent = 0;
  const segments = categories.map((cat) => {
    const percent = totalUsedBytes > 0 ? (cat.bytes / totalUsedBytes) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;

    return {
      ...cat,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const getIcon = (id: string) => {
    switch (id) {
      case "photos":
        return <Image className="w-3.5 h-3.5" />;
      case "videos":
        return <Film className="w-3.5 h-3.5" />;
      case "documents":
        return <FileText className="w-3.5 h-3.5" />;
      case "audio":
        return <Mic className="w-3.5 h-3.5" />;
      case "database":
        return <Database className="w-3.5 h-3.5" />;
      default:
        return <HardDrive className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-card/60 rounded-2xl border border-border/80 shadow-sm">
      {/* SVG Donut Visualizer */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width="180" height="180" className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-secondary/40"
          />

          {/* Dynamic Category Segments */}
          {segments.map((seg) => {
            const isHovered = hoveredCategory === seg.id;
            return (
              <circle
                key={seg.id}
                cx="90"
                cy="90"
                r={radius}
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(seg.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${seg.color}88)` : "none",
                }}
              />
            );
          })}
        </svg>

        {/* Center Disk Quota Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <HardDrive className="w-4 h-4 text-muted-foreground mb-0.5" />
          <span className="text-base font-bold tracking-tight text-foreground">
            {formatStorageBytes(totalUsedBytes)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            of {formatStorageBytes(availableQuotaBytes)}
          </span>
        </div>
      </div>

      {/* Segmented Category Breakdown Legend */}
      <div className="flex-1 w-full space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
          <span>Category Breakdown</span>
          <span>{categories.reduce((acc, c) => acc + c.count, 0)} items cached</span>
        </div>

        {/* Horizontal Stacked Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-secondary/50 p-0.5 gap-0.5">
          {segments.map((seg) => (
            <div
              key={seg.id}
              style={{
                width: `${Math.max(2, seg.percent)}%`,
                backgroundColor: seg.color,
              }}
              className="h-full rounded-sm transition-all hover:opacity-80"
              title={`${seg.label}: ${formatStorageBytes(seg.bytes)} (${seg.percent.toFixed(1)}%)`}
            />
          ))}
        </div>

        {/* Category Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.id;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isHovered
                    ? "bg-secondary border-foreground/30 shadow-sm"
                    : "bg-secondary/30 hover:bg-secondary/50 border-border/50"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[11px] font-medium text-foreground truncate">
                    {cat.label.split("&")[0].trim()}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-foreground shrink-0">
                  {formatStorageBytes(cat.bytes)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
