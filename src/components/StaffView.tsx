import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Map, 
  Database, 
  Zap,
  Activity,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { StadiumAgents, VenueTelemetry } from "../lib/agents";
import { MetricCard } from "./MetricCard";
import { ZoneItem } from "./ZoneItem";
import { IncidentItem } from "./IncidentItem";

interface StaffViewProps {
  agents: StadiumAgents | null;
  telemetry: VenueTelemetry;
  historicalData: any[];
  theme: "light" | "dark";
}

export function StaffView({ 
  agents, 
  telemetry, 
  historicalData,
  theme
}: StaffViewProps) {
  const [aiSummary, setAiSummary] = useState("Analyzing telemetry...");
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    if (agents) {
      agents.getStaffSummary(telemetry).then(setAiSummary);
    }
  }, [telemetry, agents]);

  return (
    <div className={`h-full p-6 overflow-y-auto transition-colors duration-700 ${isEmergency ? (theme === 'dark' ? "bg-rose-950/20" : "bg-rose-50") : "bg-[var(--bg-main)]"}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Readiness</h2>
              <span className="text-lg font-serif italic text-[var(--text-main)]">Spatial Telemetry Dashboard</span>
            </div>
            {isEmergency && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-rose-500 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                PROTOCOL DELTA
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Status: Nominal</span>
              <span className="text-[12px] font-mono text-slate-300 tabular-nums">ID: VEN-PROT-AX9</span>
            </div>
            <button 
              onClick={() => setIsEmergency(!isEmergency)}
              className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                isEmergency 
                  ? "bg-rose-500 border border-rose-400 text-white animate-pulse" 
                  : "bg-[var(--bg-card)] border border-[var(--border-main)] text-slate-500 hover:text-sky-400 hover:border-sky-400"
              }`}
            >
              {isEmergency ? "STAND DOWN PROTOCOL" : "ACTIVATE DELTA"}
            </button>
          </div>
        </div>
        
        {/* Tactical Summary */}
        <div className={`border-l-4 p-6 bg-[var(--bg-card)]/50 backdrop-blur transition-all duration-700 ${isEmergency ? "border-rose-500 bg-rose-950/20" : "border-sky-500 shadow-xl"}`}>
          <div className="flex items-start gap-6">
             <div className={`p-4 rounded-full border-2 ${isEmergency ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-sky-500/10 border-sky-500/30 text-sky-400"}`}>
               <Zap className="w-8 h-8" />
             </div>
             <div className="flex-1">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Gemini 3.1 Pro // Strategic Evaluation</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 opacity-60">SECURITY_CLEARANCE_L4</span>
               </div>
               <p className="text-[var(--text-main)] text-lg leading-relaxed font-serif italic">
                 "{aiSummary}"
               </p>
             </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MetricCard 
            label="Gate A Congestion" 
            value={`${telemetry.gateA}%`} 
            trend="+4%" 
            isUp={telemetry.gateA > 50} 
          />
          <MetricCard 
            label="Avg. Concession Wait" 
            value="4.2m" 
            trend="-0.5m" 
            isUp={false} 
          />
          <MetricCard 
            label="Incident Response" 
            value="1.8m" 
            trend="Optimal" 
            isUp={null} 
          />
        </div>

        {/* Visual Map Area */}
        <div className="map-view-bg h-[400px] border border-slate-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 sonar-beam z-0 opacity-20 pointer-events-none" />
          
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-sky-500/20 z-10 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className="w-[80%] h-[80%] border border-slate-700/50 rounded-full flex items-center justify-center">
                <div className="w-[60%] h-[60%] border border-slate-700/30 rounded-full flex items-center justify-center">
                   <div className="w-[30%] h-[30%] border border-slate-700/20 rounded-full" />
                </div>
             </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 py-2 bg-[var(--bg-card)]/80 border border-[var(--border-main)] backdrop-blur-sm rounded-lg text-[10px] font-mono text-slate-400 uppercase tracking-widest z-20 shadow-sm">
              Live Spatial Mesh // Sector Peak: {telemetry.gateA > 70 ? 'CRITICAL' : 'OPTIMAL'}
            </div>
          </div>
          <div className={`heat-zone top-[20%] left-[30%] w-32 h-32 transition-colors duration-1000 ${isEmergency ? 'bg-rose-500' : 'bg-rose-500/60'}`}></div>
          <div className="heat-zone bottom-[15%] right-[20%] w-48 h-24 bg-sky-400/50"></div>
          <div className="heat-zone top-[40%] right-[40%] w-16 h-16 bg-green-400/30 blur-[40px]"></div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="geometric-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Crowd Movement Trends</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="congestion" stroke="#38bdf8" fillOpacity={1} fill="url(#colorSky)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="geometric-card flex flex-col gap-5 relative overflow-hidden group">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
             
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-serif italic">
                <Map className="w-4 h-4 text-sky-400" />
                Venue Zones Status
             </h3>
             <div className="space-y-4 relative z-10" role="list">
               <ZoneItem label="Gate A (South)" value={telemetry.gateA} />
               <ZoneItem label="Gate B (North)" value={telemetry.gateB} />
               <ZoneItem label="Food Court" value={telemetry.foodCourt} />
               <ZoneItem label="Level 1 Concourse" value={telemetry.concourseLevel1} />
               <ZoneItem label="Parking Zone C" value={telemetry.parkingZoneC} />
             </div>
          </div>
        </div>

        {/* Real-time Incident Feed */}
        <div className="geometric-card">
           <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-serif italic">Live Incident Feed</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Encrypted Log // RC-12</span>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-live="polite">
             {isEmergency && (
               <IncidentItem type="critical" time="now" zone="GLOBAL" msg="DELTA-7 PROTOCOL ENGAGED. COORDINATING NEURAL BYPASS." />
             )}
             <IncidentItem type="critical" time="2m ago" zone="Gate B" msg="Abnormal vibration detected on turnstile 14." />
             <IncidentItem type={isEmergency ? 'warning' : 'info'} time="5m ago" zone="Concourse" msg={isEmergency ? "Emergency egress routes highlighted for sector A-4." : "Agent redirected 400 people to Gate A."} />
             <IncidentItem type="warning" time="12m ago" zone="Parking" msg="Parking Zone C reaching 98% capacity." />
           </div>
        </div>
      </div>
    </div>
  );
}
