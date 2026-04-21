"use client";

import type { ReactNode } from "react";

interface CategoryPanelProps {
  title: string;
  badge?: string | number;
  className?: string;
  children: ReactNode;
}

export function CategoryPanel({ title, badge, className = "", children }: CategoryPanelProps) {
  return (
    <div className={`flex flex-col border border-[#B98CF7]/18 bg-[#05030b] ${className}`}>
      <div className="flex items-center justify-between border-b border-[#B98CF7]/22 bg-[#110826] px-3 py-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#e8deff]">
          {title}
        </span>
        {badge !== undefined && badge !== "" && (
          <span className="font-mono text-[10px] text-[#B98CF7]">{badge}</span>
        )}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
