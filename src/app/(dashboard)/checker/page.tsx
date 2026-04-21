"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";

const PLATFORMS = [
  "fakecrime.bio",
  "cutz.lol",
  "frozi.lol",
  "ysn.lol",
  "haunt.gg",
  "linktr.ee",
  "emogir.ls",
  "feds.lol",
  "makka.lol",
];

type ResultStatus = "taken" | "available" | "unknown";

interface CheckResult {
  platform: string;
  result: ResultStatus;
}

interface CheckResponse {
  username: string;
  results: CheckResult[];
}

const STATUS_CONFIG: Record<
  ResultStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  available: {
    label: "Available",
    icon: <CheckCircle size={16} />,
    color: "text-emerald-300",
    bg: "border-emerald-400/20 bg-emerald-400/10",
  },
  taken: {
    label: "Taken",
    icon: <XCircle size={16} />,
    color: "text-red-300",
    bg: "border-red-400/20 bg-red-400/10",
  },
  unknown: {
    label: "Unknown",
    icon: <HelpCircle size={16} />,
    color: "text-[#9b91aa]",
    bg: "border-white/[0.08] bg-white/[0.035]",
  },
};

export default function CheckerPage() {
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState<string[]>(PLATFORMS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState("");

  function togglePlatform(p: string) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || selected.length === 0) return;

    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), platforms: selected }),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Check failed");
    } else {
      setResult(await res.json());
    }

    setLoading(false);
  }

  return (
    <div className="fade-in mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#B98CF7]">
            user@checker ~
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f7f0ff] md:text-4xl">
            Username Checker
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#a99fb8]">
            Check clean bio-style platforms with lightweight fetch logic. No stubborn
            browser-challenge targets in this list.
          </p>
        </div>
        <div className="rounded-2xl border border-[#B98CF7]/18 bg-[#B98CF7]/10 px-4 py-3 font-mono text-xs text-[#d8c3ff]">
          {selected.length}/{PLATFORMS.length} platforms armed
        </div>
      </div>

      <form onSubmit={handleCheck} className="glass-card rounded-3xl p-4 md:p-6">
        <div className="terminal-titlebar -mx-4 -mt-4 mb-6 flex items-center gap-2 rounded-t-3xl px-4 py-3 md:-mx-6 md:-mt-6 md:px-6">
          <span className="terminal-dot bg-[#ff6b6b] text-[#ff6b6b]" />
          <span className="terminal-dot bg-[#ffd166] text-[#ffd166]" />
          <span className="terminal-dot bg-[#5cffc7] text-[#5cffc7]" />
          <span className="ml-3 font-mono text-xs text-[#9b91aa]">availability.scan</span>
        </div>

        <div className="space-y-5">
          <div>
          <label className="mb-2 block font-mono text-xs text-[#b9afc8]">target_username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. shadow"
              className="w-full rounded-2xl border border-[#B98CF7]/18 bg-black/25 py-4 pl-4 pr-12 font-mono text-sm text-[#f7f0ff] placeholder:text-[#665b75] outline-none transition-all focus:border-[#B98CF7]/55 focus:shadow-[0_0_42px_rgba(185,140,247,0.14)]"
            />
            <Search
              size={15}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8d7aa8]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs text-[#b9afc8]">platforms</label>
          <div className="flex flex-wrap gap-2.5">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`rounded-2xl border px-4 py-2 text-sm transition-all ${
                  selected.includes(p)
                    ? "border-[#B98CF7]/45 bg-[#B98CF7]/15 text-[#f7f0ff] shadow-[0_0_28px_rgba(185,140,247,0.12)]"
                    : "border-white/[0.07] bg-white/[0.02] text-[#8f849f] hover:border-[#B98CF7]/30 hover:text-[#f7f0ff]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim() || selected.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#B98CF7]/40 bg-[#B98CF7] px-4 py-3.5 text-sm font-semibold text-[#130c1e] shadow-[0_0_44px_rgba(185,140,247,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#c8a5ff] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search size={15} />
              Check Availability
            </>
          )}
        </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 fade-in">
          <p className="mb-3 font-mono text-xs text-[#9b91aa]">
            Results for{" "}
            <span className="font-medium text-[#f7f0ff]">@{result.username}</span>
          </p>
          <div className="overflow-hidden rounded-3xl border border-[#B98CF7]/16 bg-black/20">
            {result.results.map((r, i) => {
              const cfg = STATUS_CONFIG[r.result];
              return (
                <div
                  key={r.platform}
                  className={`flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] md:px-5 ${
                    i !== 0 ? "border-t border-white/[0.06]" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#f7f0ff]">{r.platform}</p>
                    <p className="mt-1 font-mono text-xs text-[#81768f]">
                      {r.platform}/{result.username}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${cfg.color} ${cfg.bg}`}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
