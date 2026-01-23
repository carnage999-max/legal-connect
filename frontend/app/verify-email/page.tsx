"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function VerifyEmailPage() {
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
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold mb-4">Verify Email</h1>
      {status === "loading" && <p>Verifying your email…</p>}
      {status !== "loading" && <p className="mb-6">{message}</p>}
      <button
        onClick={() => router.push("/login")}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Go to Login
      </button>
    </div>
  );
}

