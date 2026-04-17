/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  ShieldAlert, 
  Map, 
  MessageSquare, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Send
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
  const [telemetry, setTelemetry] = useState<VenueTelemetry>(generateMockTelemetry());
  const [historicalData] = useState(generateHistoricalData(30));
  const agentsRef = useRef<StadiumAgents | null>(null);

  // Initialize agents
  useEffect(() => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      agentsRef.current = new StadiumAgents(apiKey);
    }
  }, []);

  // Poll for telemetry updates (Simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(generateMockTelemetry());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden bg-slate-900 text-slate-50">
      {/* Header (Geometric Balance) */}
      <header className="h-16 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-sky-400 flex items-center justify-center text-slate-900 font-bold">SF</div>
          <h1 className="text-xl font-sans font-semibold tracking-tight">
            Stadium-Flow <span className="text-slate-400 font-normal">Command</span>
          </h1>
        </div>

        <nav className="flex items-center p-1 bg-slate-800/50 rounded-lg border border-slate-700" aria-label="Role selector">
          <button
            onClick={() => setRole("fan")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              role === "fan" ? "bg-sky-400 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
            aria-label="Switch to Fan view"
          >
            Fan Concierge
          </button>
          <button
            onClick={() => setRole("staff")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              role === "staff" ? "bg-sky-400 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
            aria-label="Switch to Staff Command"
          >
            Staff Dashboard
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">3 Live Incidents</span>
          <span className="text-xs text-slate-400 font-mono hidden md:block">19:42 LOCAL TIME</span>
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
      <footer className="h-8 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between pointer-events-none">
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
    <div className="h-full bg-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-full flex flex-col bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-5 border-b border-slate-700 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          <h3 className="text-sm font-semibold text-slate-50">Fan Concierge AI</h3>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-slate-800">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-sm">Welcome to the stadium concierge.<br />Ask about lines, exits, or restrooms.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] px-4 py-3 ${
                msg.role === "user" 
                  ? "message-user" 
                  : "message-ai text-slate-200"
              }`}>
                <p className="text-[15px] leading-relaxed font-sans">{msg.content}</p>
                {msg.metadata && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex flex-wrap gap-2">
                    {msg.metadata.wait && (
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono border border-slate-700 text-sky-400">
                        EST. WAIT: {msg.metadata.wait}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
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
        <form onSubmit={handleSend} className="p-5 border-t border-slate-700 bg-slate-800">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about lines, exits, or restrooms..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-sky-400 transition-colors text-white"
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

  useEffect(() => {
    if (agents) {
      agents.getStaffSummary(telemetry).then(setAiSummary);
    }
  }, [telemetry, agents]);

  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time Telemetry Dashboard</h2>
        
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
        <div className="map-view-bg h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[85%] h-[75%] border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center text-slate-400 text-sm font-medium">
              LIVE HEATMAP: SECTOR DENSITY PEAK
            </div>
          </div>
          <div className="heat-zone top-[20%] left-[30%] w-32 h-32 bg-rose-500"></div>
          <div className="heat-zone bottom-[15%] right-[20%] w-48 h-24 bg-sky-400"></div>
        </div>

        {/* AI Insight */}
        <div className="geometric-card">
           <div className="flex items-center gap-2 mb-3">
             <ShieldAlert className="w-4 h-4 text-sky-400" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Assessment</span>
           </div>
           <p className="text-sm text-slate-200 italic leading-relaxed">
             "{aiSummary}"
           </p>
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

          <div className="geometric-card flex flex-col gap-5">
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Map className="w-4 h-4" />
                Venue Zones Status
             </h3>
             <div className="space-y-4">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Incident Feed</h3>
              <span className="text-[10px] font-mono text-slate-500">ENCRYPTED CHANNEL</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <IncidentItem type="critical" time="2m ago" zone="Gate B" msg="Abnormal vibration detected on turnstile 14." />
             <IncidentItem type="info" time="5m ago" zone="Concourse" msg="Agent redirected 400 people to Gate A." />
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
    <div className="geometric-card">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-bold flex items-baseline gap-2 text-slate-50">
        {value}
        <span className={`text-sm font-semibold transition-colors ${
          isUp === true ? "text-rose-500" : isUp === false ? "text-green-400" : "text-slate-400"
        }`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ZoneItem({ label, value }: { label: string; value: number }) {
  const color = value > 80 ? "bg-rose-500" : value > 50 ? "bg-sky-400" : "bg-green-400";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200">{value}%</span>
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }} 
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

function IncidentItem({ type, time, zone, msg }: { type: "critical" | "warning" | "info"; time: string; zone: string; msg: string }) {
  const borderColor = {
    critical: "border-rose-500/50",
    warning: "border-sky-400/50",
    info: "border-slate-700"
  };

  const iconColor = {
    critical: "text-rose-500",
    warning: "text-sky-400",
    info: "text-slate-400"
  };

  return (
    <div className={`p-4 rounded-xl border bg-slate-900/50 flex gap-4 items-start ${borderColor[type]}`}>
      <div className={`mt-1 flex-shrink-0 ${iconColor[type]}`}>
        <AlertCircle className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{zone}</span>
          <span className="text-[10px] font-mono text-slate-500">{time}</span>
        </div>
        <p className="text-xs font-semibold text-slate-200 leading-normal">{msg}</p>
      </div>
    </div>
  );
}

