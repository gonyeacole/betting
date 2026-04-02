import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold tracking-tight mb-3">[tracker]</h1>
      <p className="text-[15px] text-[#888] max-w-md leading-relaxed mb-8">
        Track your bets. Follow other bettors. See how everyone is doing.
      </p>

      <div className="flex gap-3">
        <Link
          href="/register"
          className="px-6 py-2 text-[13px] font-medium text-white bg-[#1a1a1a] hover:bg-[#222] rounded-full transition-all"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-2 text-[13px] font-medium text-[#888] hover:text-white rounded-full transition-all"
        >
          Sign In
        </Link>
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-3">
        {["Moneyline", "Spread", "Over/Under", "Live", "Parlays", "SGP"].map((tag) => (
          <span
            key={tag}
            className="px-4 py-1.5 text-[13px] text-[#555] border border-[#2a2a2a] rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
