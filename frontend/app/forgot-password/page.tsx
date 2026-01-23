"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

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
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold mb-2">Forgot Password</h1>
      <p className="text-sm text-gray-600 mb-6">
        Enter your email to receive a password reset link.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        {status !== "idle" && message && (
          <p className={status === "error" ? "text-red-600 text-sm" : "text-green-700 text-sm"}>{message}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

