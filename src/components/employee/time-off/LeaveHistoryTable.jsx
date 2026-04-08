import React from "react";
import { Check, X, Clock, FileText } from "lucide-react";

const LeaveHistoryTable = ({ history = [] }) => {
  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Period</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Applied</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {history.length === 0 && (
             <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                   No applications in the archives
                </td>
             </tr>
          )}
          {history.map((h, i) => (
            <tr key={h.id || i} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <p className="text-[13px] font-bold text-[#042f2e] tracking-tight">{h.type}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 line-clamp-1">Note: {h.reason}</p>
              </td>
              <td className="px-6 py-5">
                 <span className="text-[12px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                    {h.days} Day{h.days > 1 ? 's' : ''}
                 </span>
              </td>
              <td className="px-6 py-5">
                 <p className="text-[12px] font-bold text-slate-600 tracking-tight">
                    {new Date(h.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(h.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                 </p>
              </td>
              <td className="px-6 py-5">
                 <span className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                    ${h.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (h.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100')}
                 `}>
                    {h.status === 'Approved' ? <Check size={12} strokeWidth={3} /> : (h.status === 'Pending' ? <Clock size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />)}
                    {h.status}
                 </span>
              </td>
              <td className="px-6 py-5 text-right font-bold text-[10px] text-slate-300 uppercase tracking-widest">
                 {h.appliedDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveHistoryTable;
