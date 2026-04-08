import React from "react";
import { CheckSquare, Clock, AlertCircle, BarChart3 } from "lucide-react";

const TaskSummaryStrip = ({ stats = {} }) => {
  const summary = [
    { label: "In Progress", value: stats.inProgress || "0", icon: CheckSquare, color: "text-amber-500", detail: "Ongoing" },
    { label: "Hours logged", value: stats.hours || "0h 0m", icon: Clock, color: "text-blue-600", detail: "This Week" },
    { label: "Completed", value: `${stats.completed || 0} / ${stats.all || 0}`, icon: BarChart3, color: "text-emerald-600", detail: "Monthly" },
    { label: "Overdue", value: stats.overdue || "0", icon: AlertCircle, color: "text-rose-500", detail: "Attention" },
  ];

  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden">
      {summary.map((stat, i) => (
        <div 
          key={i}
          className="flex-1 flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors cursor-default"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-[#042f2e] tracking-tight">{stat.value}</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{stat.detail}</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center ${stat.color} shadow-sm hidden sm:flex`}>
             <stat.icon size={18} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskSummaryStrip;
