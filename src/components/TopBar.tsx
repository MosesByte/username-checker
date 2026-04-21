"use client";

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

  return (
    <header className="terminal-panel flex flex-col gap-4 rounded-3xl px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
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
    </header>
  );
}
