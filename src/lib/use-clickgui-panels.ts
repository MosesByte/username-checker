"use client";

import { useCallback, useState } from "react";

interface PanelWorkspaceOptions<T extends string> {
  storageKey: string;
  initialActive: Partial<Record<T, boolean>>;
  initialZ?: Partial<Record<T, number>>;
}

export function useClickGuiPanels<T extends string>({
  storageKey,
  initialActive,
  initialZ = {},
}: PanelWorkspaceOptions<T>) {
  const activeKey = `${storageKey}:active`;
  const zKey = `${storageKey}:z`;

  const [activePanels, setActivePanels] = useState<Record<string, boolean>>(() => {
    const fallback = { ...initialActive } as Record<string, boolean>;
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(activeKey);
      if (raw) return { ...fallback, ...(JSON.parse(raw) as Record<string, boolean>) };
    } catch {
      // ignore
    }
    return fallback;
  });

  const [zMap, setZMap] = useState<Record<string, number>>(() => {
    const fallback = { ...initialZ } as Record<string, number>;
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(zKey);
      if (raw) return { ...fallback, ...(JSON.parse(raw) as Record<string, number>) };
    } catch {
      // ignore
    }
    return fallback;
  });

  const persistActive = useCallback(
    (next: Record<string, boolean>) => {
      try {
        localStorage.setItem(activeKey, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [activeKey],
  );

  const focusPanel = useCallback(
    (id: T) => {
      setZMap((current) => {
        const max = Math.max(20, ...Object.values(current));
        const next = { ...current, [id]: max + 1 };
        try {
          localStorage.setItem(zKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [zKey],
  );

  const openPanel = useCallback(
    (id: T) => {
      setActivePanels((current) => {
        const next = { ...current, [id]: true };
        persistActive(next);
        return next;
      });
      focusPanel(id);
    },
    [focusPanel, persistActive],
  );

  const closePanel = useCallback(
    (id: T) => {
      setActivePanels((current) => {
        const next = { ...current, [id]: false };
        persistActive(next);
        return next;
      });
    },
    [persistActive],
  );

  const togglePanel = useCallback(
    (id: T) => {
      setActivePanels((current) => {
        const nextValue = !current[id];
        const next = { ...current, [id]: nextValue };
        persistActive(next);
        if (nextValue) focusPanel(id);
        return next;
      });
    },
    [focusPanel, persistActive],
  );

  const isActive = useCallback((id: T) => Boolean(activePanels[id]), [activePanels]);
  const getZ = useCallback((id: T) => zMap[id] ?? 10, [zMap]);

  return {
    activePanels,
    closePanel,
    focusPanel,
    getZ,
    isActive,
    openPanel,
    togglePanel,
  };
}
