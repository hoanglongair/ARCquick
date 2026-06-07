"use client";

import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp, isConfigured } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess("Signed in successfully!");
          setTimeout(() => {
            onClose();
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setSuccess("");
          }, 1000);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess("Account created! Check your email to verify.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl border-t border-border bg-popover p-6 sm:rounded-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to save your preferences and history"
                : "Create an account to get started"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isConfigured && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-yellow-500">Supabase Not Configured</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file to enable authentication.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                disabled={!isConfigured || isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="pl-10 pr-10"
                disabled={!isConfigured || isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10"
                  disabled={!isConfigured || isLoading}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
              <p className="text-sm text-green-500">{success}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isConfigured || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setSuccess("");
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground">
            Your email is only used for authentication. No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
}
