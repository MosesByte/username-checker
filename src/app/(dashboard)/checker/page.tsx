"use client";

import { CheckerPanel } from "@/components/CheckerPanel";
import { DraggablePanel } from "@/components/DraggablePanel";
import { PanelRow } from "@/components/PanelRow";
import { useClickGuiPanels } from "@/lib/use-clickgui-panels";

type PanelId = "modules" | "checker" | "ops";

const DEFAULT_POS: Record<PanelId, { x: number; y: number }> = {
  modules: { x: 0, y: 0 },
  checker: { x: 196, y: 0 },
  ops: { x: 512, y: 184 },
};

export default function CheckerPage() {
  const { focusPanel, getZ, isActive, togglePanel } = useClickGuiPanels<PanelId>({
    storageKey: "cgui:checker",
    initialActive: { modules: true, checker: false, ops: false },
    initialZ: { modules: 20, checker: 19, ops: 18 },
  });

  const panelProps = (id: PanelId) => ({
    id: `checker:${id}`,
    zIndex: getZ(id),
    onFocus: () => focusPanel(id),
    defaultX: DEFAULT_POS[id].x,
    defaultY: DEFAULT_POS[id].y,
  });

  return (
    <div className="fade-in relative" style={{ minHeight: 720, minWidth: 960 }}>
      {isActive("modules") && (
        <DraggablePanel {...panelProps("modules")} title="Modules" badge="linked">
          <PanelRow label="Dashboard" href="/dashboard" />
          <PanelRow label="Checker" active={isActive("checker")} onClick={() => togglePanel("checker")} />
          <PanelRow label="Linktree Manager" href="/organizer" />
          <PanelRow label="Admin" href="/admin" />
          <PanelRow separator />
          <PanelRow label="Scanner Ops" active={isActive("ops")} onClick={() => togglePanel("ops")} />
          <PanelRow label="Bulk Scan" muted badge="soon" />
          <PanelRow label="Scheduler" muted badge="soon" />
        </DraggablePanel>
      )}

      {isActive("checker") && (
        <DraggablePanel
          {...panelProps("checker")}
          title="Checker"
          badge="9 platforms"
          width="wide"
        >
          <CheckerPanel />
        </DraggablePanel>
      )}

      {isActive("ops") && (
        <DraggablePanel {...panelProps("ops")} title="Scanner Ops" badge="beta">
          <PanelRow label="Live Check" active={isActive("checker")} onClick={() => togglePanel("checker")} />
          <PanelRow label="Save Available" muted badge="soon" />
          <PanelRow label="Auto Add Taken" muted badge="soon" />
          <PanelRow separator />
          <PanelRow label="Open Organizer" href="/organizer" />
          <PanelRow label="Admin Invites" href="/admin" />
          <PanelRow label="Export CSV" muted />
        </DraggablePanel>
      )}
    </div>
  );
}
