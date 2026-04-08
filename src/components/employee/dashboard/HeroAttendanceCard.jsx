import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, LogOut, MapPin, Clock, Coffee } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config";
import toast from "react-hot-toast";

const HeroAttendanceCard = ({ data, employee }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState(data?.status || "Ready");
  const [lastPunch, setLastPunch] = useState(data?.lastPunch || "Not Punched");
  const [liveTime, setLiveTime] = useState(data?.timer || "00:00:00");
  const [isProcessing, setIsProcessing] = useState(false);

  const isClockedIn = ["Clocked In", "Late", "Present", "ACTIVE"].includes(status);

  useEffect(() => {
    let interval;
    if (isClockedIn && status !== "ON_BREAK") {
      interval = setInterval(() => {
        setLiveTime(prev => {
          if (!prev) return "00:00:00";
          const parts = prev.split(':');
          if (parts.length < 3) return "00:00:00";
          
          const [h, m, s] = parts.map(Number);
          let newS = s + 1;
          let newM = m || 0;
          let newH = h || 0;
          if (newS >= 60) { newS = 0; newM += 1; }
          if (newM >= 60) { newM = 0; newH += 1; }
          return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS).padStart(2, '0')}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, isClockedIn]);

  const handlePunch = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/employee-self/punch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        }
      });
      const result = await res.json();
      if (res.ok) {
        setStatus(result.status);
        setLastPunch(result.lastPunch);
        if (result.status === 'Ready') {
           setLiveTime(result.timer);
        }
        toast.success(result.status === 'Clocked In' ? 'Session Activated' : 'Session Secured', {
          style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200/60 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/[0.03] blur-3xl -mr-32 -mt-32" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="space-y-6 flex-1">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mb-2">Command Center</p>
            <h1 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-4xl md:text-5xl font-bold text-[#042f2e] tracking-tight"
            >
               Good Morning, <span className="text-teal-600 font-bold">{employee?.firstName || 'User'}</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-8">
             <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-black text-[#042f2e] uppercase tracking-widest leading-none">{status}</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <MapPin size={14} className="text-teal-500" /> {data?.mode || 'Office'}
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Clock size={14} className="text-slate-300" /> Last Punch: {lastPunch}
             </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-8 lg:bg-white lg:p-4 rounded-[32px] lg:border lg:border-slate-100 lg:shadow-inner">
           <div className="text-center sm:text-right min-w-[140px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Timer</p>
              <h2 className="text-5xl font-bold text-[#042f2e] tabular-nums tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{liveTime}</h2>
           </div>

           <div className="flex gap-3 w-full sm:w-auto">
             <motion.button 
               whileHover={{ y: -4, scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               disabled={isProcessing}
               onClick={handlePunch}
               className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl ${
                 isClockedIn 
                 ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600' 
                 : 'bg-[#042f2e] text-white shadow-teal-900/10 hover:bg-slate-900'
               } disabled:opacity-50`}
             >
               {isProcessing ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 isClockedIn ? <LogOut size={16} /> : <Play size={16} fill="currentColor" />
               )}
               {isClockedIn ? 'Secure System' : 'Launch Session'}
             </motion.button>
             
             <button className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-500 group rounded-[22px] transition-all shadow-sm">
                <Coffee size={24} className="group-hover:scale-110 transition-transform" />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroAttendanceCard;
