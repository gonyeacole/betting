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
      setError(data.error || "registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("account created. please sign in manually.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center max-w-sm mx-auto">
      <h1 className="text-sm mb-8">create account</h1>

      {error && (
        <div className="text-[11px] text-[#999] mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-xs focus:border-[#111]"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-xs focus:border-[#111]"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-xs focus:border-[#111]"
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="text-xs text-[#111] underline underline-offset-4 hover:no-underline transition-all disabled:text-[#ccc] pt-2"
        >
          {loading ? "..." : "create account"}
        </button>
      </form>

      <p className="text-[10px] text-[#aaa] mt-12">
        have an account?{" "}
        <Link href="/login" className="text-[#111] underline underline-offset-2 hover:no-underline">
          sign in
        </Link>
      </p>
    </div>
  );
}
