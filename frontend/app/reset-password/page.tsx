"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { apiPost } from "@/lib/api";
import { AuthShell } from "@/components/AuthShell";
import { PasswordField } from "@/components/ui/PasswordField";
import { Spinner } from "@/components/ui/Spinner";

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
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something you have not used elsewhere."
      asideTitle="Almost there."
      asidePoints={[
        { icon: KeyRound, text: "Use at least 8 characters" },
        { icon: ShieldCheck, text: "Avoid passwords you use on other sites" },
      ]}
    >
      {status === "success" ? (
        <div className="space-y-6">
          <div role="status" className="notice notice-success">
            <CheckCircle2 size={18} className="mt-0.5 flex-none" />
            {message}
          </div>
          <button onClick={() => router.push("/login")} className="btn btn-primary btn-lg w-full">
            Go to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            placeholder="New password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          {status === "error" && (
            <div role="alert" className="notice notice-error">
              <AlertCircle size={18} className="mt-0.5 flex-none" />
              {message}
            </div>
          )}
          <button type="submit" disabled={status === "loading"} className="btn btn-primary btn-lg w-full">
            {status === "loading" && <Spinner />}
            {status === "loading" ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Spinner size={28} /></div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
