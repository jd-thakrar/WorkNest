import React from "react";
import { FileDown, Eye, BadgeCheck, TrendingUp } from "lucide-react";
import { generatePayslipPDF } from "../../../utils/pdfGenerator";

const PayslipList = ({ payslips = [] }) => {

  return (
    <div className="divide-y divide-slate-50">
      {payslips.map((p, i) => (
        <div
          key={i}
          className="px-10 py-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => generatePayslipPDF(p)}
              className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-lg group-hover:shadow-teal-900/5 transition-all"
            >
              <FileDown size={22} />
            </button>
            <div>
              <h5 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase leading-none mb-2">
                {p.month}
              </h5>
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {p.date}
                </p>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <BadgeCheck size={12} /> {p.status}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-black text-[#042f2e]">
                ₹{p.amount}
              </p>
              <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-teal-600 uppercase">
                <TrendingUp size={10} /> Full Pay
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => generatePayslipPDF(p)}
                className="p-3 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all tooltip group"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PayslipList;
