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
      setError("invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center max-w-sm mx-auto">
      <h1 className="text-sm mb-8">sign in</h1>

      {error && (
        <div className="text-[11px] text-[#999] mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="text-xs text-[#111] underline underline-offset-4 hover:no-underline transition-all disabled:text-[#ccc] pt-2"
        >
          {loading ? "..." : "sign in"}
        </button>
      </form>

      <p className="text-[10px] text-[#aaa] mt-12">
        no account?{" "}
        <Link href="/register" className="text-[#111] underline underline-offset-2 hover:no-underline">
          sign up
        </Link>
      </p>
    </div>
  );
}
