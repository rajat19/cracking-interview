"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export function StatsCard({ icon: Icon, value, label }: StatsCardProps) {
  return (
    <div className="flex items-center space-x-3 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}