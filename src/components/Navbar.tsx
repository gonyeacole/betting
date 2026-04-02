"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-sm tracking-tight">
            [tracker]
          </Link>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-6 text-xs text-[#888]">
                <Link href="/dashboard" className="hover:text-[#111] transition-colors">
                  dashboard
                </Link>
                <Link href="/bets/new" className="hover:text-[#111] transition-colors">
                  new bet
                </Link>
                <Link href="/parlays/new" className="hover:text-[#111] transition-colors">
                  new parlay
                </Link>
                <Link href="/feed" className="hover:text-[#111] transition-colors">
                  feed
                </Link>
                <Link href="/users" className="hover:text-[#111] transition-colors">
                  people
                </Link>
                <Link
                  href={`/profile/${(session.user as { id: string }).id}`}
                  className="hover:text-[#111] transition-colors"
                >
                  profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hover:text-[#111] transition-colors"
                >
                  sign out
                </button>
              </div>

              <button
                className="md:hidden text-xs text-[#888]"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? "close" : "menu"}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-6 text-xs text-[#888]">
              <Link href="/login" className="hover:text-[#111] transition-colors">
                sign in
              </Link>
              <Link href="/register" className="hover:text-[#111] transition-colors">
                sign up
              </Link>
            </div>
          )}
        </div>

        {menuOpen && session && (
          <div className="md:hidden pb-6 flex flex-col gap-3 text-xs text-[#888]">
            <Link href="/dashboard" className="hover:text-[#111]" onClick={() => setMenuOpen(false)}>
              dashboard
            </Link>
            <Link href="/bets/new" className="hover:text-[#111]" onClick={() => setMenuOpen(false)}>
              new bet
            </Link>
            <Link href="/parlays/new" className="hover:text-[#111]" onClick={() => setMenuOpen(false)}>
              new parlay
            </Link>
            <Link href="/feed" className="hover:text-[#111]" onClick={() => setMenuOpen(false)}>
              feed
            </Link>
            <Link href="/users" className="hover:text-[#111]" onClick={() => setMenuOpen(false)}>
              people
            </Link>
            <button
              onClick={() => signOut()}
              className="text-left hover:text-[#111]"
            >
              sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
