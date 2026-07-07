"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ConfirmModal from "./ConfirmModal";

export default function Header() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  const hide = pathname === "/login" || pathname === "/setup-profile";
  if (hide) return null;

  const handleLogout = async () => {
    setShowLogout(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-zinc-200/70 px-6 py-3 dark:border-zinc-800/70">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-accent">Study</span> AI
        </Link>

        {loggedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              aria-label="Beállítások"
              className="text-sm text-zinc-500 transition-colors hover:text-accent"
            >
              ⚙️
            </Link>
            <button
              onClick={() => setShowLogout(true)}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-sm active:scale-[0.98] dark:hover:bg-red-950/50 dark:hover:text-red-400"
            >
              Kijelentkezés
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-violet-50 hover:text-accent dark:text-zinc-400 dark:hover:bg-violet-950/50 dark:hover:text-accent-light"
          >
            Belépés
          </Link>
        )}
      </header>

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
    </>
  );
}
