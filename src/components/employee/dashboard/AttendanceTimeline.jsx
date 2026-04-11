import React from "react";
import { CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react";

const AttendanceTimeline = ({ attendance }) => {
  const status = attendance?.weeklyStatus || [];
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-lg font-bold text-[#042f2e] tracking-tight"
          >
            Weekly Pulse
          </h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Presence Overview
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Present
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Leave
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Late
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 px-1">
        {status.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">
              {item.day}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                item.status === "present"
                  ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                  : item.status === "late"
                    ? "bg-amber-50 border border-amber-100 text-amber-600"
                    : item.status === "leave"
                      ? "bg-teal-50 border border-teal-100 text-teal-600"
                      : item.status === "today"
                        ? "bg-[#042f2e] text-white shadow-lg shadow-teal-900/10"
                        : "bg-slate-50 border border-slate-100 text-slate-200"
              }`}
            >
              {item.status === "present" && <CheckCircle2 size={14} />}
              {item.status === "late" && <AlertCircle size={14} />}
              {item.status === "leave" && <Calendar size={14} />}
              {item.status === "today" && <Clock size={14} />}
              {item.status === "absent" && (
                <div className="w-1 h-1 rounded-full bg-slate-300" />
              )}
            </div>

          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Average Login
        </p>
        <p className="text-[14px] font-black text-[#042f2e]">{attendance?.avgLogin || "09:00 AM"}</p>
      </div>
    </div>
  );
};

export default AttendanceTimeline;
