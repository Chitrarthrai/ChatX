"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, ChevronRight, ChevronLeft, Check, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface TourStep {
  title: string;
  description: string;
  badge?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to ChatX Workspace! 🚀",
    description: "ChatX combines Google Meet video meetings, Telegram fast chat, Microsoft Teams organization, and AI meeting intelligence in one platform.",
    badge: "Step 1 of 4",
  },
  {
    title: "Realtime Chat & Channels 💬",
    description: "Switch between Direct Messages, Team Channels, and Saved Messages. Use threaded replies, emoji reactions, polls, and conversation locking.",
    badge: "Step 2 of 4",
  },
  {
    title: "SFU Video Conferencing 📹",
    description: "Start instant or scheduled HD video meetings. Use host controls, hand raise, noise cancellation, screen sharing, and cloud recordings.",
    badge: "Step 3 of 4",
  },
  {
    title: "AI Workspace Assistant 🤖",
    description: "Click the AI Assistant drawer to get instant summaries of past meetings, assigned action items, and permission-aware knowledge base search.",
    badge: "Step 4 of 4",
  },
];

interface SiteTourProps {
  onComplete?: () => void;
}

export function SiteTour({ onComplete }: SiteTourProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkTourStatus = async () => {
      if (typeof window === "undefined") return;
      // Fast path: localStorage
      const localDone = localStorage.getItem("chatx_tour_completed");
      if (localDone) return;

      // Check Supabase profile for has_completed_tour
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('has_completed_tour')
            .eq('id', user.id)
            .single();
          if (data?.has_completed_tour) {
            localStorage.setItem("chatx_tour_completed", "true");
            return;
          }
        }
      } catch { /* unauthenticated — show tour */ }

      setIsOpen(true);
    };
    checkTourStatus();
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTour();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishTour = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_tour_completed", "true");
    }
    // Persist to Supabase profiles so it works cross-device
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ has_completed_tour: true })
          .eq('id', user.id);
      }
    } catch { /* ignore if column doesn't exist yet */ }
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finishTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!mounted) return null;

  if (!isOpen) {
    return null; // Do not block UI with intrusive floating buttons unless requested
  }

  const step = TOUR_STEPS[currentStep];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) finishTour();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 cursor-default"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {step.badge}
              </span>
              <h3 className="text-base font-bold leading-tight">{step.title}</h3>
            </div>
          </div>
          <button
            onClick={finishTour}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 pt-2">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-8 bg-primary"
                    : idx < currentStep
                    ? "w-3 bg-primary/40"
                    : "w-3 bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-secondary/40 border-t border-border flex items-center justify-between">
          <button
            onClick={finishTour}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="bg-secondary hover:bg-accent text-secondary-foreground text-xs font-semibold px-3 py-2 rounded-lg border border-border transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-1"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}</span>
              {currentStep === TOUR_STEPS.length - 1 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
