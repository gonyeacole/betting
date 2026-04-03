import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "[tracker]",
  description: "track your bets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-10 pb-24 md:pb-10">{children}</main>
      </body>
    </html>
  );
}
