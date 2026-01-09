import {
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  FolderOpen,
  LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  { id: "reports", label: "Звіти", icon: FileText },
  { id: "chat", label: "Чат з AI", icon: MessageSquare },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
  { id: "documents", label: "Документи", icon: FolderOpen },
  { id: "users", label: "Користувачі", icon: Users },
  { id: "settings", label: "Налаштування", icon: Settings },
];
