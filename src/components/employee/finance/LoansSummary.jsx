import React from "react";
import { ShieldCheck, Calendar, ArrowRight, TrendingUp } from "lucide-react";

const LoansSummary = ({ loan }) => {
  if (!loan) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden h-full flex flex-col justify-center items-center text-center py-10">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
          <ShieldCheck size={24} />
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Account Status</p>
        <h3 className="text-[14px] font-bold text-[#042f2e] tracking-tight">No Active Loan Data Feed</h3>
        <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-[200px]">You currently have no active credit or loan obligations.</p>
        
        <button className="mt-6 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 bg-teal-50/50 rounded-lg transition-colors">
           Request New Loan
        </button>
      </div>
    );
  }

  const progress = Math.round(((loan.tenureMonths - loan.remainingMonths) / loan.tenureMonths) * 100);

  return (
    <div className="bg-[#042f2e] p-6 rounded-xl shadow-xl shadow-teal-900/10 text-white relative overflow-hidden group h-full flex flex-col">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-teal-400 border border-white/10 shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest leading-none mb-1.5">Account Status</p>
            <span className="text-[9px] font-black bg-teal-500/20 px-2 py-0.5 rounded text-teal-300 border border-teal-500/20 uppercase tracking-[0.1em]">Active Loan</span>
          </div>
        </div>
        
        <div className="mb-0">
          <p className="text-[10px] font-bold text-teal-400/60 uppercase tracking-widest mb-2 leading-none">Outstanding Balance</p>
          <h2 className="text-3xl font-black tracking-tight mb-2">₹{(loan.remainingMonths * loan.monthlyEMI).toLocaleString('en-IN')}</h2>
          
          <div className="flex items-center gap-1.5 mt-4 group/emi cursor-default">
             <div className="flex items-center gap-1 text-[11px] font-bold text-teal-400/90 tracking-tight">
                <Calendar size={12} strokeWidth={3} /> Next EMI: ₹{loan.monthlyEMI.toLocaleString('en-IN')}
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-teal-400/60 uppercase tracking-widest">Repayment Progress</p>
              <p className="text-[10px] font-black text-white">{progress}%</p>
           </div>
           <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.4)]" style={{ width: `${progress}%` }} />
           </div>
        </div>

        <button className="mt-auto pt-8 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-teal-400 hover:text-white transition-colors group/btn w-fit">
           View Schedule <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-teal-500/20 transition-all duration-700" />
    </div>
  );
};

export default LoansSummary;
