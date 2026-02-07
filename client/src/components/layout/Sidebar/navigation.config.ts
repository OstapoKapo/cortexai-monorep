import {
  FileText,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  { id: "reports", label: "Звіти", icon: FileText },
  { id: "generator", label: "Генератор", icon: Sparkles },
];
