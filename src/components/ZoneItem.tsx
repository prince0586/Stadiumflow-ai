import React from "react";
import { motion } from "motion/react";

export function ZoneItem({ label, value }: { label: string; value: number; key?: string | number }) {
  const color = value > 80 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : value > 50 ? "bg-sky-400" : "bg-green-400";
  return (
    <div className="space-y-1.5 group cursor-default" role="listitem" tabIndex={0}>
      <div className="flex justify-between text-[11px] font-medium transition-colors group-hover:text-sky-400">
        <span className="text-slate-500 font-mono tracking-tighter uppercase">{label}</span>
        <span className="text-[var(--text-main)] font-bold tabular-nums">{value}%</span>
      </div>
      <div className="h-1 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }} 
          className={`h-full ${color} transition-all duration-1000`} 
        />
      </div>
    </div>
  );
}
