"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { apiPost } from "@/lib/api";
import { AuthShell } from "@/components/AuthShell";
import { Spinner } from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const key = searchParams.get("key");
    if (!key) {
      setStatus("error");
      setMessage("Missing verification key.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      try {
        await apiPost("/api/v1/auth/registration/verify-email/", { key });
        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
      } catch (err: any) {
        setStatus("error");
        const apiMsg = err?.data?.detail || err?.data?.message || "Verification failed. The link may have expired.";
        setMessage(apiMsg);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <AuthShell
      title="Verify your email"
      asideTitle="One quick check and you are in."
      asidePoints={[
        { icon: MailCheck, text: "Confirms the address is yours" },
        { icon: ShieldCheck, text: "Keeps your account and matters secure" },
      ]}
    >
      <div className="space-y-6">
        {status === "loading" && (
          <div role="status" className="notice notice-info">
            <Spinner />
            Verifying your email…
          </div>
        )}
        {status === "success" && (
          <div role="status" className="notice notice-success">
            <CheckCircle2 size={18} className="mt-0.5 flex-none" />
            {message}
          </div>
        )}
        {status === "error" && (
          <div role="alert" className="notice notice-error">
            <AlertCircle size={18} className="mt-0.5 flex-none" />
            {message}
          </div>
        )}
        <button onClick={() => router.push("/login")} className="btn btn-primary btn-lg w-full">
          Go to sign in
        </button>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Spinner size={28} /></div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
