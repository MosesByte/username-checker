"use client";

import type { ReactNode } from "react";
import { DraggablePanel, type PanelWidth } from "@/components/DraggablePanel";

interface DetailPanelProps {
  id: string;
  title: string;
  badge?: string | number;
  defaultX: number;
  defaultY: number;
  zIndex: number;
  onFocus: () => void;
  onClose?: () => void;
  width?: PanelWidth;
  children: ReactNode;
}

export function DetailPanel(props: DetailPanelProps) {
  return <DraggablePanel width="wide" {...props} />;
}
