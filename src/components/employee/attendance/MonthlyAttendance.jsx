import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthlyAttendance = ({ history }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const record = history?.find(r => r.date === dateStr);
    const dayOfWeek = new Date(year, month, dayNum).getDay();
    
    let status = 'Upcoming';
    if (dayOfWeek === 0 || dayOfWeek === 6) status = 'Weekend';
    else if (record) status = record.status; // 'Present', 'Late', etc.
    else if (dayNum < today.getDate()) status = 'Absent';

    return { day: dayNum, status };
  });

  const weekday = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h4 
             style={{ fontFamily: "'Outfit', sans-serif" }}
             className="text-lg font-bold text-[#042f2e] tracking-tight"
           >
             Monthly Attendance Log
           </h4>
           <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">March 2026 • 20 Working Days</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-400 hover:text-[#042f2e] hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
              <ChevronLeft size={18} />
           </button>
           <button className="p-2 text-slate-400 hover:text-[#042f2e] hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
              <ChevronRight size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-7 gap-y-4 mb-8">
          {weekday.map(w => (
            <div key={w} className="text-[11px] font-bold text-slate-300 text-center uppercase tracking-[0.2em] mb-4">{w}</div>
          ))}
          
          {/* Calendar Grid */}
          <div className="h-10 invisible" /> {/* Placeholder */}
          {days.map(d => (
            <div key={d.day} className="flex flex-col items-center">
               <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold transition-all relative group cursor-pointer
                ${d.status === 'Present' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-100' : ''}
                ${d.status === 'Absent' ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100' : ''}
                ${d.status === 'Late' ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100' : ''}
                ${d.status === 'Weekend' ? 'text-slate-300 hover:bg-slate-50' : ''}
                ${d.status === 'Upcoming' ? 'text-slate-400 hover:bg-white border border-transparent hover:border-slate-100' : ''}
               `}>
                  {d.day}
                  {d.status === 'Absent' && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />}
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center gap-6 justify-center">
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded bg-emerald-500" /> Present
         </div>
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded bg-rose-500" /> Absent
         </div>
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded bg-amber-400" /> Late
         </div>
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded bg-slate-100" /> Holiday / Off
         </div>
      </div>
    </div>
  );
};

export default MonthlyAttendance;
