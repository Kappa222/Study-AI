"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ConfirmModal from "../components/ConfirmModal";

const links = [
  { title: "Tárgyak", desc: "Válassz tantárgyat és témát", href: "/subjects", icon: "📚" },
  { title: "AI Chat", desc: "Tanulj a témáidból lépésről lépésre", href: "/subjects", icon: "💬" },
  { title: "Tananyagok", desc: "Tölts fel jegyzeteket és PDF-eket", href: "/subjects", icon: "📄" },
  { title: "Kvízek", desc: "Teszteld a tudásod", href: "/subjects", icon: "📝" },
  { title: "Haladás", desc: "Statisztikák és eredmények", href: "/subjects", icon: "📊" },
];

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [showLogout, setShowLogout] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-accent">Study</span> AI
          </h1>
          {username && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Szia, {username}!
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/settings"
            className="text-sm text-zinc-500 transition-colors hover:text-accent"
          >
            ⚙️
          </a>
          <button
            onClick={() => setShowLogout(true)}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
          >
            Kijelentkezés
          </button>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, i) => (
          <a
            key={link.title}
            href={link.href}
            className="group flex flex-col gap-3 rounded-xl border border-zinc-200 p-6 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg dark:border-zinc-800 dark:hover:border-accent/40 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-xl transition-colors group-hover:bg-accent/10 dark:bg-violet-950/50 dark:group-hover:bg-accent/20">
              {link.icon}
            </span>
            <span className="text-lg font-semibold group-hover:text-accent transition-colors">{link.title}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {link.desc}
            </span>
          </a>
        ))}
      </div>

      <ConfirmModal
        open={showLogout}
        title="Kijelentkezés"
        message="Biztosan ki szeretnél jelentkezni?"
        confirmLabel="Kijelentkezés"
        cancelLabel="Mégse"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
}
