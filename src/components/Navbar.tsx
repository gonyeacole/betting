"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
            [tracker]
          </Link>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-8">
                <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
                  dashboard
                </Link>
                <Link href="/bets/new" className="text-sm text-muted hover:text-foreground transition-colors">
                  new bet
                </Link>
                <Link href="/parlays/new" className="text-sm text-muted hover:text-foreground transition-colors">
                  new parlay
                </Link>
                <Link href="/feed" className="text-sm text-muted hover:text-foreground transition-colors">
                  feed
                </Link>
                <Link href="/users" className="text-sm text-muted hover:text-foreground transition-colors">
                  find users
                </Link>
                <Link
                  href={`/profile/${(session.user as { id: string }).id}`}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  sign out
                </button>
              </div>

              <button
                className="md:hidden text-muted"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">
                sign in
              </Link>
              <Link
                href="/register"
                className="text-sm text-foreground bg-white/10 hover:bg-white/15 px-4 py-1.5 rounded-full transition-colors"
              >
                sign up
              </Link>
            </div>
          )}
        </div>

        {menuOpen && session && (
          <div className="md:hidden pb-4 space-y-1 border-t border-border pt-3">
            <Link href="/dashboard" className="block py-2 text-sm text-muted hover:text-foreground" onClick={() => setMenuOpen(false)}>
              dashboard
            </Link>
            <Link href="/bets/new" className="block py-2 text-sm text-muted hover:text-foreground" onClick={() => setMenuOpen(false)}>
              new bet
            </Link>
            <Link href="/parlays/new" className="block py-2 text-sm text-muted hover:text-foreground" onClick={() => setMenuOpen(false)}>
              new parlay
            </Link>
            <Link href="/feed" className="block py-2 text-sm text-muted hover:text-foreground" onClick={() => setMenuOpen(false)}>
              feed
            </Link>
            <Link href="/users" className="block py-2 text-sm text-muted hover:text-foreground" onClick={() => setMenuOpen(false)}>
              find users
            </Link>
            <button
              onClick={() => signOut()}
              className="block py-2 text-sm text-muted hover:text-foreground"
            >
              sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
