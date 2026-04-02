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

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-subtle focus:outline-none focus:border-subtle transition-colors";

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center mb-6">sign in</h1>

        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "signing in..." : "sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground hover:opacity-70 transition-opacity">
            sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
