import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  number: string;
  labelAR: string;
  labelEN: string;
  iconColor?: string;
  hasIndicator?: boolean;
}

export function StatCard({ icon: Icon, number, labelAR, labelEN, iconColor = "text-yellow", hasIndicator = false }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl p-3 md:p-5 border border-border-input relative overflow-hidden group">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-yellow" />
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-2xl md:text-3xl font-bold text-white mb-1 pl-2">{number}</span>
          <div className="pl-2">
            <h3 className="text-sm font-bold text-white/90">{labelAR}</h3>
            <p className="text-xs text-white/50 uppercase tracking-wider">{labelEN}</p>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-surface-deep relative ${iconColor}`}>
          <Icon className="w-6 h-6" />
          {hasIndicator && (
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow rounded-full border-2 border-[#0A1F33]"></span>
          )}
        </div>
      </div>
    </div>
  );
}
