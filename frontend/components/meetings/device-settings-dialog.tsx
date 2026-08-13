"use client";

import React, { useState, useEffect } from "react";
import { Mic, Video, Volume2, Sliders, X, Check, ShieldCheck, Sparkles } from "lucide-react";

interface DeviceSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceSettingsDialog({ isOpen, onClose }: DeviceSettingsDialogProps) {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [virtualBlur, setVirtualBlur] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const mics = devices.filter((d) => d.kind === "audioinput");
        const cams = devices.filter((d) => d.kind === "videoinput");
        const speakers = devices.filter((d) => d.kind === "audiooutput");

        setAudioInputs(mics);
        setVideoInputs(cams);
        setAudioOutputs(speakers);

        if (mics.length > 0) setSelectedMic(mics[0].deviceId);
        if (cams.length > 0) setSelectedCam(cams[0].deviceId);
        if (speakers.length > 0) setSelectedSpeaker(speakers[0].deviceId);
      }).catch((err) => console.warn("Error enumerating devices:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">Audio & Video Device Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Microphone Selection */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-foreground">
              <Mic className="w-4 h-4 text-blue-500" />
              <span>Microphone Input</span>
            </label>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {audioInputs.length === 0 ? (
                <option value="">Default Microphone System Audio</option>
              ) : (
                audioInputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Camera Selection */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-foreground">
              <Video className="w-4 h-4 text-emerald-500" />
              <span>Camera Video Stream</span>
            </label>
            <select
              value={selectedCam}
              onChange={(e) => setSelectedCam(e.target.value)}
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {videoInputs.length === 0 ? (
                <option value="">Default HD Webcam (720p/1080p)</option>
              ) : (
                videoInputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Speaker Output */}
          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2 text-foreground">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Speaker Playback</span>
            </label>
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="w-full bg-secondary border border-input text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {audioOutputs.length === 0 ? (
                <option value="">Default System Audio Output</option>
              ) : (
                audioOutputs.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Speaker ${i + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Audio & Video Enhancements */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Virtual Background Blur</span>
                </p>
                <p className="text-[11px] text-muted-foreground">Blur background stream for privacy.</p>
              </div>
              <input
                type="checkbox"
                checked={virtualBlur}
                onChange={(e) => setVirtualBlur(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">AI Noise Suppression</p>
                <p className="text-[11px] text-muted-foreground">Filter out background noise automatically.</p>
              </div>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Acoustic Echo Cancellation</p>
                <p className="text-[11px] text-muted-foreground">Prevent feedback loops during speaker playback.</p>
              </div>
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-secondary/40 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>WebRTC SFU Hardware Direct API</span>
          </div>
          <button
            onClick={onClose}
            className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
