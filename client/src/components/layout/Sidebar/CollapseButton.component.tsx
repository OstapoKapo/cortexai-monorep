"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollapseButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function CollapseButton({ collapsed, onToggle }: CollapseButtonProps) {
  return (
    <div className="p-4 border-t border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Згорнути</span>
          </>
        )}
      </button>
    </div>
  );
}
