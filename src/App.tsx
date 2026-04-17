import React, { useState, useEffect, useRef } from "react";
import { 
  Building2 as Stadium,
  Users, 
  ShieldAlert, 
  AlertCircle,
  Sun,
  Moon,
  LogOut,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StadiumAgents, VenueTelemetry } from "./lib/agents";
import { generateHistoricalData } from "./lib/mockData";
import { FanView } from "./components/FanView";
import { StaffView } from "./components/StaffView";
import { AppRole } from "./types";
import { auth, db, signInWithGoogle } from "./lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";

import { initAnalytics, trackTacticalEvent } from "./lib/analytics";

export default function App() {
  const [role, setRole] = useState<AppRole>("fan");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [user, setUser] = useState<User | null>(null);
  const [telemetry, setTelemetry] = useState<VenueTelemetry | null>(null);
  const [historicalData] = useState(generateHistoricalData(30));
  const agentsRef = useRef<StadiumAgents | null>(null);

  // Initialize agents & Auth & Analytics
  useEffect(() => {
    agentsRef.current = new StadiumAgents();
    document.documentElement.setAttribute('data-theme', theme);
    initAnalytics();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) trackTacticalEvent("user_auth_success", { uid: currentUser.uid });
    });
    return () => unsubscribe();
  }, [theme]);

  const handleRoleChange = (newRole: AppRole) => {
    setRole(newRole);
    trackTacticalEvent("role_switch", { role: newRole });
  };

  // Real-time Telemetry Subscription
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "telemetry", "live"), (snapshot) => {
      if (snapshot.exists()) {
        setTelemetry(snapshot.data() as VenueTelemetry);
      } else {
        // Fallback or seed if doc doesn't exist
        const initial = {
          gateA: 45,
          gateB: 20,
          foodCourt: 15,
          concourseLevel1: 30,
          parkingZoneC: 60,
          timestamp: new Date().toISOString()
        };
        setDoc(doc(db, "telemetry", "live"), initial);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = () => signOut(auth);

  if (!telemetry) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Stadium className="w-12 h-12 text-sky-400 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Sychronizing Tactical Mesh...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-1000 ${role === 'staff' && telemetry.gateA > 80 ? 'bg-slate-950' : 'bg-[var(--bg-main)]'} text-[var(--text-main)] selection:bg-sky-500/30 architectural-grid ${theme === 'dark' && role === 'staff' && telemetry.gateA > 85 ? 'delta-vignette' : ''}`}>
      <a href="#tactical-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-500 focus:text-white focus:rounded-lg font-bold uppercase tracking-widest text-[10px]">
        Skip to tactical content
      </a>
      
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
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${user ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                {user ? `Secure: ${user.displayName?.split(' ')[0]}` : 'Neural Link: Bypass Mode'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 p-1 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-main)]/50" role="tablist" aria-label="Role Selection">
          <button
            onClick={() => handleRoleChange("fan")}
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
            onClick={() => handleRoleChange("staff")}
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
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {user ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:scale-105 transition-all"
              aria-label="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5" />
              Auth
            </button>
          )}

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
      <main id="tactical-content" className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {role === "fan" ? (
            <motion.div 
              key="fan" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0"
            >
              <FanView 
                agents={agentsRef.current} 
                telemetry={telemetry} 
                user={user}
              />
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
                user={user}
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
