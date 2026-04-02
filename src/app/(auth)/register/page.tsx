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
      setError("Account created. Please sign in manually.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center mb-8">Create Account</h1>

        {error && (
          <div className="text-[13px] text-[#f87171] bg-[#2e1a1a] rounded-xl px-4 py-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 text-[14px] border border-transparent focus:border-[#333]"
              required
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 text-[14px] border border-transparent focus:border-[#333]"
              required
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3 text-[14px] border border-transparent focus:border-[#333]"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-40 mt-2"
          >
            {loading ? "..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#555] mt-8">
          Have an account?{" "}
          <Link href="/login" className="text-[#888] hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
