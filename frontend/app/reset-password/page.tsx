"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export const dynamic = "force-dynamic";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setUid(searchParams.get("uid"));
    setToken(searchParams.get("token"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !token) {
      setStatus("error");
      setMessage("Missing reset credentials.");
      return;
    }
    if (!password1 || password1 !== password2) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      await apiPost("/api/v1/auth/password/reset/confirm/", {
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      });
      setStatus("success");
      setMessage("Your password has been reset. You can now log in.");
    } catch (err: any) {
      setStatus("error");
      const apiMsg = err?.data?.detail || err?.data?.non_field_errors?.[0] || "Password reset failed.";
      setMessage(apiMsg);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      {status === "success" ? (
        <div>
          <p className="mb-6">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
          {status === "error" && (
            <p className="text-red-600 text-sm">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "loading" ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-6 py-16">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
