"use client";

import type { ReactNode } from "react";
import { DraggablePanel, type PanelWidth } from "@/components/DraggablePanel";

interface SpawnedSubpanelProps {
  id: string;
  title: string;
  badge?: string | number;
  defaultX: number;
  defaultY: number;
  zIndex: number;
  onFocus: () => void;
  width?: PanelWidth;
  children: ReactNode;
}

export function SpawnedSubpanel({ width = "wide", ...props }: SpawnedSubpanelProps) {
  return <DraggablePanel width={width} {...props} />;
}
