"use client";

import type { ReactNode } from "react";
import { PanelItem } from "@/components/PanelItem";

interface PanelRowProps {
  label?: string;
  badge?: string | number;
  active?: boolean;
  muted?: boolean;
  separator?: boolean;
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export function PanelRow({ children, label = "", ...props }: PanelRowProps) {
  if (children) {
    return (
      <div className="border-b border-[#B98CF7]/[0.07] px-3 py-[6px] font-mono text-[11px] text-[#7d7292]">
        {children}
      </div>
    );
  }

  return <PanelItem label={label} {...props} />;
}
