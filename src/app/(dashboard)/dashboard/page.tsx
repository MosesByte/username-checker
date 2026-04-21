"use client";

import { useAuth } from "@/lib/auth-context";
import { useCallback, useEffect, useState } from "react";
import { DraggablePanel } from "@/components/DraggablePanel";
import { PanelItem } from "@/components/PanelItem";
import { CheckerPanel } from "@/components/CheckerPanel";

interface Entry {
  id: number;
  platform: string;
  username: string;
  url: string;
}

// ── Panel layout config ─────────────────────────────────────────────────────

const PANEL_IDS = [
  "dashboard",
  "checker",
  "organizer",
  "platforms",
  "account",
  "settings",
] as const;

type PanelId = (typeof PANEL_IDS)[number];

// Default positions: spread left-to-right matching the previous grid layout.
// normal panel ≈ 176 px (w-44), checker ≈ 300 px, gap = 8 px.
const DEFAULT_POS: Record<PanelId, { x: number; y: number }> = {
  dashboard: { x: 0, y: 0 },
  checker: { x: 184, y: 0 },
  organizer: { x: 492, y: 0 },
  platforms: { x: 676, y: 0 },
  account: { x: 860, y: 0 },
  settings: { x: 1044, y: 0 },
};

// Initial z-stack (higher value = closer to viewer)
const DEFAULT_Z: Record<PanelId, number> = {
  dashboard: 16,
  checker: 15,
  organizer: 14,
  platforms: 13,
  account: 12,
  settings: 11,
};

const Z_KEY = "cgui:zmap";

function loadZMap(): Record<PanelId, number> {
  try {
    const raw = localStorage.getItem(Z_KEY);
    if (raw) return JSON.parse(raw) as Record<PanelId, number>;
  } catch {
    // ignore
  }
  return { ...DEFAULT_Z };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [zMap, setZMap] = useState<Record<PanelId, number>>({ ...DEFAULT_Z });

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((d) => setEntries(d as Entry[]))
      .finally(() => setLoading(false));

    // Load persisted z-order after mount (SSR-safe)
    setZMap(loadZMap());
  }, []);

  const focus = useCallback((id: PanelId) => {
    setZMap((prev) => {
      const max = Math.max(...Object.values(prev));
      if (prev[id] === max) return prev; // already on top, skip re-render
      const next = { ...prev, [id]: max + 1 };
      try {
        localStorage.setItem(Z_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const platforms = [...new Set(entries.map((e) => e.platform))];
  const platformCounts = platforms.reduce<Record<string, number>>((acc, p) => {
    acc[p] = entries.filter((e) => e.platform === p).length;
    return acc;
  }, {});
  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "user";

  return (
    // min-w forces the workspace wider than the viewport so all panels have room
    // and the parent's overflow-auto will expose a horizontal scrollbar if needed.
    <div
      className="fade-in relative"
      style={{ minHeight: "800px", minWidth: "1260px" }}
    >

      {/* ── Dashboard ──────────────────────────────────────────────────── */}
      <DraggablePanel
        id="dashboard"
        title="Dashboard"
        defaultX={DEFAULT_POS.dashboard.x}
        defaultY={DEFAULT_POS.dashboard.y}
        zIndex={zMap.dashboard}
        onFocus={() => focus("dashboard")}
      >
        <PanelItem label="Overview" active />
        <PanelItem
          label="Total Entries"
          badge={loading ? "…" : entries.length}
        />
        <PanelItem
          label="Platforms"
          badge={loading ? "…" : platforms.length}
        />
        <PanelItem separator />
        <PanelItem label="Status" badge="online" />
        <PanelItem label="Session" badge="active" />
      </DraggablePanel>

      {/* ── Username Checker ───────────────────────────────────────────── */}
      <DraggablePanel
        id="checker"
        title="Checker"
        badge="9 platforms"
        defaultX={DEFAULT_POS.checker.x}
        defaultY={DEFAULT_POS.checker.y}
        zIndex={zMap.checker}
        onFocus={() => focus("checker")}
        width="wide"
      >
        <CheckerPanel />
      </DraggablePanel>

      {/* ── Organizer ──────────────────────────────────────────────────── */}
      <DraggablePanel
        id="organizer"
        title="Organizer"
        badge={loading ? "" : entries.length || ""}
        defaultX={DEFAULT_POS.organizer.x}
        defaultY={DEFAULT_POS.organizer.y}
        zIndex={zMap.organizer}
        onFocus={() => focus("organizer")}
      >
        <PanelItem
          label="All Entries"
          href="/organizer"
          badge={loading ? "…" : entries.length}
        />
        <PanelItem label="By Platform" href="/organizer" />
        <PanelItem label="Favorites" muted />
        <PanelItem separator />
        <PanelItem label="Add New" href="/organizer" />
        <PanelItem label="Import" muted />
        <PanelItem label="Export" muted />
      </DraggablePanel>

      {/* ── Platforms ──────────────────────────────────────────────────── */}
      <DraggablePanel
        id="platforms"
        title="Platforms"
        badge={platforms.length || ""}
        defaultX={DEFAULT_POS.platforms.x}
        defaultY={DEFAULT_POS.platforms.y}
        zIndex={zMap.platforms}
        onFocus={() => focus("platforms")}
      >
        {loading ? (
          <PanelItem label="loading…" muted />
        ) : platforms.length === 0 ? (
          <>
            <PanelItem label="no platforms yet" muted />
            <PanelItem label="add an entry first" muted />
          </>
        ) : (
          platforms
            .slice(0, 10)
            .map((p) => (
              <PanelItem
                key={p}
                label={p}
                href="/organizer"
                badge={platformCounts[p]}
              />
            ))
        )}
      </DraggablePanel>

      {/* ── Account ────────────────────────────────────────────────────── */}
      <DraggablePanel
        id="account"
        title="Account"
        defaultX={DEFAULT_POS.account.x}
        defaultY={DEFAULT_POS.account.y}
        zIndex={zMap.account}
        onFocus={() => focus("account")}
      >
        <PanelItem
          label={displayName}
          badge={user?.role === "admin" ? "admin" : "user"}
          active
        />
        <PanelItem label={user?.email?.slice(0, 20) ?? "—"} muted />
        <PanelItem separator />
        {user?.role === "admin" && (
          <PanelItem label="Invite Codes" href="/admin" />
        )}
        {user?.role === "admin" && (
          <PanelItem label="Manage Users" href="/admin" />
        )}
        <PanelItem label="Export Data" muted />
        <PanelItem separator />
        <PanelItem label="Sign Out" onClick={() => void logout()} />
      </DraggablePanel>

      {/* ── Settings ───────────────────────────────────────────────────── */}
      <DraggablePanel
        id="settings"
        title="Settings"
        defaultX={DEFAULT_POS.settings.x}
        defaultY={DEFAULT_POS.settings.y}
        zIndex={zMap.settings}
        onFocus={() => focus("settings")}
      >
        <PanelItem label="Theme" badge="dark" muted />
        <PanelItem label="Language" badge="en" muted />
        <PanelItem label="Font" badge="mono" muted />
        <PanelItem separator />
        <PanelItem label="API Keys" muted />
        <PanelItem label="Webhooks" muted />
        <PanelItem separator />
        <PanelItem label="About" muted />
      </DraggablePanel>

    </div>
  );
}
