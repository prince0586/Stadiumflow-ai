import React from "react";
import { AlertCircle } from "lucide-react";

export function IncidentItem({ 
  type, 
  time, 
  zone, 
  msg 
}: { 
  type: "critical" | "warning" | "info"; 
  time: string; 
  zone: string; 
  msg: string;
  key?: string | number;
}) {
  const borderColor = {
    critical: "border-rose-500/50",
    warning: "border-sky-400/50",
    info: "border-[var(--border-main)]"
  };

  const iconColor = {
    critical: "text-rose-500",
    warning: "text-sky-400",
    info: "text-slate-500"
  };

  return (
    <div className={`p-4 rounded-xl border bg-[var(--bg-main)]/50 flex gap-4 items-start ${borderColor[type]}`}>
      <div className={`mt-1 flex-shrink-0 ${iconColor[type]}`}>
        <AlertCircle className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{zone}</span>
          <span className="text-[10px] font-mono text-slate-600">{time}</span>
        </div>
        <p className="text-xs font-semibold text-[var(--text-main)] leading-normal">{msg}</p>
      </div>
    </div>
  );
}
