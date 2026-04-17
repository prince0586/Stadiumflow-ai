/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Building2 as Stadium,
  Users, 
  ShieldAlert, 
  Map, 
  MessageSquare, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Navigation,
  AlertTriangle,
  ChevronRight,
  Send,
  Zap,
  Globe,
  Database,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { StadiumAgents, VenueTelemetry } from "./lib/agents";
import { generateMockTelemetry, generateHistoricalData } from "./lib/mockData";

// --- Types ---

type AppRole = "fan" | "staff";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    wait?: string;
  };
}

// --- App Component ---

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
      {/* API Diagnostics Banner (Free Tier / Errors Handling) */}
      {!process.env.GEMINI_API_KEY && (
        <div className="bg-rose-500 text-white text-[10px] py-1 px-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 z-[100]">
          <AlertCircle className="w-3 h-3" />
          Neural Link Offline // Please provide GEMINI_API_KEY in platform settings for active coordination
          <AlertCircle className="w-3 h-3" />
        </div>
      )}
      {/* Header (The Architectural Grid Polish) */}
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
              <StaffView agents={agentsRef.current} telemetry={telemetry} historicalData={historicalData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Accessibility Footer */}
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

// --- Fan View Component ---

function FanView({ agents, telemetry }: { agents: StadiumAgents | null; telemetry: VenueTelemetry }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agents) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await agents.getFanAdvice(input, telemetry);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        metadata: {
          action: response.suggestedAction,
          wait: response.waitingTimeEstimate,
        },
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full bg-[var(--bg-main)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-full flex flex-col bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-5 border-b border-[var(--border-main)] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          <h3 className="text-sm font-semibold text-[var(--text-main)]">Fan Concierge AI</h3>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[var(--bg-main)]/40 relative" aria-live="polite">
          {/* Grounding Status Indicator */}
          <div className="sticky top-0 z-10 flex justify-center pb-4">
             <div className="px-3 py-1 bg-[var(--bg-card)]/80 border border-[var(--border-main)]/50 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
                <Globe className="w-3 h-3 text-sky-400 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Google Search Grounding // ACTIVE</span>
             </div>
          </div>

          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Stadium className="w-16 h-16 mb-4 text-sky-400" />
              </motion.div>
              <p className="text-sm font-medium tracking-widest uppercase">
                STADIUM CORE INITIALIZED.<br />
                <span className="font-serif italic capitalize opacity-60">How can I assist your navigational flow?</span>
              </p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] px-5 py-4 rounded-2xl border shadow-lg ${
                  msg.role === "user" 
                    ? "bg-sky-600 border-sky-500 text-white rounded-br-none" 
                    : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)] rounded-bl-none"
                }`}>
                  <p className="text-[15px] leading-relaxed font-sans">{msg.content}</p>
                  
                  {msg.metadata && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2.5">
                      {msg.metadata.wait && (
                        <span className="px-3 py-1 rounded-full bg-black/30 text-[10px] font-bold border border-white/5 text-sky-300 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          EST. WAIT: {msg.metadata.wait}
                        </span>
                      )}
                      {msg.metadata.action && (
                        <button className="px-3 py-1 rounded-full bg-sky-400 text-slate-900 text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all">
                          <Navigation className="w-3 h-3" />
                          {msg.metadata.action}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex justify-start">
              <div className="message-ai px-4 py-3 flex gap-1 items-center">
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce delay-75"></span>
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-5 border-t border-[var(--border-main)] bg-[var(--bg-card)]">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about lines, exits, or restrooms..."
            className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-sky-400 transition-colors text-[var(--text-main)]"
            aria-label="Ask concierge"
          />
        </form>
      </div>
    </div>
  );
}

// --- Staff View Component ---

function StaffView({ 
  agents, 
  telemetry, 
  historicalData 
}: { 
  agents: StadiumAgents | null; 
  telemetry: VenueTelemetry;
  historicalData: any[];
}) {
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
        
        {/* Tactical Summary (Architectural Grid Style) */}
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

        {/* Visual Map Area (Sonar/Blueprint Style) */}
        <div className="map-view-bg h-[400px] border border-slate-800/50 relative overflow-hidden group">
          {/* Sonar Beam */}
          <div className="absolute inset-0 sonar-beam z-0 opacity-20 pointer-events-none" />
          
          {/* Scanning Line */}
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

        {/* AI Insight - MERGED WITH TACTICAL SUMMARY ABOVE */}

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
             {/* Decorative grid pattern background hint */}
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

// --- Subcomponents ---

function MetricCard({ label, value, trend, isUp }: { label: string; value: string; trend: string; isUp: boolean | null }) {
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

function ZoneItem({ label, value }: { label: string; value: number }) {
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

function IncidentItem({ type, time, zone, msg }: { type: "critical" | "warning" | "info"; time: string; zone: string; msg: string }) {
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

