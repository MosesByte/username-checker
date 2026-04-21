"use client";

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";

export type PanelWidth = "normal" | "wide";

const WIDTH: Record<PanelWidth, string> = {
  normal: "w-44",
  wide: "w-[300px]",
};

interface Props {
  id: string;
  title: string;
  badge?: string | number;
  defaultX?: number;
  defaultY?: number;
  zIndex: number;
  onFocus: () => void;
  width?: PanelWidth;
  children: ReactNode;
}

export function DraggablePanel({
  id,
  title,
  badge,
  defaultX = 0,
  defaultY = 0,
  zIndex,
  onFocus,
  width = "normal",
  children,
}: Props) {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const [minimized, setMinimized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  // Load saved position + minimized state after mount (SSR-safe)
  useEffect(() => {
    try {
      const rawPos = localStorage.getItem(`cgui:pos:${id}`);
      if (rawPos) setPos(JSON.parse(rawPos) as { x: number; y: number });

      const rawMin = localStorage.getItem(`cgui:min:${id}`);
      if (rawMin) setMinimized(rawMin === "1");
    } catch {
      // ignore
    }
  }, [id]);

  const persist = useCallback(
    (p: { x: number; y: number }) => {
      setPos(p);
      try {
        localStorage.setItem(`cgui:pos:${id}`, JSON.stringify(p));
      } catch {
        // ignore
      }
    },
    [id],
  );

  const toggleMin = useCallback(() => {
    setMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`cgui:min:${id}`, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, [id]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drag.current) return;
      persist({
        x: Math.max(0, drag.current.ox + (e.clientX - drag.current.sx)),
        y: Math.max(0, drag.current.oy + (e.clientY - drag.current.sy)),
      });
    },
    [persist],
  );

  const onMouseUp = useCallback(() => {
    drag.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [pos, onMouseMove, onMouseUp],
  );

  return (
    <div
      ref={panelRef}
      className={`absolute ${WIDTH[width]} flex flex-col border border-[#B98CF7]/18 bg-[#05030b] shadow-[0_6px_32px_rgba(0,0,0,0.55)]`}
      style={{ left: pos.x, top: pos.y, zIndex }}
      onMouseDown={onFocus}
    >
      {/* Header — drag handle */}
      <div
        className="flex select-none items-center justify-between bg-[#110826] px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{ borderBottom: minimized ? "none" : "1px solid rgba(185,140,247,0.22)" }}
        onMouseDown={startDrag}
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#e8deff]">
          {title}
        </span>

        <div className="flex items-center gap-2">
          {badge !== undefined && badge !== "" && (
            <span className="font-mono text-[10px] text-[#B98CF7]">{badge}</span>
          )}
          {/* Minimize button — stop propagation so it doesn't start a drag */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); toggleMin(); }}
            className="font-mono text-[12px] leading-none text-[#4a4158] hover:text-[#B98CF7] transition-colors"
            title={minimized ? "expand" : "minimize"}
          >
            {minimized ? "+" : "−"}
          </button>
        </div>
      </div>

      {/* Content — hidden when minimized */}
      {!minimized && (
        <div className="flex flex-col">{children}</div>
      )}
    </div>
  );
}
