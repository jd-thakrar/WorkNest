import React from "react";
import { CreditCard, ShieldCheck, Wallet, Landmark, Hash } from "lucide-react";

const BankDetails = ({ employee }) => {
  const maskAccount = (num) => {
    if (!num) return "Not Provided";
    return `**** **** ${num.slice(-4)}`;
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#042f2e] flex items-center justify-center text-teal-400">
               <CreditCard size={20} />
            </div>
            <div>
               <h4 className="text-lg font-black text-[#042f2e] tracking-tight uppercase">Settlement Engine</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Payroll & Bank Records</p>
            </div>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
            <ShieldCheck size={12} /> Verified Account
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
         <div className="space-y-2 group/field">
            <div className="flex items-center gap-2 mb-1">
               <Landmark size={12} className="text-slate-300 group-focus-within/field:text-teal-500" />
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
            </div>
            <input 
               type="text" 
               defaultValue={employee?.bankName || "Not Provided"} 
               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-[13px] font-bold text-[#042f2e] focus:border-[#042f2e] transition-all outline-none" 
               readOnly
            />
         </div>
         
         <div className="space-y-2 group/field">
            <div className="flex items-center gap-2 mb-1">
               <Wallet size={12} className="text-slate-300 group-focus-within/field:text-teal-500" />
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Holder</label>
            </div>
            <input 
               type="text" 
               defaultValue={employee?.accountHolder || `${employee?.firstName} ${employee?.lastName}` || "Unknown"} 
               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-[13px] font-bold text-[#042f2e] focus:border-[#042f2e] transition-all outline-none" 
               readOnly
            />
         </div>

         <div className="space-y-2 group/field">
            <div className="flex items-center gap-2 mb-1">
               <Hash size={12} className="text-slate-300 group-focus-within/field:text-teal-500" />
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
            </div>
            <input 
               type="text" 
               defaultValue={maskAccount(employee?.accountNumber)} 
               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-[13px] font-bold text-[#042f2e] focus:border-[#042f2e] transition-all outline-none" 
               readOnly
            />
         </div>

         <div className="space-y-2 group/field">
            <div className="flex items-center gap-2 mb-1">
               <Hash size={12} className="text-slate-300 group-focus-within/field:text-teal-500" />
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
            </div>
            <input 
               type="text" 
               defaultValue={employee?.ifsc || "Not Provided"} 
               className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-[13px] font-bold text-[#042f2e] focus:border-[#042f2e] transition-all outline-none" 
               readOnly
            />
         </div>
      </div>
      
      {/* Decorative Security Symbol */}
      <Landmark size={120} className="absolute -bottom-10 -right-10 text-slate-50 opacity-50 group-hover:text-teal-50/50 transition-colors pointer-events-none" strokeWidth={1} />
    </div>
  );
};

export default BankDetails;
