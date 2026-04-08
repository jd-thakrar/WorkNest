import React from "react";
import { Check, X, Clock, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { API_URL } from "../../../config";

const ClaimsHistory = ({ claims = [] }) => {
  if (!claims || claims.length === 0) {
     return (
        <div className="p-10 text-center space-y-3 bg-slate-50 border-t border-slate-100">
            <AlertCircle size={32} className="mx-auto text-slate-300" />
            <p className="text-[12px] font-black uppercase tracking-widest text-slate-400">No Claims on Record</p>
        </div>
     );
  }

  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID & Category</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
             <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {claims.map((claim) => (
            <tr key={claim._id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 text-[10px] font-black">
                       {claim._id.substring(claim._id.length - 4).toUpperCase()}
                    </div>
                    <div>
                       <p className="text-[13px] font-bold text-[#042f2e] tracking-tight">{claim.description || claim.type || 'Expense'}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reimbursement</p>
                    </div>
                 </div>
              </td>
              <td className="px-6 py-5">
                 <span className="text-[14px] font-black text-[#042f2e]">
                    ₹{claim.amount.toLocaleString('en-IN')}
                 </span>
              </td>
              <td className="px-6 py-5 text-slate-600 font-bold text-[12px]">
                 {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="px-6 py-5">
                 <span className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                    ${claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      claim.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-rose-50 text-rose-600 border-rose-100'}
                 `}>
                    {claim.status === 'Approved' ? <Check size={12} strokeWidth={3} /> : 
                     claim.status === 'Pending' ? <Clock size={12} strokeWidth={3} /> : 
                     <X size={12} strokeWidth={3} />}
                    {claim.status}
                 </span>
              </td>
              <td className="px-6 py-5 text-right">
                 {claim.receipt ? (
                    <a href={`${API_URL.replace('/api', '')}/uploads/${claim.receipt}`} target="_blank" rel="noreferrer" className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 text-teal-600 hover:bg-teal-50 hover:text-teal-700 transition-all border border-transparent hover:border-teal-100">
                       <FileText size={16} />
                    </a>
                 ) : (
                    <span className="text-gray-300">-</span>
                 )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClaimsHistory;
