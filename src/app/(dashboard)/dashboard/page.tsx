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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Here&apos;s a summary of your username portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Entries" value={entries.length} />
        <StatCard label="Platforms" value={platforms.length} />
        <StatCard label="Recent Additions" value={entries.slice(0, 5).length} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
          desc="Check availability on guns.lol and more"
        />
      </div>

      {!loading && entries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-300">Recent Entries</h2>
            <Link
              href="/organizer"
              className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            {entries.slice(0, 5).map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  i !== 0 ? "border-t border-zinc-800" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs w-24 truncate">{entry.platform}</span>
                  <span className="text-zinc-200">@{entry.username}</span>
                </div>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                >
                  {entry.url.replace(/^https?:\/\//, "").slice(0, 30)}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="rounded-lg border border-zinc-800 border-dashed p-10 text-center">
          <p className="text-zinc-500 text-sm">No entries yet.</p>
          <Link
            href="/organizer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md transition-colors"
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
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
      className="group flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
    >
      <div className="mt-0.5 text-zinc-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-200 group-hover:text-white">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
