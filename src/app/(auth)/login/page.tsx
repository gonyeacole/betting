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
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center mb-8">Sign In</h1>

        {error && (
          <div className="text-[13px] text-[#f87171] bg-[#2e1a1a] rounded-xl px-4 py-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-40 mt-2"
          >
            {loading ? "..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#555] mt-8">
          No account?{" "}
          <Link href="/register" className="text-[#888] hover:text-white transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
