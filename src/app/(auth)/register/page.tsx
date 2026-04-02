"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but sign in failed. Please sign in manually.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-subtle focus:outline-none focus:border-subtle transition-colors";

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center mb-6">create account</h1>

        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
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
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "creating account..." : "sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          already have an account?{" "}
          <Link href="/login" className="text-foreground hover:opacity-70 transition-opacity">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
