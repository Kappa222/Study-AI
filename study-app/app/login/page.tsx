"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Ellenőrizd az emailed! Kattints a megerősítő linkre.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel - hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col overflow-hidden bg-zinc-900 p-16 text-white lg:flex">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-400/5 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-violet-300">Study</span> AI
            </h1>
            <div className="mt-6 h-px w-16 bg-violet-400/40" />
            <p className="mt-6 text-xl leading-relaxed text-white/70">
              A mesterséges intelligencia segítségével tanulj gyorsabban. Tölts fel tananyagot, chatelj az AI-jal, generálj kvízeket, és kövesd nyomon a fejlődésed.
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/25">
          <span className="h-px flex-1 bg-white/10" />
          Inverted Teacher módszer
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-accent">Study</span> AI
            </h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold tracking-tight">
              {mode === "login" ? "Üdvözlünk újra" : "Hozz létre fiókot"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {mode === "login" ? "Jelentkezz be a tanulás folytatásához" : "Regisztrálj, és kezdd el a tanulást"}
            </p>

            {/* Tab toggle with sliding indicator */}
            <div className="relative mt-6 flex rounded-xl bg-zinc-100 dark:bg-zinc-800/60">
              <div
                className="absolute top-0.5 bottom-0.5 w-1/2 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out dark:bg-zinc-700"
                style={{ left: mode === "login" ? "2px" : "calc(50% - 2px)" }}
              />
              <button
                onClick={() => { setMode("login"); setMessage(""); }}
                className="relative z-10 flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Belépés
              </button>
              <button
                onClick={() => { setMode("signup"); setMessage(""); }}
                className="relative z-10 flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Regisztráció
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-accent/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Jelszó"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-accent/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {loading
                  ? "Küldés..."
                  : mode === "login"
                    ? "Belépés"
                    : "Regisztráció"}
              </button>
            </form>

            {message && (
              <div className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
                mode === "signup" && !message.includes("Hiba") && !message.includes("error") && !message.includes("already")
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
              }`}>
                <span className="mt-0.5 shrink-0">
                  {mode === "signup" && !message.includes("Hiba") && !message.includes("error") && !message.includes("already") ? "✅" : "❌"}
                </span>
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
