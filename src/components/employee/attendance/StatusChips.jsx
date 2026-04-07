import React from "react";
import { Clock, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

const StatusChips = ({ history }) => {
  const todayRecord = history?.find(r => r.date === new Date().toISOString().split('T')[0]);
  const presentDays = history?.filter(r => r.status === 'Present').length || 0;
  const lateDays = history?.filter(r => r.status === 'Late').length || 0;
  const totalDays = history?.length || 0;

  const stats = [
    {
      label: "Check In",
      value: todayRecord?.checkIn || "--:--",
      icon: Clock,
      color: "text-teal-600",
      detail: todayRecord ? "Active" : "Pending",
    },
    {
      label: "Working Hr",
      value: "00h 00m", // Placeholder for actual calc
      icon: BarChart3,
      color: "text-blue-600",
      detail: "Target: 8h",
    },
    {
      label: "Present",
      value: `${presentDays} / ${totalDays || 30}`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      detail: "Days",
    },
    {
      label: "Late Days",
      value: `${lateDays} Delay`,
      icon: AlertCircle,
      color: "text-rose-500",
      detail: "Monthly",
    },
  ];

  return (
    <div className="flex-1 grid grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden border-l border-slate-100">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors cursor-default ${i < 2 ? "border-t-0" : ""} ${i % 2 === 0 ? "border-l-0" : ""}`}
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-[#042f2e]">
                {stat.value}
              </h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                {stat.detail}
              </span>
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center ${stat.color} shadow-sm hidden sm:flex`}
          >
            <stat.icon size={18} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusChips;
