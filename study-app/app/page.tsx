export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center md:py-32">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          A mesterséges intelligencia segítségével tanulj gyorsabban
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Tölts fel tananyagot, chatelj az AI-jal, generálj kvízeket, és kövesd nyomon a fejlődésed — minden egy helyen.
        </p>
        <a
          href="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Kezdj el tanulni
        </a>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 px-6 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Hogyan működik?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Válassz témát", desc: "Hozz létre egy tantárgyat, és tölts fel hozzá tananyagot PDF-ben vagy szövegként." },
              { step: "02", title: "Tanulj az AI-jal", desc: "Chatelj a virtuális tanulótársaddal, tegyél fel kérdéseket, vagy tanítsd meg őt az anyagra." },
              { step: "03", title: "Teszteld a tudásod", desc: "Generálj kvízeket a tananyag alapján, és nézd meg, mennyit fejlődtél." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                <span className="text-sm font-medium text-zinc-400">{item.step}</span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-200 px-6 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Mit kínálunk?
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Tananyag kezelés",
                desc: "Tölts fel PDF fájlokat vagy illeszd be a jegyzeteidet szövegként. Minden anyagod egy helyen rendezve.",
              },
              {
                title: "AI Chat",
                desc: "Tanítsd meg Robit, a virtuális gyakornokot az Inverted Teacher módszerrel, vagy kérj segítséget a tananyaghoz.",
              },
              {
                title: "Kvízek",
                desc: "Az AI automatikusan kérdéseket generál a tananyagodból. Válaszolj, és azonnali visszajelzést kapsz.",
              },
              {
                title: "Haladás követés",
                desc: "Kövesd nyomon a statisztikáidat, gyűjts XP-t, és építs streaks-eket a motiváció fenntartásához.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 px-6 py-20 text-center dark:border-zinc-800">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Készen állsz a tanulásra?
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Csatlakozz, és fedezd fel, milyen egyszerű lehet az AI-al támogatott tanulás.
        </p>
        <a
          href="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Kezdj el tanulni
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        &copy; {new Date().getFullYear()} Study AI
      </footer>
    </div>
  );
}
