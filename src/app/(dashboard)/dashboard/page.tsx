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

// ── Panel config ─────────────────────────────────────────────────────────────

const PANEL_IDS = [
  "dashboard",
  "checker",
  "organizer",
  "platforms",
  "account",
  "settings",
] as const;

type PanelId = (typeof PANEL_IDS)[number];

const DEFAULT_POS: Record<PanelId, { x: number; y: number }> = {
  dashboard: { x: 0, y: 0 },
  checker: { x: 184, y: 0 },
  organizer: { x: 492, y: 0 },
  platforms: { x: 676, y: 0 },
  account: { x: 860, y: 0 },
  settings: { x: 1044, y: 0 },
};

const DEFAULT_Z: Record<PanelId, number> = {
  dashboard: 16,
  checker: 15,
  organizer: 14,
  platforms: 13,
  account: 12,
  settings: 11,
};

const DEFAULT_VIS: Record<PanelId, boolean> = {
  dashboard: true,
  checker: true,
  organizer: true,
  platforms: true,
  account: true,
  settings: true,
};

const Z_KEY = "cgui:zmap";
const VIS_KEY = "cgui:vis";

function loadZMap(): Record<PanelId, number> {
  try {
    const raw = localStorage.getItem(Z_KEY);
    if (raw) return JSON.parse(raw) as Record<PanelId, number>;
  } catch { /* ignore */ }
  return { ...DEFAULT_Z };
}

function loadVis(): Record<PanelId, boolean> {
  try {
    const raw = localStorage.getItem(VIS_KEY);
    if (raw) return { ...DEFAULT_VIS, ...(JSON.parse(raw) as Partial<Record<PanelId, boolean>>) };
  } catch { /* ignore */ }
  return { ...DEFAULT_VIS };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [zMap, setZMap] = useState<Record<PanelId, number>>({ ...DEFAULT_Z });
  const [visible, setVisible] = useState<Record<PanelId, boolean>>({ ...DEFAULT_VIS });

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((d) => setEntries(d as Entry[]))
      .finally(() => setLoading(false));

    setZMap(loadZMap());
    setVisible(loadVis());
  }, []);

  const focus = useCallback((id: PanelId) => {
    setZMap((prev) => {
      const max = Math.max(...Object.values(prev));
      if (prev[id] === max) return prev;
      const next = { ...prev, [id]: max + 1 };
      try { localStorage.setItem(Z_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const toggleVis = useCallback((id: PanelId) => {
    if (id === "dashboard") return; // dashboard can't hide itself
    setVisible((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(VIS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
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

  // Panels other than dashboard that can be toggled
  const toggleablePanels: { id: PanelId; label: string }[] = [
    { id: "checker", label: "Checker" },
    { id: "organizer", label: "Organizer" },
    { id: "platforms", label: "Platforms" },
    { id: "account", label: "Account" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div
      className="fade-in relative"
      style={{ minHeight: "800px", minWidth: "1260px" }}
    >

      {/* ── Dashboard (always visible) ─────────────────────────────────── */}
      <DraggablePanel
        id="dashboard"
        title="Dashboard"
        defaultX={DEFAULT_POS.dashboard.x}
        defaultY={DEFAULT_POS.dashboard.y}
        zIndex={zMap.dashboard}
        onFocus={() => focus("dashboard")}
      >
        <PanelItem label="Overview" active />
        <PanelItem label="Total Entries" badge={loading ? "…" : entries.length} />
        <PanelItem label="Platforms" badge={loading ? "…" : platforms.length} />
        <PanelItem separator />
        {/* Panel visibility toggles */}
        {toggleablePanels.map(({ id, label }) => (
          <PanelItem
            key={id}
            label={label}
            badge={visible[id] ? "●" : "○"}
            active={visible[id]}
            onClick={() => toggleVis(id)}
          />
        ))}
      </DraggablePanel>

      {/* ── Checker ────────────────────────────────────────────────────── */}
      {visible.checker && (
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
      )}

      {/* ── Organizer ──────────────────────────────────────────────────── */}
      {visible.organizer && (
        <DraggablePanel
          id="organizer"
          title="Organizer"
          badge={loading ? "" : entries.length || ""}
          defaultX={DEFAULT_POS.organizer.x}
          defaultY={DEFAULT_POS.organizer.y}
          zIndex={zMap.organizer}
          onFocus={() => focus("organizer")}
        >
          <PanelItem label="All Entries" href="/organizer" badge={loading ? "…" : entries.length} />
          <PanelItem label="By Platform" href="/organizer" />
          <PanelItem label="Favorites" muted />
          <PanelItem separator />
          <PanelItem label="Add New" href="/organizer" />
          <PanelItem label="Import" muted />
          <PanelItem label="Export" muted />
        </DraggablePanel>
      )}

      {/* ── Platforms ──────────────────────────────────────────────────── */}
      {visible.platforms && (
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
            platforms.slice(0, 10).map((p) => (
              <PanelItem key={p} label={p} href="/organizer" badge={platformCounts[p]} />
            ))
          )}
        </DraggablePanel>
      )}

      {/* ── Account ────────────────────────────────────────────────────── */}
      {visible.account && (
        <DraggablePanel
          id="account"
          title="Account"
          defaultX={DEFAULT_POS.account.x}
          defaultY={DEFAULT_POS.account.y}
          zIndex={zMap.account}
          onFocus={() => focus("account")}
        >
          <PanelItem label={displayName} badge={user?.role === "admin" ? "admin" : "user"} active />
          <PanelItem label={user?.email?.slice(0, 20) ?? "—"} muted />
          <PanelItem separator />
          {user?.role === "admin" && <PanelItem label="Invite Codes" href="/admin" />}
          {user?.role === "admin" && <PanelItem label="Manage Users" href="/admin" />}
          <PanelItem label="Export Data" muted />
          <PanelItem separator />
          <PanelItem label="Sign Out" onClick={() => void logout()} />
        </DraggablePanel>
      )}

      {/* ── Settings ───────────────────────────────────────────────────── */}
      {visible.settings && (
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
      )}

    </div>
  );
}
