"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  AtSign,
  Search,
  LogOut,
  Sparkles,
  Shield,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer", label: "Organizer", icon: AtSign },
  { href: "/checker", label: "Username Checker", icon: Search },
];

const ADMIN_NAV = { href: "/admin", label: "Admin", icon: Shield };

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="terminal-panel flex w-full shrink-0 flex-col overflow-hidden rounded-3xl lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72">
      <div className="terminal-titlebar px-5 py-5">
        <div className="mb-5 flex items-center gap-2">
          <span className="terminal-dot bg-[#ff6b6b] text-[#ff6b6b]" />
          <span className="terminal-dot bg-[#ffd166] text-[#ffd166]" />
          <span className="terminal-dot bg-[#5cffc7] text-[#5cffc7]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#B98CF7]/30 bg-[#B98CF7]/15 text-[#B98CF7] shadow-[0_0_30px_rgba(185,140,247,0.18)]">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="block text-sm font-semibold tracking-tight text-[#f7f0ff]">
              Username Manager
            </span>
            <span className="font-mono text-[11px] text-[#9b91aa]">moses@bio ~</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 gap-2 overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-visible">
        {[...NAV, ...(user?.role === "admin" ? [ADMIN_NAV] : [])].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex min-w-max items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all ${
                active
                  ? "border-[#B98CF7]/45 bg-[#B98CF7]/15 text-[#f7f0ff] shadow-[0_0_34px_rgba(185,140,247,0.14)]"
                  : "border-transparent text-[#9b91aa] hover:border-[#B98CF7]/20 hover:bg-white/[0.04] hover:text-[#f7f0ff]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[#B98CF7] transition-colors group-hover:bg-[#B98CF7]/15">
                <Icon size={16} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#B98CF7]/15 px-3 py-4">
        <div className="mb-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#B98CF7]">
            signed in
          </p>
          <p className="mt-1 truncate text-xs text-[#b9afc8]">
            {user?.username ?? user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-[#9b91aa] transition-colors hover:bg-white/[0.04] hover:text-[#f7f0ff]"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
