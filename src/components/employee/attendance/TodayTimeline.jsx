import React from "react";
import { MousePointer2, Coffee, LogOut } from "lucide-react";

const TodayTimeline = ({ record }) => {
  const activities = [];

  // 1. Entry
  if (record?.checkIn) {
    activities.push({ 
      time: record.checkIn, 
      event: "Punch In", 
      icon: MousePointer2, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50" 
    });
  }

  // 2. Breaks
  record?.breaks?.forEach((b, idx) => {
    activities.push({ 
      time: b.start, 
      event: `Break Start ${record.breaks.length > 1 ? idx + 1 : ''}`, 
      icon: Coffee, 
      color: "text-amber-500", 
      bg: "bg-amber-50" 
    });
    if (b.end) {
      activities.push({ 
        time: b.end, 
        event: `Break End ${record.breaks.length > 1 ? idx + 1 : ''}`, 
        icon: MousePointer2, 
        color: "text-teal-500", 
        bg: "bg-teal-50" 
      });
    }
  });

  // 3. Departure or Placeholder
  activities.push({ 
    time: record?.checkOut || "--:--", 
    event: "Punch Out", 
    icon: LogOut, 
    color: record?.checkOut ? "text-rose-500" : "text-slate-300", 
    bg: record?.checkOut ? "bg-rose-50" : "bg-slate-50", 
    pending: !record?.checkOut 
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
             <h4 
               style={{ fontFamily: "'Outfit', sans-serif" }}
               className="text-lg font-bold text-[#042f2e] tracking-tight"
             >
               Daily Log
             </h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Activity Stream</p>
          </div>
        </div>
        
        <div className="space-y-0 relative ml-2">
          <div className="absolute left-[15px] top-2 bottom-6 w-px bg-slate-100" />
          
          {activities.map((act, i) => (
            <div key={i} className="relative flex items-start gap-4 pb-6 last:pb-0 group">
               <div className={`shrink-0 w-8 h-8 rounded-lg ${act.bg} flex items-center justify-center ${act.color} relative z-10 border-2 border-white shadow-sm transition-transform group-hover:scale-110`}>
                  <act.icon size={14} />
               </div>
               
               <div className={`${act.pending ? 'opacity-40' : 'opacity-100'} transition-opacity pt-1`}>
                 <p className="text-[12px] font-bold text-[#042f2e] leading-none mb-1.5">{act.event}</p>
                 <p className="text-[10px] font-bold text-slate-400 tabular-nums uppercase tracking-widest leading-none">
                    {act.time}
                 </p>
               </div>
            </div>
          ))}

          {record?.notes && (
             <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 italic">
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                  "{record.notes}"
                </p>
             </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Time</p>
         <p className="text-[13px] font-bold text-[#042f2e] tabular-nums">{record?.workedHours || "00h 00m"}</p>
      </div>
    </div>
  );
};

export default TodayTimeline;
