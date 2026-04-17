import React from "react";
import { TrendingUp } from "lucide-react";

export function MetricCard({ 
  label, 
  value, 
  trend, 
  isUp 
}: { 
  label: string; 
  value: string; 
  trend: string; 
  isUp: boolean | null 
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 group transition-all duration-500 hover:border-sky-500/50" role="status" aria-label={`${label}: ${value}`}>
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 font-serif italic">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-4xl font-bold text-[var(--text-main)] tabular-nums tracking-tighter">
          {value}
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
          isUp === true ? "text-rose-500 bg-rose-500/10" : isUp === false ? "text-green-400 bg-green-500/10" : "text-slate-500"
        }`}>
          {isUp !== null && (isUp ? <TrendingUp className="w-3 h-3 rotate-45" /> : <TrendingUp className="w-3 h-3 rotate-[135deg]" />)}
          {trend}
        </div>
      </div>
    </div>
  );
}
