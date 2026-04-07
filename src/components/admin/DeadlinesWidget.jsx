import React from "react";
import { Clock, AlertCircle } from "lucide-react";
import { useGlobal } from "../../context/GlobalContext.jsx";

const DeadlinesWidget = () => {
  const { tasks } = useGlobal();

  const deadlines = React.useMemo(() => {
     const pending = tasks.filter(t => t.status !== 'Completed').sort((a,b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 5);
     if (pending.length === 0) return [];
     
     return pending.map(t => {
        let color, bg, urgency;
        if (t.priority === 'Critical') { color = 'text-rose-600'; bg = 'bg-rose-50'; urgency = 'Critical'; }
        else if (t.priority === 'High') { color = 'text-amber-600'; bg = 'bg-amber-50'; urgency = 'High'; }
        else if (t.status === 'In Progress') { color = 'text-emerald-600'; bg = 'bg-emerald-50'; urgency = 'In Progress'; }
        else { color = 'text-[#042f2e]'; bg = 'bg-gray-100'; urgency = 'Pending'; }

        return {
           title: t.name,
           date: `Due: ${t.endDate}`,
           urgency, color, bg
        };
     });
  }, [tasks]);

  return (
    <div className="space-y-4">
      {deadlines.length > 0 ? deadlines.map((item, i) => (
        <div
          key={i}
          className="bg-gray-50/50 p-5 rounded-[24px] border border-gray-100 flex items-center justify-between group hover:bg-white transition-all shadow-xs"
        >
          <div className="flex items-center gap-4 hover:scale-[1.02] transition-transform w-[70%]">
            <div
              className={`w-2 h-8 rounded-full ${item.bg === "bg-rose-50" ? "bg-rose-500" : item.bg === "bg-amber-50" ? "bg-amber-500" : "bg-emerald-500"}`}
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#042f2e] truncate w-full">{item.title}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={12} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">
                  {item.date}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${item.bg} ${item.color}`}
          >
            {item.urgency}
          </div>
        </div>
      )) : (
         <div className="p-10 text-center space-y-3 border border-dashed border-gray-200 rounded-3xl">
             <AlertCircle size={28} className="mx-auto text-gray-300" />
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Pending Deadlines</p>
         </div>
      )}
    </div>
  );
};

export default DeadlinesWidget;
