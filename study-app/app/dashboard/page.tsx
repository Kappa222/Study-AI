"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const links = [
  { title: "Tárgyak", desc: "Tantárgyak kezelése", href: "/subjects", icon: "📚" },
  { title: "AI Chat", desc: "Tanulj Robival", href: "/chat", icon: "💬" },
  { title: "Tananyagok", desc: "PDF és jegyzetek", href: "/materials", icon: "📄" },
  { title: "Kvízek", desc: "Teszteld a tudásod", href: "/quiz", icon: "📝" },
  { title: "Haladás", desc: "Statisztikák és XP", href: "/progress", icon: "📊" },
];

export default function DashboardPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      if (!profile?.username) {
        window.location.href = "/setup-profile";
        return;
      }

      setUsername(profile.username);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study AI</h1>
          {username && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Szia, {username}!
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Kijelentkezés
        </button>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-lg font-semibold">{link.title}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {link.desc}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
