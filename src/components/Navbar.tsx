"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  const navLinks = session
    ? [
        { href: "/dashboard", label: "Games" },
        { href: "/users", label: "Sports" },
        { href: "/feed", label: "Feed" },
        { href: `/profile/${(session.user as { id: string }).id}`, label: "Profile" },
      ]
    : [];

  return (
    <>
      {/* Top bar */}
      <nav className="px-6 py-5">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-base font-semibold tracking-tight">
            [tracker]
          </Link>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-[13px] text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-full transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-[13px] text-[#555] hover:text-white hover:bg-[#1a1a1a] rounded-full transition-all ml-1"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-1.5 text-[13px] text-[#888] hover:text-white rounded-full transition-all">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-1.5 text-[13px] text-white bg-[#1a1a1a] hover:bg-[#222] rounded-full transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      {session && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-[#1a1a1a]">
          <div className="flex justify-evenly items-center py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex-1 text-center text-[12px] text-[#888] hover:text-white transition-all py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
