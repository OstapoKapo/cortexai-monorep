"use client";

import { LucideIcon } from "lucide-react";

interface NavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
  onClick: (id: string) => void;
}

export function NavItem({
  id,
  label,
  icon: Icon,
  isActive,
  collapsed,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-foreground"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}
