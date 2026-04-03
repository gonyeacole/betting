"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="px-6 py-5">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-base font-semibold tracking-tight">
          [tracker]
        </Link>

        {session ? (
          <>
            <div className="hidden md:flex items-center gap-1">
              {[
                { href: "/dashboard", label: "Games" },
                { href: "/users", label: "Sports" },
                { href: "/feed", label: "Feed" },
                { href: `/profile/${(session.user as { id: string }).id}`, label: "Profile" },
              ].map((link) => (
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

            <button
              className="md:hidden text-[13px] text-[#888] bg-[#1a1a1a] px-4 py-1.5 rounded-full"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
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

      {menuOpen && session && (
        <div className="md:hidden max-w-3xl mx-auto mt-4 flex flex-wrap gap-2">
          {[
            { href: "/dashboard", label: "Games" },
            { href: "/users", label: "Sports" },
            { href: "/feed", label: "Feed" },
            { href: `/profile/${(session.user as { id: string }).id}`, label: "Profile" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 text-[13px] text-[#888] bg-[#1a1a1a] rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => signOut()}
            className="px-4 py-1.5 text-[13px] text-[#555] bg-[#1a1a1a] rounded-full"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
