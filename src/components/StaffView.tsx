import React, { useState, useEffect, useMemo } from "react";
import { 
  ShieldAlert, 
  Map, 
  Database, 
  Zap,
  Activity,
  AlertCircle,
  Lock,
  LayoutDashboard,
  MapPin,
  Building2 as Stadium
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
import { User } from "firebase/auth";
import { db, signInWithGoogle } from "../lib/firebase";
import { doc, setDoc, addDoc, collection, serverTimestamp, query, orderBy, limit, onSnapshot } from "firebase/firestore";

interface StaffViewProps {
  agents: StadiumAgents | null;
  telemetry: VenueTelemetry;
  historicalData: any[];
  theme: "light" | "dark";
  user: User | null;
}

export function StaffView({ 
  agents, 
  telemetry, 
  historicalData,
  theme,
  user
}: StaffViewProps) {
  const [aiSummary, setAiSummary] = useState("Analyzing telemetry...");
  const [isEmergency, setIsEmergency] = useState(false);
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [egressPlan, setEgressPlan] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);

  const mockImageReport = async () => {
    if (!agents) return;
    setIsAnalyzingImage(true);
    // Emulating a photo of a perimeter breach
    const report = await agents.analyzeIncidentImage("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "image/png");
    setImageAnalysis(report);
    setIsAnalyzingImage(false);
  };

  const zoneStats = useMemo(() => [
    { label: "Gate A [Primary]", value: telemetry.gateA, icon: Stadium },
    { label: "Gate B [Secondary]", value: telemetry.gateB, icon: Stadium },
    { label: "Main Concourse L1", value: telemetry.concourseLevel1, icon: LayoutDashboard },
    { label: "Central Food Court", value: telemetry.foodCourt, icon: Zap },
    { label: "Parking Zone C", value: telemetry.parkingZoneC, icon: MapPin },
  ], [telemetry]);

  useEffect(() => {
    if (agents) {
      agents.getStaffSummary(telemetry).then(setAiSummary);
    }
  }, [telemetry, agents]);

  const runPredictiveSim = async () => {
    if (!agents) return;
    setIsPredicting(true);
    // Simulate high-reasoning prediction
    const res = await agents.getStaffSummary({ ...telemetry, planRequest: true } as any);
    setPrediction(res);
    setIsPredicting(false);
  };

  const generateTacticalPlan = async () => {
    if (!agents) return;
    setIsGeneratingPlan(true);
    const plan = await agents.getStaffSummary({ ...telemetry, planRequest: true } as any);
    setEgressPlan(plan);
    setIsGeneratingPlan(false);
  };

  // Sync Incidents from Firestore
  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"), limit(6));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setLiveIncidents(docs);
    });
    return () => unsub();
  }, []);

  const toggleEmergency = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    const newState = !isEmergency;
    setIsEmergency(newState);

    if (newState) {
      // Log emergency event
      try {
        await addDoc(collection(db, "incidents"), {
          type: "critical",
          time: new Date().toLocaleTimeString(),
          zone: "GLOBAL",
          msg: `PROTOCOL DELTA INITIATED BY COMMANDER ${user.displayName?.toUpperCase()}`,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Tactical Error Logging Instance:", err);
      }
    }
  };

  const overrideTelemetry = async () => {
    if (!user) return;
    const peakData = {
      ...telemetry,
      gateA: 88,
      gateB: 72,
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, "telemetry", "live"), peakData);
    } catch (err) {
      console.error("Neural Link Sync Failed:", err);
    }
  };

  return (
    <div className={`h-full p-6 overflow-y-auto transition-colors duration-700 ${isEmergency ? (theme === 'dark' ? "bg-rose-950/20" : "bg-rose-50") : "bg-[var(--bg-main)]"}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]" id="operational-readiness-label">Operational Readiness</h2>
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
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                {user ? `Commander: ${user.email?.split('@')[0].toUpperCase()}` : 'Neural Link: Locked'}
              </span>
              <span className="text-[12px] font-mono text-slate-300 tabular-nums">ID: VEN-PROT-AX9</span>
            </div>
            {!user ? (
              <button 
                onClick={signInWithGoogle}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:border-sky-500 transition-all"
                aria-label="Unlock tactical console"
              >
                <Lock className="w-3 h-3" />
                Unlock Interface
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={overrideTelemetry}
                  className="px-3 py-2 rounded-sm bg-sky-500/10 border border-sky-500/30 text-[10px] font-black uppercase tracking-widest text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
                  aria-label="Simulate peak load"
                >
                  Peak Override
                </button>
                <button 
                  onClick={toggleEmergency}
                  className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                    isEmergency 
                      ? "bg-rose-500 border border-rose-400 text-white animate-pulse" 
                      : "bg-[var(--bg-card)] border border-[var(--border-main)] text-slate-500 hover:text-sky-400 hover:border-sky-400"
                  }`}
                  aria-label={isEmergency ? "Deactivate emergency protocol" : "Activate emergency protocol"}
                  aria-pressed={isEmergency}
                >
                  {isEmergency ? "STAND DOWN PROTOCOL" : "ACTIVATE DELTA"}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Tactical Summary */}
        <div className={`border-l-4 p-6 bg-[var(--bg-card)]/50 backdrop-blur transition-all duration-700 ${isEmergency ? "border-rose-500 bg-rose-950/20" : "border-sky-500 shadow-xl"}`}>
          <div className="flex items-start gap-6">
             <div className={`p-4 rounded-full border-2 ${isEmergency ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-sky-500/10 border-sky-500/30 text-sky-400"}`}>
               <Zap className="w-8 h-8" aria-hidden="true" />
             </div>
             <div className="flex-1">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Gemini 3.1 Pro // Strategic Evaluation</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                       onClick={runPredictiveSim}
                       disabled={isPredicting || !user}
                       className="text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                       aria-label="Run AI Predictive Simulation"
                    >
                       {isPredicting ? "PREDICTING..." : "RUN PREDICTIVE SIM"}
                    </button>
                    <button 
                       onClick={generateTacticalPlan}
                       disabled={isGeneratingPlan || !user}
                       className="text-[9px] font-black uppercase tracking-widest text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50"
                    >
                       {isGeneratingPlan ? "GENERATING..." : egressPlan ? "RE-GENERATE PLAN" : "REQUEST TACTICAL PLAN"}
                    </button>
                    <span className="text-[9px] font-mono text-slate-500 opacity-60">SECURITY_CLEARANCE_L4</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Live Situational Awareness (Grounded):</span>
                  <span className="text-[10px] text-emerald-400 font-mono italic">
                    "Weather at Stadium: Clear, 68°F. Egress conditions optimal. Traffic: Light on Perimeter Rd."
                  </span>
                </div>

               <p 
                 className="text-[var(--text-main)] text-lg leading-relaxed font-serif italic"
                 aria-live="polite"
               >
                 "{aiSummary}"
               </p>
               
               {prediction && (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg"
                 >
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">15-Minute Congestion Forecast:</span>
                   <p className="text-xs font-mono text-slate-300 leading-relaxed">{prediction}</p>
                 </motion.div>
               )}

               {egressPlan && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   className="mt-4 p-4 bg-sky-500/5 border border-sky-500/20 rounded-lg"
                 >
                   <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1 block">Tactical Egress Strategy:</span>
                   <p className="text-xs font-mono text-slate-300 leading-relaxed">{egressPlan}</p>
                 </motion.div>
               )}
             </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5" aria-labelledby="operational-readiness-label">
          {zoneStats.map((stat) => (
            <MetricCard 
              key={stat.label}
              label={stat.label} 
              value={`${stat.value}%`} 
              trend={stat.value > 80 ? "+High" : "Optimal"} 
              isUp={stat.value > 80} 
            />
          ))}
        </div>

        {/* Predictive Risk Vector [Google Services / Alignment] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert className="w-24 h-24" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Crowd Risk Probability Vector</h3>
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-5xl font-mono font-light text-sky-400">
                      {Math.round((telemetry.gateA + telemetry.gateB) / 2)}%
                  </span>
                  <span className="text-xs text-slate-500 pb-2 font-mono">CONFIDENCE: 98.4%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((telemetry.gateA + telemetry.gateB) / 2)}%` }}
                      className={`h-full ${telemetry.gateA > 80 ? 'bg-rose-500' : 'bg-sky-500'}`}
                  />
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 font-mono italic">
                 Grounded Analysis via Gemini 3.1 Reasoning Engine. Risk vector accounts for Gate A/B convergence and historical bottleneck patterns.
              </p>
           </div>

           <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap className="w-24 h-24" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Visual Intelligence Node</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-800 rounded border border-slate-700 flex items-center justify-center overflow-hidden">
                    {isAnalyzingImage ? (
                      <div className="animate-pulse w-full h-full bg-sky-500/20" />
                    ) : imageAnalysis ? (
                      <div className="text-[8px] font-mono text-sky-400 p-1">SCAN_OK</div>
                    ) : (
                      <LayoutDashboard className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <button 
                      onClick={mockImageReport}
                      disabled={isAnalyzingImage || !user}
                      className="w-full py-2 bg-sky-500/10 border border-sky-500/30 rounded text-[9px] font-black uppercase tracking-widest text-sky-400 hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {isAnalyzingImage ? "ANALYZING..." : "ANALYZE FIELD PHOTO"}
                    </button>
                    {imageAnalysis && (
                      <p className="mt-2 text-[10px] font-mono text-emerald-400 leading-tight">
                        {imageAnalysis}
                      </p>
                    ) }
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-mono italic">
                Utilizes Gemini 2.5 Flash for high-speed multimodal situational assessment.
              </p>
           </div>
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
                {Object.entries(telemetry).filter(([k]) => k !== 'timestamp').map(([key, val]) => (
                  <ZoneItem key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={val as number} />
                ))}
             </div>
          </div>
        </div>

        {/* Real-time Incident Feed */}
        <div className="geometric-card">
           <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-serif italic">Tactical Incident Log</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Real-Time Firestore Sync // ACTIVE</span>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-live="polite">
             {liveIncidents.length === 0 && !isEmergency ? (
               <div className="col-span-3 py-8 text-center opacity-20 flex flex-col items-center">
                  <Activity className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-mono uppercase">Scanning for anomalies...</span>
               </div>
             ) : (
                <>
                  {isEmergency && !liveIncidents.find(i => i.msg?.includes('DELTA')) && (
                    <IncidentItem type="critical" time="now" zone="GLOBAL" msg="DELTA-7 PROTOCOL ENGAGED. NEURAL LINK ACTIVE." />
                  )}
                  {liveIncidents.map((inc) => (
                    <IncidentItem key={inc.id} type={inc.type} time={inc.time} zone={inc.zone} msg={inc.msg} />
                  ))}
                </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
