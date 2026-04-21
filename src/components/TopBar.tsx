"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const ROUTE_META: Record<string, { label: string; prompt: string }> = {
  "/dashboard": { label: "Dashboard", prompt: "user@dashboard ~" },
  "/checker": { label: "Username Checker", prompt: "user@checker ~" },
  "/organizer": { label: "Organizer", prompt: "user@organizer ~" },
  "/admin": { label: "Admin", prompt: "admin@invites ~" },
};

export default function TopBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const meta = ROUTE_META[pathname] ?? { label: "Workspace", prompt: "user@workspace ~" };
  const handle = user?.username ?? user?.email?.split("@")[0] ?? "guest";
  const nav = [
    { href: "/dashboard", label: "dash" },
    { href: "/checker", label: "checker" },
    { href: "/organizer", label: "manager" },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "admin" }] : []),
  ];

  return (
    <header className="terminal-panel flex flex-col gap-4 rounded-3xl px-4 py-4 md:px-5">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#B98CF7]">
          {meta.label}
        </p>
        <div className="mt-1 flex items-center font-mono text-sm text-[#f7f0ff]">
          <span>{meta.prompt}</span>
          <span className="terminal-cursor" />
        </div>
      </div>

      <div className="relative flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#5cffc7]/20 bg-[#5cffc7]/10 px-3 py-1.5 font-mono text-[11px] text-[#9fffe3]">
          live_session
        </span>
        <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-xs text-[#b9afc8]">
          {handle}
        </span>
      </div>
      </div>

      <div className="relative flex flex-wrap items-center gap-2 border-t border-[#B98CF7]/10 pt-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                active
                  ? "border-[#B98CF7]/50 bg-[#B98CF7]/16 text-[#f0e8ff]"
                  : "border-[#B98CF7]/14 bg-black/20 text-[#8f849f] hover:border-[#B98CF7]/35 hover:text-[#d9c8f5]"
              }`}
            >
              /{item.label}
            </Link>
          );
        })}
        <span className="border border-[#B98CF7]/10 bg-black/10 px-3 py-1.5 font-mono text-[11px] text-[#4a4158] opacity-50">
          /analytics soon
        </span>
        <span className="border border-[#B98CF7]/10 bg-black/10 px-3 py-1.5 font-mono text-[11px] text-[#4a4158] opacity-50">
          /settings soon
        </span>
      </div>
    </header>
  );
}
