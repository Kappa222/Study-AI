"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Character {
  id: string;
  name: string;
  description: string;
}

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    await loadData();
    setPageLoading(false);
  };

  const loadData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, preferred_character_id")
      .eq("id", userId)
      .single();

    if (profile) {
      setUsername(profile.username ?? "");
      setSelectedChar(profile.preferred_character_id);
    }

    const { data: chars } = await supabase
      .from("characters")
      .select("id, name, description");
    if (chars) setCharacters(chars);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        preferred_character_id: selectedChar,
      })
      .eq("id", userId);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-accent" />
          <p className="text-sm text-zinc-500">Betöltés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Beállítások</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Profil</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Felhasználónév
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-zinc-700 dark:bg-zinc-800"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Tanulótárs</h2>
          <div className="grid grid-cols-2 gap-3">
            {characters.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => setSelectedChar(char.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedChar === char.id
                    ? "border-accent bg-violet-50 dark:bg-violet-950/30"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                }`}
              >
                <p className="text-lg font-bold">{char.name}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {char.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white transition-all hover:bg-violet-700 hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Mentés..." : "Mentés"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Elmentve!</span>
          )}
          <button
            type="button"
            onClick={logout}
            className="ml-auto rounded-lg px-4 py-2 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
          >
            Kijelentkezés
          </button>
        </div>
      </form>
    </div>
  );
}
