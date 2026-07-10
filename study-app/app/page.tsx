import AnimatedStats from "./components/AnimatedStats";

const steps = [
  {
    step: "01",
    title: "Válassz témát",
    desc: "Hozz létre egy tantárgyat, és tölts fel hozzá tananyagot PDF-ben vagy szövegként.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Tanulj az AI-jal",
    desc: "Chatelj a virtuális tanulótársaddal, tegyél fel kérdéseket, vagy tanítsd meg őt az anyagra.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Teszteld a tudásod",
    desc: "Generálj kvízeket a tananyag alapján, és nézd meg, mennyit fejlődtél.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Tananyag kezelés",
    desc: "Tölts fel PDF fájlokat vagy illeszd be a jegyzeteidet szövegként. Minden anyagod egy helyen rendezve.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: "AI Chat",
    desc: "Tanítsd meg a virtuális tanulótársadat az Inverted Teacher módszerrel, vagy kérj segítséget a tananyaghoz.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 0-9 9c0 1.7.47 3.29 1.29 4.65L3 20l4.35-1.29A9 9 0 1 0 12 2z" />
        <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
      </svg>
    ),
  },
  {
    title: "Kvízek",
    desc: "Az AI automatikusan kérdéseket generál a tananyagodból. Válaszolj, és azonnali visszajelzést kapsz.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: "Haladás követés",
    desc: "Kövesd nyomon a statisztikáidat, gyűjts XP-t, és építs streaks-eket a motiváció fenntartásához.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const stats = [
  { value: "100+", label: "tananyag" },
  { value: "1000+", label: "felhasználó" },
  { value: "50+", label: "kvíz" },
];

