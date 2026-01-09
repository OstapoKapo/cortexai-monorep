"use client";

import { BarChart3 } from "lucide-react";

const stats = [
  { label: "Всього звітів", value: "124", change: "+12%" },
  { label: "Активні сесії", value: "8", change: "+3%" },
  { label: "Запити до AI", value: "1,847", change: "+28%" },
  { label: "Користувачі", value: "32", change: "+5%" },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Аналітика</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <ChartPlaceholder />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: string;
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-sm text-green-500 mt-1">{change}</p>
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
      <BarChart3 className="w-12 h-12 opacity-50" />
      <span className="ml-3">Графіки аналітики</span>
    </div>
  );
}
