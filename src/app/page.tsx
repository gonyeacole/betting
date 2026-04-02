import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center animate-in">
      <div className="relative">
        {/* Ambient glow behind heading */}
        <div className="absolute inset-0 blur-[100px] opacity-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full scale-150" />

        <p className="text-xs tracking-[0.3em] uppercase text-[rgba(255,255,255,0.3)] mb-8 relative">
          sports betting tracker
        </p>

        <h1 className="text-6xl md:text-8xl font-light tracking-tight text-gradient mb-6 relative leading-[1.1]">
          Track every bet.
        </h1>

        <p className="text-base md:text-lg text-[rgba(255,255,255,0.35)] mb-12 max-w-md mx-auto leading-relaxed relative font-light">
          Log your bets, follow other bettors, and see how everyone&apos;s doing. Beautifully simple.
        </p>
      </div>

      <div className="flex gap-4 relative">
        <Link href="/register" className="btn-glow px-8 py-3 rounded-full text-sm font-medium">
          get started
        </Link>
        <Link href="/login" className="btn-ghost px-8 py-3 rounded-full text-sm font-light">
          sign in
        </Link>
      </div>

      <div className="mt-32 grid md:grid-cols-3 gap-5 max-w-3xl w-full relative">
        {[
          { title: "all bet types", desc: "Moneylines, spreads, over/unders, live bets, parlays, and same game parlays." },
          { title: "every sport", desc: "NFL, NBA, MLB, NHL, Soccer, Tennis, MMA, and more." },
          { title: "social", desc: "Follow other bettors, see their picks, and build your network." },
        ].map((card) => (
          <div key={card.title} className="glass rounded-3xl p-7 text-left group cursor-default">
            <h3 className="text-sm font-medium text-foreground mb-2 group-hover:text-gradient transition-all duration-500">{card.title}</h3>
            <p className="text-[rgba(255,255,255,0.3)] text-sm leading-relaxed font-light">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
