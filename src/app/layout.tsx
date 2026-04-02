import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
      <body className={`${geistMono.variable} antialiased`} style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
        <SessionProvider>
          <Navbar />
          <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
