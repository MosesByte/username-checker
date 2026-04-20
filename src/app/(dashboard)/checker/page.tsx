"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";

const PLATFORMS = ["guns.lol", "fakecrime.bio"];

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
  { label: string; icon: React.ReactNode; color: string }
> = {
  available: {
    label: "Available",
    icon: <CheckCircle size={16} />,
    color: "text-emerald-400",
  },
  taken: {
    label: "Taken",
    icon: <XCircle size={16} />,
    color: "text-red-400",
  },
  unknown: {
    label: "Unknown",
    icon: <HelpCircle size={16} />,
    color: "text-zinc-500",
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
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Username Checker</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Check if a username is available on supported platforms.
        </p>
      </div>

      <form onSubmit={handleCheck} className="space-y-5">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. shadow"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-4 pr-10 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  selected.includes(p)
                    ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                    : "border-zinc-800 bg-transparent text-zinc-500 hover:border-zinc-700"
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
          className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 mb-3">
            Results for{" "}
            <span className="text-zinc-300 font-medium">@{result.username}</span>
          </p>
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            {result.results.map((r, i) => {
              const cfg = STATUS_CONFIG[r.result];
              return (
                <div
                  key={r.platform}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    i !== 0 ? "border-t border-zinc-800" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm text-zinc-200">{r.platform}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {r.platform}/{result.username}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
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
