"use client";

import { useEffect, useState } from "react";
import { CheckerPanel } from "@/components/CheckerPanel";
import { DraggablePanel } from "@/components/DraggablePanel";
import { PanelItem } from "@/components/PanelItem";
import { useAuth } from "@/lib/auth-context";
import { useClickGuiPanels } from "@/lib/use-clickgui-panels";

interface Entry {
  id: number;
  platform: string;
  username: string;
  url: string;
}

type PanelId =
  | "dashboard"
  | "checker"
  | "organizer"
  | "platforms"
  | "account"
  | "settings";

const DEFAULT_POS: Record<PanelId, { x: number; y: number }> = {
  dashboard: { x: 0, y: 0 },
  checker: { x: 184, y: 0 },
  organizer: { x: 492, y: 0 },
  platforms: { x: 676, y: 0 },
  account: { x: 860, y: 0 },
  settings: { x: 1044, y: 0 },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const { focusPanel, getZ, isActive, togglePanel } = useClickGuiPanels<PanelId>({
    storageKey: "cgui:dashboard",
    initialActive: {
      dashboard: true,
      checker: false,
      organizer: false,
      platforms: false,
      account: false,
      settings: false,
    },
    initialZ: {
      dashboard: 20,
      checker: 19,
      organizer: 18,
      platforms: 17,
      account: 16,
      settings: 15,
    },
  });

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data as Entry[]))
      .finally(() => setLoading(false));
  }, []);

  const platforms = [...new Set(entries.map((entry) => entry.platform))];
  const platformCounts = platforms.reduce<Record<string, number>>((acc, platform) => {
    acc[platform] = entries.filter((entry) => entry.platform === platform).length;
    return acc;
  }, {});
  const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "user";

  const toggleablePanels: { id: PanelId; label: string }[] = [
    { id: "checker", label: "Checker" },
    { id: "organizer", label: "Organizer" },
    { id: "platforms", label: "Platforms" },
    { id: "account", label: "Account" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="fade-in relative" style={{ minHeight: "800px", minWidth: "1260px" }}>
      <DraggablePanel
        id="dashboard"
        title="Dashboard"
        defaultX={DEFAULT_POS.dashboard.x}
        defaultY={DEFAULT_POS.dashboard.y}
        zIndex={getZ("dashboard")}
        onFocus={() => focusPanel("dashboard")}
      >
        <PanelItem label="Overview" active />
        <PanelItem label="Total Entries" badge={loading ? "..." : entries.length} />
        <PanelItem label="Platforms" badge={loading ? "..." : platforms.length} />
        <PanelItem separator />
        {toggleablePanels.map(({ id, label }) => (
          <PanelItem
            key={id}
            label={label}
            badge={isActive(id) ? "on" : "off"}
            active={isActive(id)}
            onClick={() => togglePanel(id)}
          />
        ))}
      </DraggablePanel>

      {isActive("checker") && (
        <DraggablePanel
          id="checker"
          title="Checker"
          badge="9 platforms"
          defaultX={DEFAULT_POS.checker.x}
          defaultY={DEFAULT_POS.checker.y}
          zIndex={getZ("checker")}
          onFocus={() => focusPanel("checker")}
          width="wide"
        >
          <CheckerPanel />
        </DraggablePanel>
      )}

      {isActive("organizer") && (
        <DraggablePanel
          id="organizer"
          title="Organizer"
          badge={loading ? "" : entries.length || ""}
          defaultX={DEFAULT_POS.organizer.x}
          defaultY={DEFAULT_POS.organizer.y}
          zIndex={getZ("organizer")}
          onFocus={() => focusPanel("organizer")}
        >
          <PanelItem label="All Entries" href="/organizer" badge={loading ? "..." : entries.length} />
          <PanelItem label="By Platform" href="/organizer" />
          <PanelItem label="Favorites" muted />
          <PanelItem separator />
          <PanelItem label="Add New" href="/organizer" />
          <PanelItem label="Import" muted />
          <PanelItem label="Export" muted />
        </DraggablePanel>
      )}

      {isActive("platforms") && (
        <DraggablePanel
          id="platforms"
          title="Platforms"
          badge={platforms.length || ""}
          defaultX={DEFAULT_POS.platforms.x}
          defaultY={DEFAULT_POS.platforms.y}
          zIndex={getZ("platforms")}
          onFocus={() => focusPanel("platforms")}
        >
          {loading ? (
            <PanelItem label="loading..." muted />
          ) : platforms.length === 0 ? (
            <>
              <PanelItem label="no platforms yet" muted />
              <PanelItem label="add an entry first" muted />
            </>
          ) : (
            platforms
              .slice(0, 10)
              .map((platform) => (
                <PanelItem key={platform} label={platform} href="/organizer" badge={platformCounts[platform]} />
              ))
          )}
        </DraggablePanel>
      )}

      {isActive("account") && (
        <DraggablePanel
          id="account"
          title="Account"
          defaultX={DEFAULT_POS.account.x}
          defaultY={DEFAULT_POS.account.y}
          zIndex={getZ("account")}
          onFocus={() => focusPanel("account")}
        >
          <PanelItem label={displayName} badge={user?.role === "admin" ? "admin" : "user"} active />
          <PanelItem label={user?.email?.slice(0, 20) ?? "-"} muted />
          <PanelItem separator />
          {user?.role === "admin" && <PanelItem label="Manage Users" href="/admin" />}
          <PanelItem label="Export Data" muted />
          <PanelItem separator />
          <PanelItem label="Sign Out" onClick={() => void logout()} />
        </DraggablePanel>
      )}

      {isActive("settings") && (
        <DraggablePanel
          id="settings"
          title="Settings"
          defaultX={DEFAULT_POS.settings.x}
          defaultY={DEFAULT_POS.settings.y}
          zIndex={getZ("settings")}
          onFocus={() => focusPanel("settings")}
        >
          <PanelItem label="Theme" badge="dark" muted />
          <PanelItem label="Language" badge="en" muted />
          <PanelItem label="Font" badge="mono" muted />
          <PanelItem separator />
          <PanelItem label="About" muted />
        </DraggablePanel>
      )}
    </div>
  );
}
