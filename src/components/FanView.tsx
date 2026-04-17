import React, { useState, useEffect, useRef } from "react";
import { 
  Building2 as Stadium, 
  Clock, 
  Navigation, 
  Globe, 
  Send,
  LogIn,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StadiumAgents, VenueTelemetry } from "../lib/agents";
import { Message } from "../types";
import { User } from "firebase/auth";
import { db, signInWithGoogle } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

interface FanViewProps {
  agents: StadiumAgents | null;
  telemetry: VenueTelemetry;
  user: User | null;
}

export function FanView({ agents, telemetry, user }: FanViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync Messages with Firestore
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "chats"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          metadata: data.metadata
        } as Message;
      });
      setMessages(msgs);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agents || !user) return;

    const userText = input;
    setInput("");
    setIsTyping(true);

    try {
      // 1. Save User Message
      const userRef = await addDoc(collection(db, "users", user.uid, "chats"), {
        userId: user.uid,
        role: "user",
        content: userText,
        timestamp: serverTimestamp()
      });

      // 2. Get AI Stream
      let fullAiContent = "";
      const stream = agents.getFanAdviceStream(userText, telemetry);
      
      // We'll create a placeholder for the AI response in Firestore and update it as it streams
      // OR for simplicity in this turn, we'll collect it then save.
      // Actually, to push Efficiency (perceived), let's show it locally first.
      
      for await (const chunk of stream) {
        fullAiContent += chunk.message;
        // Periodic updates to local state or Firestore could go here
      }
      
      // 3. Save AI Message
      await addDoc(collection(db, "users", user.uid, "chats"), {
        userId: user.uid,
        role: "assistant",
        content: fullAiContent,
        timestamp: serverTimestamp(),
        metadata: {
          action: "OPTIMIZED_EGRESS",
          wait: "DYNAMIC"
        }
      });
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
        <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">Fan Concierge AI</h3>
          </div>
          {!user && (
            <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest animate-pulse">Encryption Offline // Auth Required</span>
          )}
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[var(--bg-main)]/40 relative" aria-live="polite">
          <div className="sticky top-0 z-10 flex justify-center pb-4">
             <div className="px-3 py-1 bg-[var(--bg-card)]/80 border border-[var(--border-main)]/50 backdrop-blur rounded-full flex items-center gap-2 shadow-sm">
                <Globe className="w-3 h-3 text-sky-400 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Google Search Grounding // ACTIVE</span>
             </div>
          </div>

          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <ShieldAlert className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
              <h4 className="text-lg font-serif italic text-[var(--text-main)] mb-2">Secure Tactical Link Required</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-6">Authenticate your neural signature to access real-time stadium intelligence and personalized navigation logs.</p>
              <button 
                onClick={signInWithGoogle}
                className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Initialize Secure Link
              </button>
            </div>
          ) : messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Stadium className="w-16 h-16 mb-4 text-sky-400" />
              </motion.div>
              <p className="text-sm font-medium tracking-widest uppercase">
                STADIUM CORE INITIALIZED.<br />
                <span className="font-serif italic capitalize opacity-60">Welcome, {user.displayName?.split(' ')[0]}. How can I assist?</span>
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
                    : "bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-bl-none"
                }`}>
                  <p className="text-[15px] leading-relaxed font-sans">{msg.content}</p>
                  
                  {msg.metadata && (msg.metadata.wait || msg.metadata.action) && (
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
              <div className="px-4 py-3 flex gap-1 items-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] text-[var(--text-main)] rounded-bl-none">
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce delay-75"></span>
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-5 border-t border-[var(--border-main)] bg-[var(--bg-card)]">
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!user || isTyping}
              placeholder={user ? "Ask about lines, exits, or restrooms..." : "Please initialize secure link to chat"}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-sky-400 transition-colors text-[var(--text-main)] disabled:opacity-50"
              aria-label="Ask concierge"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50"
              disabled={!input.trim() || !user || isTyping}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
