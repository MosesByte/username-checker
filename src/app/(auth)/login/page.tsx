"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await login(identifier, password);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08050f] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <p className="font-mono text-xs text-[#B98CF7]">&gt;_ login</p>
        </div>

        <div className="border border-[#B98CF7]/20 bg-[#0d0717]">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#B98CF7]/15 bg-white/[0.02]">
            <span className="terminal-dot bg-[#ff5f57]" />
            <span className="terminal-dot bg-[#febc2e]" />
            <span className="terminal-dot bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-[#6b6278]">username-manager — login</span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                username or email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="moses"
                className="w-full bg-transparent border border-[#B98CF7]/15 px-3 py-2 font-mono text-sm text-[#f3eefc] placeholder-[#3d3547] focus:outline-none focus:border-[#B98CF7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border border-[#B98CF7]/15 px-3 py-2 font-mono text-sm text-[#f3eefc] placeholder-[#3d3547] focus:outline-none focus:border-[#B98CF7]/50 transition-colors"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-red-400">&gt; error: {error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#B98CF7]/30 bg-[#B98CF7]/10 px-4 py-2.5 font-mono text-sm text-[#f3eefc] hover:bg-[#B98CF7]/20 hover:border-[#B98CF7]/50 transition-colors disabled:opacity-40 text-left"
            >
              {loading ? "..." : "→ sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 font-mono text-xs text-[#6b6278]">
          no account?{" "}
          <Link href="/register" className="text-[#B98CF7] hover:text-[#d8c3ff] transition-colors">
            register
          </Link>
        </p>
      </div>
    </div>
  );
}
