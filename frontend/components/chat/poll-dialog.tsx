"use client";

import React, { useState } from "react";
import { BarChart2, Plus, Trash2, X, Shield, Clock } from "lucide-react";

interface PollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (poll: { question: string; options: string[]; isMultipleChoice: boolean; isAnonymous: boolean }) => void;
}

export function PollDialog({ isOpen, onClose, onCreatePoll }: PollDialogProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Option ${options.length + 1}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some((o) => !o.trim())) return;

    onCreatePoll({
      question,
      options,
      isMultipleChoice,
      isAnonymous,
    });

    setQuestion("");
    setOptions(["Option 1", "Option 2"]);
    setIsMultipleChoice(false);
    setIsAnonymous(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm tracking-tight">Create Channel Poll</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Question Input */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Poll Question</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Options List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">Poll Options</label>
              <span className="text-[10px] text-muted-foreground">{options.length}/6 options</span>
            </div>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2 border border-dashed border-border text-primary hover:bg-secondary/60 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Multiple Answers</span>
                <span className="text-[10px] text-muted-foreground">Allow selecting more than one option</span>
              </div>
              <input
                type="checkbox"
                checked={isMultipleChoice}
                onChange={(e) => setIsMultipleChoice(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Anonymous Voting</span>
                <span className="text-[10px] text-muted-foreground">Hide voter identity in results</span>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={!question.trim()}
              className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
