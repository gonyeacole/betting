import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Track Every Bet.<br />
        <span className="text-green-600">Every Sport.</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Log moneylines, spreads, over/unders, live bets, parlays, and same game parlays.
        Follow other bettors and see how they&apos;re doing.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-3 rounded-lg text-lg font-semibold transition"
        >
          Sign In
        </Link>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">All Bet Types</h3>
          <p className="text-gray-600 text-sm">
            Moneylines, spreads, over/unders, live bets, parlays, and same game parlays.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">Every Sport</h3>
          <p className="text-gray-600 text-sm">
            NFL, NBA, MLB, NHL, Soccer, Tennis, MMA, and more. Track bets across all sports.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">Social</h3>
          <p className="text-gray-600 text-sm">
            Follow other bettors, see their picks, and build your network.
          </p>
        </div>
      </div>
    </div>
  );
}
