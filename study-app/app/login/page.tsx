"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold">
          {mode === "login" ? "Belépés" : "Regisztráció"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-accent/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Jelszó"
            required
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-accent/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md disabled:opacity-50"
          >
            {loading
              ? "Küldés..."
              : mode === "login"
                ? "Belépés"
                : "Regisztráció"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            {message}
          </p>
        )}

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
          className="mt-4 text-sm text-zinc-500 underline underline-offset-2 transition-colors hover:text-accent dark:hover:text-accent-light"
        >
          {mode === "login"
            ? "Nincs még fiókod? Regisztrálj"
            : "Már van fiókod? Jelentkezz be"}
        </button>
      </div>
    </div>
  );
}
