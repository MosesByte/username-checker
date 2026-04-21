"use client";

import Link from "next/link";

interface PanelItemProps {
  label?: string;
  badge?: string | number;
  active?: boolean;
  muted?: boolean;
  separator?: boolean;
  href?: string;
  onClick?: () => void;
}

export function PanelItem({
  label = "",
  badge,
  active,
  muted,
  separator,
  href,
  onClick,
}: PanelItemProps) {
  if (separator) {
    return <div className="my-px border-t border-[#B98CF7]/10" />;
  }

  const cls = [
    "flex items-center justify-between border-b border-[#B98CF7]/[0.07] px-3 py-[6px] font-mono text-[11px] transition-colors border-l-2",
    active
      ? "border-l-[#B98CF7] bg-[#B98CF7]/[0.14] text-[#f0e8ff]"
      : "border-l-transparent text-[#7d7292] hover:bg-[#B98CF7]/[0.05] hover:text-[#c0b3d8]",
    muted ? "opacity-30 pointer-events-none select-none" : "cursor-pointer",
  ].join(" ");

  const inner = (
    <>
      <span className="truncate">{label}</span>
      {badge !== undefined && badge !== "" && (
        <span
          className={[
            "ml-2 shrink-0 font-mono text-[10px]",
            active ? "text-[#B98CF7]" : "text-[#4a4158]",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
    </>
  );

  if (href && !muted) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cls} onClick={muted ? undefined : onClick}>
      {inner}
    </div>
  );
}
