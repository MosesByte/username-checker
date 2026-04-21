"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AtSign, Search, ArrowRight } from "lucide-react";

interface Entry {
  id: number;
  platform: string;
  username: string;
  url: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((data) => setEntries(data as Entry[]))
      .finally(() => setLoading(false));
  }, []);

  const platforms = [...new Set(entries.map((e) => e.platform))];

  return (
    <div className="fade-in max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#B98CF7]">
            user@dashboard ~
          </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f7f0ff] md:text-4xl">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#a99fb8]">
          A calm command center for your bio links, saved handles and availability checks.
        </p>
        </div>
        <div className="rounded-2xl border border-[#B98CF7]/18 bg-[#B98CF7]/10 px-4 py-3 font-mono text-xs text-[#d8c3ff]">
          workspace.online
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Entries" value={entries.length} />
        <StatCard label="Platforms" value={platforms.length} />
        <StatCard label="Recent Additions" value={entries.slice(0, 5).length} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickLink
          href="/organizer"
          icon={<AtSign size={18} />}
          title="Organizer"
          desc="Manage your saved usernames and links"
        />
        <QuickLink
          href="/checker"
          icon={<Search size={18} />}
          title="Username Checker"
          desc="Check availability on lightweight bio platforms"
        />
      </div>

      {!loading && entries.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-[#B98CF7]">
              recent_entries
            </h2>
            <Link
              href="/organizer"
              className="flex items-center gap-1 text-xs text-[#9b91aa] transition-colors hover:text-[#f7f0ff]"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#B98CF7]/14 bg-black/20">
            {entries.slice(0, 5).map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-4 px-4 py-3.5 text-sm transition-colors hover:bg-white/[0.03] ${
                  i !== 0 ? "border-t border-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-28 truncate font-mono text-xs text-[#8f849f]">
                    {entry.platform}
                  </span>
                  <span className="text-[#f7f0ff]">@{entry.username}</span>
                </div>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-[#8f849f] transition-colors hover:text-[#B98CF7]"
                >
                  {entry.url.replace(/^https?:\/\//, "").slice(0, 30)}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="glass-card rounded-3xl border-dashed p-10 text-center">
          <p className="text-sm text-[#9b91aa]">No entries yet.</p>
          <Link
            href="/organizer"
            className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[#B98CF7]/30 bg-[#B98CF7]/15 px-4 py-2 text-sm text-[#f7f0ff] transition-colors hover:bg-[#B98CF7]/25"
          >
            Add your first entry <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card glow-hover rounded-3xl px-5 py-5">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#9b91aa]">
        {label}
      </p>
      <p className="text-3xl font-semibold text-[#f7f0ff]">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card glow-hover group flex items-start gap-4 rounded-3xl px-5 py-5"
    >
      <div className="mt-0.5 rounded-2xl border border-[#B98CF7]/20 bg-[#B98CF7]/10 p-3 text-[#B98CF7] transition-colors group-hover:text-[#d8c3ff]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#f7f0ff]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#9b91aa]">{desc}</p>
      </div>
    </Link>
  );
}
