"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const err = await register(username, name, email, password, inviteCode);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08050f] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <p className="font-mono text-xs text-[#B98CF7]">&gt;_ register</p>
        </div>

        <div className="border border-[#B98CF7]/20 bg-[#0d0717]">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#B98CF7]/15 bg-white/[0.02]">
            <span className="terminal-dot bg-[#ff5f57]" />
            <span className="terminal-dot bg-[#febc2e]" />
            <span className="terminal-dot bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-[#6b6278]">username-manager — register</span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="w-full bg-transparent border border-[#B98CF7]/15 px-3 py-2 font-mono text-sm text-[#f3eefc] placeholder-[#3d3547] focus:outline-none focus:border-[#B98CF7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-transparent border border-[#B98CF7]/15 px-3 py-2 font-mono text-sm text-[#f3eefc] placeholder-[#3d3547] focus:outline-none focus:border-[#B98CF7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                email <span className="text-[#3d3547]">optional</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent border border-[#B98CF7]/15 px-3 py-2 font-mono text-sm text-[#f3eefc] placeholder-[#3d3547] focus:outline-none focus:border-[#B98CF7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                invite code
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="paste invite code"
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
                placeholder="min. 8 characters"
                className="w-full bg-transparent border border-[#B98CF7]/15 px-3 py-2 font-mono text-sm text-[#f3eefc] placeholder-[#3d3547] focus:outline-none focus:border-[#B98CF7]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#6b6278] mb-1.5">
                confirm password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="repeat password"
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
              {loading ? "..." : "→ create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 font-mono text-xs text-[#6b6278]">
          have an account?{" "}
          <Link href="/login" className="text-[#B98CF7] hover:text-[#d8c3ff] transition-colors">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
