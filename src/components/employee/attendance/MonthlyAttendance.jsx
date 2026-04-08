import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthlyAttendance = ({ history }) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const record = history?.find(r => r.date === dateStr);
    const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
    
    let status = 'Upcoming';
    if (dayOfWeek === 0) status = 'Weekend'; // Sunday Only
    else if (record) status = record.status === 'COMPLETED' || record.status === 'ACTIVE' || record.status === 'ON_BREAK' ? 'Present' : record.status;
    else if (new Date(currentYear, currentMonth, dayNum) < new Date().setHours(0,0,0,0)) status = 'Absent';

    return { day: dayNum, status };
  });

  const weekday = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h4 
             style={{ fontFamily: "'Outfit', sans-serif" }}
             className="text-xl font-bold text-[#042f2e] tracking-tight"
           >
             Aesthetic Attendance Journal
           </h4>
           <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em] leading-none">{monthName}</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handlePrevMonth}
             className="p-2.5 text-slate-400 hover:text-[#042f2e] hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"
           >
              <ChevronLeft size={18} />
           </button>
           <button 
             onClick={handleNextMonth}
             className="p-2.5 text-slate-400 hover:text-[#042f2e] hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"
           >
              <ChevronRight size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-7 gap-y-4 mb-8">
          {weekday.map(w => (
            <div key={w} className="text-[10px] font-black text-slate-300 text-center uppercase tracking-[0.3em] mb-4">{w}</div>
          ))}
          
          {/* Calendar Grid — Leading padding */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`pad-${i}`} className="h-10 invisible" />
          ))}

          {days.map(d => (
            <div key={d.day} className="flex flex-col items-center">
               <div className={`
                w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-bold transition-all relative group cursor-pointer
                ${d.status === 'Present' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-100' : ''}
                ${d.status === 'Absent' ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 shadow-sm shadow-rose-50' : ''}
                ${d.status === 'Late' ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100' : ''}
                ${d.status === 'Weekend' ? 'text-slate-300 bg-slate-50/50' : ''}
                ${d.status === 'Upcoming' ? 'text-slate-400 opacity-40' : ''}
               `}>
                  {d.day}
                  {d.status === 'Absent' && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />}
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center gap-6 justify-center">
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Late
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Holiday
         </div>
      </div>
    </div>
  );
};

export default MonthlyAttendance;
