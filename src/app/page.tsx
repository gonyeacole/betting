import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-sm">[tracker]</h1>
          <p className="text-xs text-[#888] leading-relaxed max-w-md">
            track your bets. moneylines, spreads, over/unders, parlays.
            follow other bettors. see how everyone is doing.
          </p>
        </div>

        <div className="flex gap-6 text-xs">
          <Link
            href="/register"
            className="text-[#111] underline underline-offset-4 hover:no-underline transition-all"
          >
            get started
          </Link>
          <Link
            href="/login"
            className="text-[#888] hover:text-[#111] transition-colors"
          >
            sign in
          </Link>
        </div>

        <div className="pt-16 space-y-6 text-xs text-[#888]">
          <div className="flex gap-8">
            <span className="text-[#ccc] w-4">01</span>
            <span>all bet types — moneyline, spread, over/under, live</span>
          </div>
          <div className="flex gap-8">
            <span className="text-[#ccc] w-4">02</span>
            <span>parlays and same game parlays</span>
          </div>
          <div className="flex gap-8">
            <span className="text-[#ccc] w-4">03</span>
            <span>follow bettors, like picks, build your feed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
