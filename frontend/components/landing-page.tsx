"use client";

import React, { useState } from "react";
import {
  Video,
  MessageSquare,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronRight,
  Sliders,
  BarChart2,
  HardDrive,
  Check,
  Star,
  HelpCircle,
  ChevronDown,
  PhoneCall,
  Calendar,
  Search,
  FileText
} from "lucide-react";
import Link from "next/link";

interface LandingPageProps {
  onOpenAuth: (mode?: "login" | "signup") => void;
  onEnterApp: () => void;
}

export function LandingPage({ onOpenAuth, onEnterApp }: LandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"video" | "chat" | "ai" | "security">("video");

  const faqs = [
    {
      q: "What makes ChatX different from Slack or Microsoft Teams?",
      a: "ChatX combines Telegram-speed messaging, Google Meet HD video conferencing, Microsoft Teams org hierarchies, and built-in AI meeting intelligence into a single unified platform. You no longer need 4 separate SaaS subscriptions."
    },
    {
      q: "How does the WebRTC SFU engine handle large video calls?",
      a: "ChatX utilizes a low-latency Selective Forwarding Unit (SFU) architecture that routes audio/video streams efficiently without overloading client hardware, supporting sub-50ms latency for hundreds of active video participants."
    },
    {
      q: "Is data end-to-end secure with PostgreSQL RLS policies?",
      a: "Yes. Every workspace, channel, meeting, and message is protected with strict Row Level Security (RLS) policies at the PostgreSQL database level, ensuring total multi-tenant data isolation and compliance."
    },
    {
      q: "Can I deploy ChatX on-premise or in an isolated cloud environment?",
      a: "Absolutely. ChatX is built with a decoupled monorepo architecture allowing full self-hosted Docker/Kubernetes deployment alongside Supabase self-hosted instances."
    }
  ];

  const pricingTiers = [
    {
      name: "Developer / Starter",
      priceMonthly: "$0",
      priceAnnual: "$0",
      desc: "Perfect for small teams and developers getting started.",
      features: [
        "Up to 25 team members",
        "Unlimited Telegram-speed DMs & Channels",
        "720p HD Video Meetings (up to 45 mins)",
        "5 GB Enterprise File Storage",
        "Basic AI Summaries (5 / month)"
      ],
      cta: "Get Started Free",
      highlight: false,
      mode: "signup" as const
    },
    {
      name: "Pro Enterprise",
      priceMonthly: "$19",
      priceAnnual: "$15",
      desc: "For growing companies needing unlimited HD calls & AI tools.",
      features: [
        "Unlimited Team Members & Channels",
        "1080p 60fps SFU Video Meetings (Unlimited time)",
        "Full AI Meeting Intelligence & RAG Search",
        "100 GB File Storage & Recording Cloud",
        "PIN-Protected Locked Channels",
        "24/7 Priority Support & 99.99% SLA"
      ],
      cta: "Start 14-Day Free Trial",
      highlight: true,
      mode: "signup" as const
    },
    {
      name: "Custom Enterprise",
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      desc: "Dedicated infrastructure, SOC2 compliance & custom SLA.",
      features: [
        "Dedicated SFU Server Cluster",
        "Self-Hosted / On-Premise Deployment",
        "Custom SSO (SAML 2.0, Okta, Azure AD)",
        "Unlimited Cloud Storage & Transcripts",
        "Custom AI Model Fine-Tuning",
        "Dedicated Account Executive"
      ],
      cta: "Contact Enterprise Sales",
      highlight: false,
      mode: "login" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 border-b border-border py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2">
        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          v2.4 Live
        </span>
        <span>ChatX AI Workspace, SFU Video Conferencing & Realtime Supabase Backend is Active!</span>
        <button
          onClick={() => onOpenAuth("signup")}
          className="text-primary hover:underline font-semibold flex items-center gap-0.5 ml-2"
        >
          Try Free <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
            <div className="w-9 h-9 bg-gradient-to-tr from-primary to-blue-500 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-primary/20">
              X
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              ChatX
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#video" className="hover:text-foreground transition-colors">Video & HD Calls</a>
            <a href="#chat" className="hover:text-foreground transition-colors">Telegram Chat</a>
            <a href="#ai" className="hover:text-foreground transition-colors">AI Assistant</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth("login")}
              className="text-xs font-semibold px-4 py-2 rounded-lg hover:bg-secondary transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/80 border border-border px-4 py-1.5 rounded-full text-xs font-medium text-secondary-foreground shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Built with Supabase Realtime & WebRTC SFU Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Industrial-Grade <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent">Video Conferencing</span> & Collaboration
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Combines Google Meet HD video meetings, Microsoft Teams organizations, Telegram-speed messaging, and AI meeting intelligence in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto bg-primary hover:opacity-90 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Enter Live Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto bg-card hover:bg-secondary text-card-foreground border border-border font-semibold px-8 py-3.5 rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-primary fill-primary" />
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-border/60 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-black text-primary">10k+</div>
              <div className="text-xs text-muted-foreground mt-1">Concurrent Users</div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-black text-blue-500">&lt; 50ms</div>
              <div className="text-xs text-muted-foreground mt-1">Realtime Latency</div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-500">100%</div>
              <div className="text-xs text-muted-foreground mt-1">PostgreSQL RLS Security</div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-black text-purple-500">AI</div>
              <div className="text-xs text-muted-foreground mt-1">Auto Meeting Intelligence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section id="features" className="py-20 px-6 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Four Powerhouses in One Unified Engine</h2>
            <p className="text-sm text-muted-foreground">
              Everything your enterprise needs to communicate, run high-stakes meetings, and organize institutional knowledge.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: "video", label: "HD Video Meetings", icon: Video },
              { id: "chat", label: "Telegram Fast Chat", icon: MessageSquare },
              { id: "ai", label: "AI Meeting Assistant", icon: Sparkles },
              { id: "security", label: "Enterprise Security", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Feature Preview Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="space-y-4">
              {activeTab === "video" && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold">Google Meet Level HD Video Stage</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Selective Forwarding Unit (SFU) WebRTC engine powering sub-50ms video calls. Features multi-participant grid views, active speaker highlighting, screen sharing, Virtual Background Blur, and AI Noise Suppression.
                  </p>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>24ms SFU Low Latency Media Pipeline</span></div>
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>AI Noise Cancellation & Echo Suppression</span></div>
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>Lobby Host Admission & Waiting Room</span></div>
                  </div>
                  <button onClick={onEnterApp} className="bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
                    <span>Try Video Stage Live</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === "chat" && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold">Telegram-Speed Realtime Messaging</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Powered by Supabase Realtime Postgres Channels. Instant message delivery, file attachments, voice messages, emoji reactions, scheduled messages, and PIN-locked private channels.
                  </p>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>Realtime Typing & Online Presence Indicators</span></div>
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>Double Blue Read Receipts & Delivery Ticks</span></div>
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>Unsent Draft Message Persistence</span></div>
                  </div>
                  <button onClick={onEnterApp} className="bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
                    <span>Open Workspace Chat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === "ai" && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold">AI Meeting Assistant & Notes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automatically transcribes audio streams, generates executive summaries, extracts assigned action items, and offers permission-aware knowledge base search across all conversations and documents.
                  </p>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>Automated Action Item Extraction</span></div>
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>RAG Knowledge Search across files & chats</span></div>
                  </div>
                  <button onClick={onEnterApp} className="bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
                    <span>Explore AI Assistant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold">PostgreSQL Row Level Security (RLS)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enterprise multi-tenant isolation out of the box. Organization, Team, and Channel level RBAC permissions enforced directly in PostgreSQL database policies with audit logging.
                  </p>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>Full Migration 00001-00004 Schema Applied</span></div>
                    <div className="flex items-center gap-2 text-emerald-500"><Check className="w-4 h-4" /> <span>OAuth 2.0 (Google, GitHub, Microsoft Azure)</span></div>
                  </div>
                  <button onClick={() => onOpenAuth("login")} className="bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
                    <span>View Security Specs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-64 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono bg-neutral-800 px-2 py-1 rounded text-primary">ChatX Engine Live Stage</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="space-y-2 text-center py-6">
                <p className="font-bold text-lg">ChatX Production Platform</p>
                <p className="text-xs text-gray-400">Connected to Live Supabase DB & SFU Node</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-neutral-800 pt-3">
                <span>Latency: 24 ms</span>
                <span>RLS Status: Enforced ✅</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Flexible Pricing for Every Scale</h2>
            <p className="text-sm text-muted-foreground">
              Transparent plans with zero hidden fees. Upgrade or downgrade anytime.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center gap-3 bg-secondary/80 border border-border p-1.5 rounded-full text-xs font-semibold pt-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  billingCycle === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-card border rounded-3xl p-8 space-y-6 flex flex-col justify-between transition-all ${
                  tier.highlight
                    ? "border-primary ring-2 ring-primary/20 shadow-2xl relative scale-105"
                    : "border-border shadow-sm hover:border-border/80"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{billingCycle === "annual" ? tier.priceAnnual : tier.priceMonthly}</span>
                    {tier.priceMonthly !== "Custom" && <span className="text-xs text-muted-foreground">/ user / month</span>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tier.desc}</p>
                  <div className="border-t border-border pt-4 space-y-2 text-xs">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-foreground">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenAuth(tier.mode)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md mt-6 ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 bg-secondary/30 border-t border-border">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Have questions about ChatX? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === idx ? "rotate-180 text-primary" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-secondary/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Enterprise Footer */}
      <footer className="bg-card border-t border-border py-16 px-6 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-black text-lg">
                X
              </div>
              <span className="text-lg font-black text-foreground">ChatX</span>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Industrial-grade video conferencing & collaboration platform combining Google Meet, Telegram, MS Teams, and AI intelligence.
            </p>
            <p className="text-[11px] text-muted-foreground">© 2026 ChatX Technologies Inc. All rights reserved.</p>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Platform Pages</p>
            <ul className="space-y-2">
              <li><Link href="/files" className="hover:text-primary transition-colors">Enterprise Files</Link></li>
              <li><Link href="/contacts" className="hover:text-primary transition-colors">User Directory</Link></li>
              <li><Link href="/calls" className="hover:text-primary transition-colors">Call History</Link></li>
              <li><Link href="/saved" className="hover:text-primary transition-colors">Saved Messages</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Workspace</p>
            <ul className="space-y-2">
              <li><Link href="/search" className="hover:text-primary transition-colors">Global Search</Link></li>
              <li><Link href="/notifications" className="hover:text-primary transition-colors">Notifications</Link></li>
              <li><Link href="/calendar" className="hover:text-primary transition-colors">Calendar Sync</Link></li>
              <li><Link href="/recordings" className="hover:text-primary transition-colors">Recordings Library</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Admin & Security</p>
            <ul className="space-y-2">
              <li><Link href="/admin" className="hover:text-primary transition-colors">Organization Admin</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors">Account Settings</Link></li>
              <li><button onClick={() => onOpenAuth("login")} className="hover:text-primary transition-colors">Supabase Auth</button></li>
              <li><button onClick={onEnterApp} className="hover:text-primary transition-colors">Launch Workspace</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
