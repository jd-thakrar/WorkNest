import React, { useState, useEffect } from "react";
import { Play, Coffee, LogOut, Clock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config";
import toast from "react-hot-toast";

const PunchPanel = ({ initialData, onPunchSuccess }) => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: false }));
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const status = initialData?.status || "NOT_STARTED";

  useEffect(() => {
    const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialData?.notes) setNotes(initialData.notes);
  }, [initialData]);

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
        toast.success(result.message, {
           style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
        if (onPunchSuccess) onPunchSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreak = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/employee-self/break`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        }
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message, {
           style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
        if (onPunchSuccess) onPunchSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/employee-self/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        toast.success('Work Log Saved', {
           style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
      }
    } catch (err) {
      toast.error('Failed to save log');
    }
  };

  const isNotStarted = status === "NOT_STARTED" || status === "Ready";
  const isActive = status === "ACTIVE" || status === "Clocked In";
  const isOnBreak = status === "ON_BREAK" || status === "On Break";
  const isCompleted = status === "COMPLETED" || status === "Session Secured";

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm relative overflow-hidden group h-full flex flex-col justify-center">
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 leading-none">System Time</p>
           <h1 className="text-5xl font-bold text-[#042f2e] tracking-tighter tabular-nums leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
             {time}
           </h1>
        </div>

        <div className="w-full space-y-4">
          <button 
            disabled={isProcessing || isCompleted}
            onClick={handlePunch}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 ${
              isActive || isOnBreak ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-[#042f2e] text-white shadow-teal-900/10'
            } ${isCompleted ? 'opacity-30 cursor-not-allowed' : ''} disabled:opacity-50`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              (isActive || isOnBreak) ? <LogOut size={16} /> : <Play fill="currentColor" size={16} />
            )}
            {isCompleted ? 'Shift Completed' : ((isActive || isOnBreak) ? 'Secure Departure' : 'Initialize Entry')}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={handleBreak}
                disabled={!isActive && !isOnBreak || isProcessing}
                className={`flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-100 transition-all font-black text-[9px] uppercase tracking-widest leading-none ${
                   !isActive && !isOnBreak ? 'opacity-30 cursor-not-allowed' : 'text-amber-600'
                } ${isOnBreak ? 'bg-amber-100 border-amber-200 ring-2 ring-amber-100' : ''}`}
             >
                <Coffee size={14} /> {isOnBreak ? 'End Break' : 'Break'}
             </button>
             <button 
                onClick={() => setIsLogModalOpen(true)}
                disabled={isNotStarted}
                className={`flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-teal-50 rounded-2xl border border-slate-100 transition-all font-black text-[9px] uppercase tracking-widest leading-none ${
                   isNotStarted ? 'opacity-30 cursor-not-allowed' : 'text-teal-600'
                }`}
             >
                <Clock size={14} /> Log Entry
             </button>
          </div>
        </div>
      </div>

      {/* Log Entry Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-teal-900/40 backdrop-blur-sm transition-all"
             onClick={() => setIsLogModalOpen(false)}
           />
           
           {/* Modal Body */}
           <div className="bg-white rounded-[40px] w-full max-w-md p-8 relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="mb-6">
                 <h2 
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-2xl font-bold text-[#042f2e] tracking-tight"
                 >
                    Work Log Entry
                 </h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">Qualitative laboratory summary</p>
              </div>

              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your shift activities, technical observations, or milestones achieved..."
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-[13px] font-medium text-[#042f2e] placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 min-h-[200px] resize-none mb-6 shadow-inner"
              />

              <div className="flex gap-3">
                 <button 
                   onClick={() => setIsLogModalOpen(false)}
                   className="flex-1 py-4 bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                     handleSaveNotes();
                     setIsLogModalOpen(false);
                   }}
                   className="flex-1 py-4 bg-[#042f2e] text-[11px] font-black text-white uppercase tracking-widest rounded-2xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all"
                 >
                   Archive Log
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PunchPanel;
