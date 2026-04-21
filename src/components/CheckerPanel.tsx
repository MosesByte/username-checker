"use client";

import { useState, type FormEvent } from "react";

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

function abbrev(p: string) {
  return p.replace(/\.(bio|lol|gg|ee|ls)$/, "");
}

type Status = "taken" | "available" | "unknown";

interface CheckResult {
  platform: string;
  result: Status;
}

// Renders only the inner rows — wrap in <DraggablePanel> on the outside.
export function CheckerPanel() {
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState<string[]>(PLATFORMS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [error, setError] = useState("");
  const [checkedFor, setCheckedFor] = useState("");

  function toggle(p: string) {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function runCheck() {
    if (!username.trim() || selected.length === 0) return;
    setLoading(true);
    setError("");
    setResults([]);
    setCheckedFor(username.trim());

    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), platforms: selected }),
    });

    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "check failed");
    } else {
      const d = (await res.json()) as { results: CheckResult[] };
      setResults(d.results);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Username input */}
      <div className="border-b border-[#B98CF7]/[0.07] px-3 py-2">
        <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[#4a4158]">
          username
        </div>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void runCheck();
          }}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="shadow"
            autoComplete="off"
            // stopPropagation so clicking the input doesn't start a panel drag
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full rounded-none border border-[#B98CF7]/15 bg-black/50 px-2 py-[5px] font-mono text-[11px] text-[#f0e8ff] placeholder-[#2a2035] outline-none transition-colors focus:border-[#B98CF7]/40"
          />
        </form>
      </div>

      {/* Platform toggles */}
      <div className="border-b border-[#B98CF7]/[0.07] px-3 py-2">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-[#4a4158]">
          platforms
        </div>
        <div className="grid grid-cols-3 gap-[3px]">
          {PLATFORMS.map((p) => {
            const on = selected.includes(p);
            return (
              <button
                key={p}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => toggle(p)}
                className={[
                  "border px-1.5 py-[3px] font-mono text-[9px] truncate transition-colors text-left",
                  on
                    ? "border-[#B98CF7]/40 bg-[#B98CF7]/14 text-[#c8a5ff]"
                    : "border-[#B98CF7]/10 bg-transparent text-[#3d3548] hover:border-[#B98CF7]/25 hover:text-[#7a6a90]",
                ].join(" ")}
              >
                {abbrev(p)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Run check */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => void runCheck()}
        disabled={loading || !username.trim() || selected.length === 0}
        className="flex w-full items-center justify-between border-b border-[#B98CF7]/[0.07] border-l-2 border-l-[#B98CF7] bg-[#B98CF7]/14 px-3 py-[6px] font-mono text-[11px] text-[#f0e8ff] transition-colors hover:bg-[#B98CF7]/22 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      >
        <span>{loading ? "checking…" : "▸ run check"}</span>
        {loading && <span className="text-[10px] text-[#B98CF7]">●</span>}
      </button>

      {/* Error */}
      {error && (
        <div className="border-b border-[#B98CF7]/[0.07] border-l-2 border-l-red-500 px-3 py-[6px] font-mono text-[10px] text-red-400">
          error: {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="border-b border-[#B98CF7]/15 bg-[#0e0620] px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#B98CF7]">
              results — @{checkedFor}
            </span>
          </div>
          {results.map((r) => (
            <div
              key={r.platform}
              className={[
                "flex items-center justify-between border-b border-[#B98CF7]/[0.07] border-l-2 px-3 py-[6px] font-mono text-[11px]",
                r.result === "available"
                  ? "border-l-emerald-500 text-[#9db8a0]"
                  : r.result === "taken"
                    ? "border-l-red-500 text-[#b09898]"
                    : "border-l-[#2e2638] text-[#4a4158]",
              ].join(" ")}
            >
              <span>{r.platform}</span>
              <span
                className={
                  r.result === "available"
                    ? "text-[10px] text-emerald-400"
                    : r.result === "taken"
                      ? "text-[10px] text-red-400"
                      : "text-[10px] text-[#3d3548]"
                }
              >
                {r.result === "available"
                  ? "✓ avail"
                  : r.result === "taken"
                    ? "✗ taken"
                    : "? unkn"}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}
