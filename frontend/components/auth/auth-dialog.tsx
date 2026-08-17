"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmail, signUpWithEmail, signInWithOAuth, resetPasswordForEmail } from "@/services/auth";
import { Lock, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle, CheckCircle2, Github, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
  onSuccessLogin?: () => void;
}

export function AuthDialog({ isOpen, onClose, defaultMode = "login", onSuccessLogin }: AuthDialogProps) {
  const { setLocalUser } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Sync internal mode when parent changes defaultMode (e.g., switching from login to signup)
  useEffect(() => {
    setMode(defaultMode);
    setError(null);
    setMessage(null);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
          setError("Please enter your email address and password.");
          setLoading(false);
          return;
        }

        let res;
        try {
          res = await signInWithEmail({ email: cleanEmail, password: cleanPassword });
        } catch (err: any) {
          setError(err.message || "Invalid credentials. Please check your email and password.");
          setLoading(false);
          return;
        }

        const userObj = res?.user;
        if (!userObj) {
          setError("Invalid email or password. Please check your credentials.");
          setLoading(false);
          return;
        }

        setLocalUser(userObj);
        if (typeof window !== "undefined") {
          localStorage.setItem("chatx_active_user", JSON.stringify(userObj));
          localStorage.setItem("chatx_view_mode", "workspace");
        }

        if (onSuccessLogin) {
          onSuccessLogin();
        }
        onClose();
        setLoading(false);
        return;
      } else if (mode === "signup") {
        await signUpWithEmail({ email, password, fullName, username });
        setShowVerification(true);
        setMessage("Account created! Check your email and click the verification link before signing in.");
      } else if (mode === "forgot") {
        await resetPasswordForEmail(email);
        setMessage("Password reset instructions have been sent to your email.");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "azure" | "github") => {
    setError(null);
    setMessage(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("chatx_view_mode", "workspace");
      }
      await signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || `${provider} authentication failed.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-border text-center space-y-1">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-2xl shadow-lg shadow-primary/20">
            X
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {mode === "login" && "Welcome back to ChatX"}
            {mode === "signup" && "Create your ChatX Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Industrial-grade video conferencing, chat, and AI workspace collaboration platform.
          </p>
        </div>

        {/* OAuth Buttons */}
        {mode !== "forgot" && (
          <div className="p-6 pb-2 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleOAuth("google")}
                type="button"
                className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground text-xs font-medium py-2.5 px-3 rounded-lg border border-border transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                onClick={() => handleOAuth("github")}
                type="button"
                className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground text-xs font-medium py-2.5 px-3 rounded-lg border border-border transition-all"
              >
                <Github className="w-4 h-4 shrink-0" />
                <span>GitHub</span>
              </button>

              <button
                onClick={() => handleOAuth("azure")}
                type="button"
                className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground text-xs font-medium py-2.5 px-3 rounded-lg border border-border transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold absolute">
                Or with Email
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 pt-2 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {showVerification && (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-xs space-y-2">
              <p className="font-semibold text-foreground">📧 Verify your email address</p>
              <p className="text-muted-foreground">Check your inbox and click the verification link to activate your account.</p>
              <button
                type="button"
                onClick={async () => {
                  try { await resetPasswordForEmail(email); setMessage("Verification email resent!"); } catch {}
                }}
                className="text-primary font-semibold hover:underline text-[11px]"
              >
                Didn't receive it? Resend verification email →
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 absolute left-3 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg pl-9 pr-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 absolute left-3 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username (e.g. alexm)"
                    className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg pl-9 pr-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </>
            )}

            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg pl-9 pr-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg pl-9 pr-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); setMessage(null); }}
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {mode === "login" && <LogIn className="w-4 h-4" />}
              {mode === "signup" && <UserPlus className="w-4 h-4" />}
              {mode === "forgot" && <Mail className="w-4 h-4" />}
              <span>
                {loading
                  ? "Processing..."
                  : mode === "login"
                  ? "Sign In"
                  : mode === "signup"
                  ? "Create Account"
                  : "Send Reset Link"}
              </span>
            </button>
          </form>
        </div>

        {/* Footer Toggle */}
        <div className="p-4 bg-secondary/40 border-t border-border text-center text-xs">
          {mode === "login" && (
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === "signup" && (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(null); setMessage(null); }}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === "forgot" && (
            <p className="text-muted-foreground">
              Remember your password?{" "}
              <button
                onClick={() => { setMode("login"); setError(null); setMessage(null); }}
                className="text-primary font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
