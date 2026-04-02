"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-6 pt-4">
        <div className="glass rounded-full px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-sm font-medium tracking-tight text-foreground">
            [tracker]
          </Link>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-8">
                {[
                  { href: "/dashboard", label: "dashboard" },
                  { href: "/bets/new", label: "new bet" },
                  { href: "/parlays/new", label: "parlay" },
                  { href: "/feed", label: "feed" },
                  { href: "/users", label: "discover" },
                  { href: `/profile/${(session.user as { id: string }).id}`, label: "profile" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="text-xs text-[rgba(255,255,255,0.4)] hover:text-foreground transition-all duration-300">
                    {link.label}
                  </Link>
                ))}
                <button onClick={() => signOut()} className="text-xs text-[rgba(255,255,255,0.4)] hover:text-foreground transition-all duration-300">
                  sign out
                </button>
              </div>

              <button className="md:hidden text-[rgba(255,255,255,0.4)]" onClick={() => setMenuOpen(!menuOpen)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs text-[rgba(255,255,255,0.4)] hover:text-foreground transition-all duration-300">
                sign in
              </Link>
              <Link href="/register" className="btn-glow text-xs px-5 py-1.5 rounded-full">
                sign up
              </Link>
            </div>
          )}
        </div>

        {menuOpen && session && (
          <div className="md:hidden mt-2 glass rounded-3xl p-4 space-y-1 animate-in">
            {[
              { href: "/dashboard", label: "dashboard" },
              { href: "/bets/new", label: "new bet" },
              { href: "/parlays/new", label: "parlay" },
              { href: "/feed", label: "feed" },
              { href: "/users", label: "discover" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block py-2 text-sm text-[rgba(255,255,255,0.4)] hover:text-foreground" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button onClick={() => signOut()} className="block py-2 text-sm text-[rgba(255,255,255,0.4)] hover:text-foreground">
              sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