const testimonials = [
  {
    initials: "BB",
    name: "Béla B.",
    quote: "Az AI-jal való tanulás teljesen megváltoztatta a felkészülésemet. Lumi segítségével sokkal mélyebben megértettem az anyagot.",
  },
  {
    initials: "AK",
    name: "Anna K.",
    quote: "A fordított tanítás módszere zseniális. Amikor Luminak magyarázom, rájövök, hogy mit nem értek igazán.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden bg-zinc-950 flex flex-col">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] rounded-full bg-violet-600/20 blur-[140px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2.5s" }} />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute top-24 left-[12%] text-violet-500/15 animate-float" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="24" cy="24" r="20" />
          </svg>
          <svg className="absolute top-1/3 right-[15%] text-violet-400/10 animate-float" style={{ animationDelay: "2s" }} width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M16 2 30 16 16 30 2 16 16 2z" />
          </svg>
          <svg className="absolute bottom-1/3 left-[20%] text-violet-600/10 animate-float" style={{ animationDelay: "4s" }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4v16m-8-8h16" />
          </svg>
          <div className="absolute bottom-1/4 right-[25%] flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/20 animate-float" style={{ animationDelay: "1s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500/20 animate-float" style={{ animationDelay: "3s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/20 animate-float" style={{ animationDelay: "5s" }} />
          </div>
          <div className="absolute top-[18%] right-[10%] h-3 w-3 rounded-full bg-violet-500/25 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-[15%] right-[25%] h-2 w-2 rounded-full bg-violet-400/20 animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-[35%] left-[8%] h-4 w-4 rounded-full bg-violet-600/15 animate-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-[25%] right-[12%] h-2.5 w-2.5 rounded-full bg-violet-400/20 animate-float" style={{ animationDelay: "3.5s" }} />
          <div className="absolute top-[55%] left-[10%] h-1.5 w-1.5 rounded-full bg-violet-500/20 animate-float" style={{ animationDelay: "2.5s" }} />
          <div className="absolute top-[8%] right-[35%] h-5 w-5 rounded-full bg-violet-500/10 animate-float" style={{ animationDelay: "4s" }} />
          <div className="absolute top-[70%] right-[15%] h-2 w-2 rounded-full bg-violet-400/20 animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-[10%] left-[30%] h-3.5 w-3.5 rounded-full bg-violet-600/15 animate-float" style={{ animationDelay: "2s" }} />
          <svg className="absolute top-[12%] right-[30%] text-violet-400/10 animate-float" style={{ animationDelay: "3s" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <svg className="absolute bottom-[20%] left-[35%] text-violet-500/10 animate-float" style={{ animationDelay: "0.8s" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 22 22 2 22 12 2" />
          </svg>
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-4">
          <span className="text-2xl font-bold tracking-tight text-white">
            <span className="text-accent">Cogni</span>mo
          </span>
          <a
            href="/login"
            className="rounded-lg px-5 py-2 text-base text-zinc-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white active:scale-[0.98]"
          >
            Belépés
          </a>
        </nav>

        <div className="relative z-10 flex-1 flex items-center px-6 py-12">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1 text-xs font-medium text-violet-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  AI-alapú tanulási platform
                </span>
              </div>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <span className="bg-gradient-to-r from-violet-400 via-accent to-violet-300 bg-clip-text text-transparent">
                  Tanulj gyorsabban
                </span>
                <br />
                <span className="text-white">a mesterséges intelligencia segítségével</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-400 md:text-lg animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                Tölts fel tananyagot, chatelj az AI-jal, generálj kvízeket, és kövesd nyomon a fejlődésed — minden egy helyen.
              </p>
              <a
                href="/login"
                className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center rounded-lg bg-accent px-6 text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.98] animate-fade-in-up"
                style={{ animationDelay: "450ms" }}
              >
                Kezdj el tanulni
              </a>
            </div>

            <div className="hidden md:flex items-center justify-center animate-fade-in-up" style={{ animationDelay: "250ms" }}>
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-violet-600/20 via-transparent to-transparent blur-xl" />
                <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-zinc-500 font-medium">Cognimo</span>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-violet-600/15 p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber-400/30 flex items-center justify-center text-[10px] text-amber-300 font-semibold">L</div>
                        <span className="text-xs font-medium text-amber-300">Lumi</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        Magyarázd el a másodfokú egyenlet megoldóképletét!
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-800 p-3.5 ml-6">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-[10px] text-accent font-semibold">T</div>
                        <span className="text-xs font-medium text-zinc-400">Te</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        Az ax² + bx + c = 0 egyenlet megoldását a megoldóképlet adja: x = ...
                      </p>
                    </div>
                    <div className="rounded-xl bg-violet-600/15 p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber-400/30 flex items-center justify-center text-[10px] text-amber-300 font-semibold">L</div>
                        <span className="text-xs font-medium text-amber-300">Lumi</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        Nagyszerű! És mi a diszkrimináns szerepe?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-zinc-200 px-6 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl animate-fade-in-up">
            Hogyan működik?
          </h2>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3 items-start">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] border-t-2 border-dashed border-zinc-300 dark:border-zinc-700" />
            {steps.map((item, i) => (
              <div key={item.step} className="group relative flex flex-col items-center text-center gap-4 rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900 dark:hover:border-accent/40 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {item.step}
                </span>
                <span className="text-accent">{item.icon}</span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-zinc-200 px-6 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl animate-fade-in-up">
            Mit kínálunk?
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900 dark:hover:border-accent/40 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold transition-colors group-hover:text-accent">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-6 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl">
          <AnimatedStats stats={stats} />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t border-zinc-200 px-6 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl animate-fade-in-up">
            Más tanulók mondták
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900 animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-zinc-500">Tanuló</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-zinc-200 px-6 py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-3xl bg-zinc-950 p-12 shadow-2xl md:p-16">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Készen állsz a tanulásra?
            </h2>
            <p className="mt-4 text-zinc-400">
              Csatlakozz, és fedezd fel, milyen egyszerű lehet az AI-al támogatott tanulás.
            </p>
            <a
              href="/login"
              className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center rounded-lg bg-accent px-6 text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.98]"
            >
              Regisztráció / Belépés
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <span className="text-base font-bold tracking-tight">
                <span className="text-accent">Cogni</span>mo
              </span>
              <p className="mt-2 text-xs text-zinc-500">Tanulj hatékonyabban mesterséges intelligencia segítségével.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Termék</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="/subjects" className="transition-colors hover:text-accent">Tantárgyak</a></li>
                <li><span className="cursor-default">Tananyagok</span></li>
                <li><span className="cursor-default">Kvízek</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Funkciók</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><span className="cursor-default">AI Chat</span></li>
                <li><span className="cursor-default">Inverted Teacher</span></li>
                <li><span className="cursor-default">Haladás követés</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Jogi</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><span className="cursor-default">Adatvédelem</span></li>
                <li><span className="cursor-default">Felhasználási feltételek</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
            &copy; {new Date().getFullYear()} Cognimo. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>
  );
}
