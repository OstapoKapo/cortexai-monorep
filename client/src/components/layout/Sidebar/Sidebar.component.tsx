"use client";

import { Logo } from "./Logo.component";
import { NavItem } from "./NavItem.component";
import { CollapseButton } from "./CollapseButton.component";
import { navigationItems } from "./navigation.config";

interface SidebarProps {
  activeSection: string;
  collapsed: boolean;
  onSectionChange: (section: string) => void;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activeSection,
  collapsed,
  onSectionChange,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-20 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <Logo collapsed={collapsed} />

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeSection === item.id}
            collapsed={collapsed}
            onClick={onSectionChange}
          />
        ))}
      </nav>

      <CollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />
    </aside>
  );
}
