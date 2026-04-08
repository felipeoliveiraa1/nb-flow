"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDemo =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    if (isDemo) {
      window.location.href = "/home";
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError("Erro ao enviar o link. Tente novamente.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-nb-pink px-6 py-12">
      <div />

      <div className="flex w-full max-w-sm flex-col items-center">
        <Image
          src="/logo.svg"
          alt="NB Flow"
          width={90}
          height={90}
          priority
        />

        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-bold text-white">
          Natalia Beauty
        </h1>
        <p className="mt-1 text-center text-sm text-white/70">
          Flow System para Angels
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="mt-10 w-full space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60"
              >
                Seu e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="angel@email.com"
                required
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-sm transition-all"
              />
            </div>
            {error && (
              <p className="text-xs text-white/90 text-center bg-red-500/20 rounded-lg py-1">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-nb-pink shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <div className="mt-10 w-full rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-white">
              Verifique seu e-mail
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Enviamos um link magico para{" "}
              <span className="font-medium text-white">{email}</span>
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-white/40">
        Natalia Beauty &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
