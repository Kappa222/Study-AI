"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SetupProfilePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/login";
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId);

    if (error) {
      setMessage("Hiba: " + error.message);
    } else {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-bold">Üdvözlünk!</h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Válassz egy felhasználónevet a folytatáshoz.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Felhasználónév"
            required
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-accent/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Mentés..." : "Kezdjük!"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}
