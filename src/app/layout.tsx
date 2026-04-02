import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BetTracker",
  description: "Track your sports bets, follow other bettors, and analyze your performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <SessionProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
