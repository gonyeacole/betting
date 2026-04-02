import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <p className="text-sm text-muted tracking-widest uppercase mb-6">sports betting tracker</p>
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
        Track every bet.
      </h1>
      <p className="text-lg text-muted mb-10 max-w-lg leading-relaxed">
        Log your bets, follow other bettors, and see how everyone&apos;s doing. Simple and clean.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-foreground text-background px-7 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          get started
        </Link>
        <Link
          href="/login"
          className="text-muted border border-border px-7 py-2.5 rounded-full text-sm font-medium hover:text-foreground hover:border-subtle transition-colors"
        >
          sign in
        </Link>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-6 max-w-3xl w-full">
        <div className="bg-card border border-border p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-foreground mb-2">all bet types</h3>
          <p className="text-muted text-sm leading-relaxed">
            Moneylines, spreads, over/unders, live bets, parlays, and same game parlays.
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-foreground mb-2">every sport</h3>
          <p className="text-muted text-sm leading-relaxed">
            NFL, NBA, MLB, NHL, Soccer, Tennis, MMA, and more.
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-foreground mb-2">social</h3>
          <p className="text-muted text-sm leading-relaxed">
            Follow other bettors, see their picks, and build your network.
          </p>
        </div>
      </div>
    </div>
  );
}
