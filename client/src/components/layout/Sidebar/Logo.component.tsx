"use client";

import { Brain } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="h-16 border-b border-border flex items-center px-4 gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
        <Brain className="w-6 h-6 text-primary-foreground" />
      </div>
      {!collapsed && (
        <span className="font-bold text-xl tracking-tight">CortexAI</span>
      )}
    </div>
  );
}
