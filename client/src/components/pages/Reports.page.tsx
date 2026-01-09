"use client";

import { FileText } from "lucide-react";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Звіти</h2>
      <p className="text-muted-foreground">
        Тут будуть відображатись ваші звіти та аналітичні дані.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ReportCard key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

interface ReportCardProps {
  index: number;
}

function ReportCard({ index }: ReportCardProps) {
  // Детерміноване значення прогресу на основі індексу
  const progress = ((index * 17) % 60) + 40;
  
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Звіт #{index}</h3>
          <p className="text-sm text-muted-foreground">Оновлено сьогодні</p>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
