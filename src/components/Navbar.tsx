"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-green-400 flex items-center gap-2">
            <span className="text-2xl">&#9917;</span> BetTracker
          </Link>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="hover:text-green-400 transition">
                  Dashboard
                </Link>
                <Link href="/bets/new" className="hover:text-green-400 transition">
                  New Bet
                </Link>
                <Link href="/parlays/new" className="hover:text-green-400 transition">
                  New Parlay
                </Link>
                <Link href="/feed" className="hover:text-green-400 transition">
                  Feed
                </Link>
                <Link href="/users" className="hover:text-green-400 transition">
                  Find Users
                </Link>
                <Link
                  href={`/profile/${(session.user as { id: string }).id}`}
                  className="hover:text-green-400 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition"
                >
                  Sign Out
                </button>
              </div>

              <button
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-green-400 transition">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {menuOpen && session && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/dashboard" className="block py-2 hover:text-green-400" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            <Link href="/bets/new" className="block py-2 hover:text-green-400" onClick={() => setMenuOpen(false)}>
              New Bet
            </Link>
            <Link href="/parlays/new" className="block py-2 hover:text-green-400" onClick={() => setMenuOpen(false)}>
              New Parlay
            </Link>
            <Link href="/feed" className="block py-2 hover:text-green-400" onClick={() => setMenuOpen(false)}>
              Feed
            </Link>
            <Link href="/users" className="block py-2 hover:text-green-400" onClick={() => setMenuOpen(false)}>
              Find Users
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
