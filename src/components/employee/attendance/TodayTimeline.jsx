import React from "react";
import { MousePointer2, Coffee, LogOut } from "lucide-react";

const TodayTimeline = ({ record }) => {
  const activities = [
    { time: record?.checkIn || "--:--", event: "Punch In", icon: MousePointer2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { time: "--:--", event: "Break Start", icon: Coffee, color: "text-amber-500", bg: "bg-amber-50", pending: true },
    { time: "--:--", event: "Break End", icon: MousePointer2, color: "text-teal-500", bg: "bg-teal-50", pending: true },
    { time: record?.checkOut || "--:--", event: "Punch Out", icon: LogOut, color: record?.checkOut ? "text-rose-500" : "text-slate-300", bg: record?.checkOut ? "bg-rose-50" : "bg-slate-50", pending: !record?.checkOut },
  ];

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
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Time</p>
         <p className="text-[13px] font-bold text-[#042f2e] tabular-nums">06h 45m</p>
      </div>
    </div>
  );
};

export default TodayTimeline;
