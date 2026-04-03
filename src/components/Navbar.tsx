"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = session
    ? [
        { href: "/dashboard", label: "Games" },
        { href: "/users", label: "Sports" },
        { href: "/feed", label: "Feed" },
        { href: `/profile/${(session.user as { id: string }).id}`, label: "Profile" },
      ]
    : [];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      {/* Top bar */}
      <nav className="px-6 py-5 animate-fade-in">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-base font-semibold tracking-tight pill-press">
            [tracker]
          </Link>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-[13px] rounded-full pill-press ${
                      isActive(link.href)
                        ? "bg-[#1a1a1a] text-white tab-active"
                        : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-[13px] text-[#555] hover:text-white hover:bg-[#1a1a1a] rounded-full pill-press ml-1"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-1.5 text-[13px] text-[#888] hover:text-white rounded-full pill-press">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-1.5 text-[13px] text-white bg-[#1a1a1a] hover:bg-[#222] rounded-full pill-press">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      {session && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-xl border-t border-[#1a1a1a]">
          <div className="flex justify-evenly items-center py-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`bottom-nav-item flex-1 text-center text-[12px] py-1.5 rounded-xl ${
                  isActive(link.href)
                    ? "text-white font-medium"
                    : "text-[#555] hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <div className="mx-auto mt-1 w-1 h-1 rounded-full bg-white animate-scale-in" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
