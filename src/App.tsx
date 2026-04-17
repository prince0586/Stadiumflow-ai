import React, { useState, useEffect, useRef } from "react";
import { 
  Building2 as Stadium,
  Users, 
  ShieldAlert, 
  AlertCircle,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StadiumAgents, VenueTelemetry } from "./lib/agents";
import { generateMockTelemetry, generateHistoricalData } from "./lib/mockData";
import { FanView } from "./components/FanView";
import { StaffView } from "./components/StaffView";
import { AppRole } from "./types";

export default function App() {
  const [role, setRole] = useState<AppRole>("fan");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [telemetry, setTelemetry] = useState<VenueTelemetry>(generateMockTelemetry());
  const [historicalData] = useState(generateHistoricalData(30));
  const agentsRef = useRef<StadiumAgents | null>(null);

  // Initialize agents
  useEffect(() => {
    agentsRef.current = new StadiumAgents();
    // Initialize theme from document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Poll for telemetry updates (Simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(generateMockTelemetry());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-1000 ${role === 'staff' && telemetry.gateA > 80 ? 'bg-slate-950' : 'bg-[var(--bg-main)]'} text-[var(--text-main)] selection:bg-sky-500/30 architectural-grid ${theme === 'dark' && role === 'staff' && telemetry.gateA > 85 ? 'delta-vignette' : ''}`}>
      
      {/* API Diagnostics Banner */}
      {!process.env.GEMINI_API_KEY && (
        <div className="bg-rose-500 text-white text-[10px] py-1 px-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 z-[100]">
          <AlertCircle className="w-3 h-3" />
          Neural Link Offline // Please provide GEMINI_API_KEY in platform settings for active coordination
          <AlertCircle className="w-3 h-3" />
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 sticky top-0">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 group-hover:bg-sky-500/20 transition-all duration-500">
            <Stadium className="w-6 h-6 text-sky-400 group-hover:scale-110" />
          </div>
          <div className="border-l border-[var(--border-main)] pl-4">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
              STADIUM<span className="text-sky-400">FLOW</span>
              <span className="text-[10px] font-serif italic text-slate-500 lowercase opacity-60 ml-1">Command v3.1</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5" role="status">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${process.env.GEMINI_API_KEY ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                {process.env.GEMINI_API_KEY ? 'Neural Link: Secure' : 'Neural Link: Bypass Mode'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 p-1 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-main)]/50" role="tablist">
          <button
            onClick={() => setRole("fan")}
            role="tab"
            aria-selected={role === "fan"}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${
              role === "fan" 
                ? "bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]" 
                : "text-slate-500 hover:text-sky-400"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Concierge
          </button>
          <button
            onClick={() => setRole("staff")}
            role="tab" 
            aria-selected={role === "staff"}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${
              role === "staff" 
                ? "bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]" 
                : "text-slate-500 hover:text-sky-400"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Command
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-slate-400 hover:text-sky-400 transition-all shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[10px] font-mono text-slate-500 leading-none">VEN_LOC_DATA</span>
            <span className="text-[11px] font-bold text-[var(--text-main)] leading-tight">19:42:08</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-tight">3 Live Incidents</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {role === "fan" ? (
            <motion.div 
              key="fan" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0"
            >
              <FanView agents={agentsRef.current} telemetry={telemetry} />
            </motion.div>
          ) : (
            <motion.div 
              key="staff" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0"
            >
              <StaffView 
                agents={agentsRef.current} 
                telemetry={telemetry} 
                historicalData={historicalData} 
                theme={theme} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="h-8 border-t border-[var(--border-main)] bg-[var(--bg-card)] px-6 flex items-center justify-between pointer-events-none">
         <span className="text-[10px] text-slate-500 font-mono italic">
           © 2024 StadiumFlow Spatial Intelligence. All telemetry is localized.
         </span>
         <span className="text-[10px] text-slate-500 font-mono">
           WCAG 2.1 Level AA Compliant
         </span>
      </footer>
    </div>
  );
}
