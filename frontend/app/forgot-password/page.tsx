"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Briefcase, CheckCircle2, EyeOff, KeyRound, Mail } from "lucide-react";
import { IconField } from "@/components/ui/IconField";
import { apiPost } from "@/lib/api";
import { AuthShell } from "@/components/AuthShell";
import { Spinner } from "@/components/ui/Spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      await apiPost("/api/v1/auth/password/reset/", { email });
      setStatus("success");
      setMessage(
        "If an account exists for this email, we've sent a password reset link."
      );
    } catch (err: any) {
      setStatus("error");
      const apiMsg = err?.data?.detail || err?.data?.email?.[0] || "Failed to send reset email.";
      setMessage(apiMsg);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email on your account and we will send you a link to choose a new one."
      asideTitle="Back in your account in a minute."
      asidePoints={[
        { icon: KeyRound, text: "The link can be used only once" },
        { icon: EyeOff, text: "We never reveal whether an email has an account" },
        { icon: Briefcase, text: "Your matters are untouched" },
      ]}
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <IconField
          label="Email address"
          icon={Mail}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {status !== "idle" && message && (
          <div
            role={status === "error" ? "alert" : "status"}
            className={`notice ${status === "error" ? "notice-error" : "notice-success"}`}
          >
            {status === "error" ? (
              <AlertCircle size={18} className="mt-0.5 flex-none" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 flex-none" />
            )}
            {message}
          </div>
        )}

        <button type="submit" disabled={status === "loading"} className="btn btn-primary btn-lg w-full">
          {status === "loading" && <Spinner />}
          {status === "loading" ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
