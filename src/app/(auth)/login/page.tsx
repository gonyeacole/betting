"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-in">
      <div className="relative">
        <div className="absolute inset-0 blur-[80px] opacity-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full scale-150" />
        <div className="glass rounded-4xl p-10 w-full max-w-sm relative">
          <h1 className="text-xl font-light text-center mb-8 text-gradient">sign in</h1>

          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-2xl mb-4 text-sm font-light">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" required />
            </div>
            <div>
              <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-glow py-3 rounded-full text-sm font-medium disabled:opacity-50">
              {loading ? "signing in..." : "sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-[rgba(255,255,255,0.3)] mt-6 font-light">
            don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground hover:opacity-70 transition-opacity">sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
