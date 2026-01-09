"use client";

import { Bell } from "lucide-react";

interface NotificationButtonProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationButton({ count = 0, onClick }: NotificationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <Bell className="w-5 h-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
      )}
    </button>
  );
}
