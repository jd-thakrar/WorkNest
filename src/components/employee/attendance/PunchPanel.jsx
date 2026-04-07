import React, { useState, useEffect } from "react";
import { Play, Coffee, LogOut, Clock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config";
import toast from "react-hot-toast";

const PunchPanel = ({ initialData, onPunchSuccess }) => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: false }));
  const [isProcessing, setIsProcessing] = useState(false);
  const status = initialData?.status || "Ready";

  useEffect(() => {
    const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        toast.success(result.status === 'Clocked In' ? 'Entry Logged' : 'Departure Logged', {
           style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
        if (onPunchSuccess) onPunchSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const isClockedIn = status === "Clocked In";

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm relative overflow-hidden group h-full flex flex-col justify-center">
      <div className="flex flex-col items-center text-center space-y-8">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 leading-none">System Time</p>
           <h1 className="text-5xl font-bold text-[#042f2e] tracking-tighter tabular-nums leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
             {time}
           </h1>
        </div>

        <div className="w-full space-y-4">
          <button 
            disabled={isProcessing}
            onClick={handlePunch}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 ${
              isClockedIn ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-[#042f2e] text-white shadow-teal-900/10'
            } disabled:opacity-50`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isClockedIn ? <LogOut size={16} /> : <Play fill="currentColor" size={16} />
            )}
            {isClockedIn ? 'Secure Departure' : 'Initialize Entry'}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
             <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-amber-50 text-amber-600 rounded-2xl border border-slate-100 transition-all font-black text-[9px] uppercase tracking-widest leading-none">
                <Coffee size={14} /> Break
             </button>
             <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100 transition-all font-black text-[9px] uppercase tracking-widest cursor-not-allowed leading-none">
                <Clock size={14} /> Logs
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunchPanel;
