import React from "react";

interface QuickStatsChartProps {
  phonePercent: number;
  zoomPercent: number;
  totalByType: number;
}

export function QuickStatsChart({ phonePercent, zoomPercent, totalByType }: QuickStatsChartProps) {
  return (
    <div className="lg:col-span-5 xl:col-span-4 bg-surface rounded-xl border border-border-input p-5 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-5 left-5">
        <h2 className="text-lg font-bold text-white mb-1">Booking Types</h2>
        <p className="text-xs text-white/50 uppercase tracking-wide">أنواع الحجوزات</p>
      </div>
      
      {/* Custom CSS Donut Chart representation */}
      <div className="mt-12 relative w-48 h-48 rounded-full border-[16px] border-[#0A3355] flex items-center justify-center">
        {/* SVG implementation for segmented circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#FFEE34" strokeWidth="16" strokeDasharray={`${phonePercent * 2.64} 264`} />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="16" strokeDasharray={`${zoomPercent * 2.64} 264`} strokeDashoffset={`-${phonePercent * 2.64}`} />
        </svg>
        <div className="text-center z-10 flex flex-col items-center">
          <span className="text-3xl font-bold text-white leading-none">{totalByType}</span>
          <span className="text-xs text-white/50 mt-1 uppercase">Total</span>
        </div>
      </div>
      
      <div className="mt-8 flex gap-6 text-sm w-full justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow"></div>
          <span className="text-white/80">Phone ({phonePercent}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white"></div>
          <span className="text-white/80">Zoom ({zoomPercent}%)</span>
        </div>
      </div>
    </div>
  );
}
