import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study AI",
  description: "Tanulj hatékonyabban mesterséges intelligencia segítségével. AI chat, kvízek, tananyag kezelés és haladás követés egy helyen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200/70 px-6 py-3 dark:border-zinc-800/70">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-accent">Study</span> AI
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-violet-50 hover:text-accent dark:text-zinc-400 dark:hover:bg-violet-950/50 dark:hover:text-accent-light"
          >
            Belépés
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
