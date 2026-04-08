import React from "react";
import { CreditCard, FileDown, Eye, TrendingUp } from "lucide-react";
import { generatePayslipPDF } from "../../../utils/pdfGenerator";
import { useAuth } from "../../../context/AuthContext";
import { useGlobal } from "../../../context/GlobalContext";
import { calcPayrollRow } from "../../../utils/payrollUtils";

const PayslipPreview = () => {
  const { user } = useAuth();
  const { employees, financials } = useGlobal();

  const prevD = new Date();
  prevD.setMonth(prevD.getMonth() - 1);
  const targetMonth = prevD.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Use the master engine
  const row = calcPayrollRow(user.id, employees, financials, targetMonth);

  let latestPayslipData = {
    month: targetMonth,
    amount: "0",
    date: "Processing",
    status: "Calculated",
    details: {}
  };

  if (row) {
     latestPayslipData = {
        employeeName: user.name,
        designation: user.role,
        month: row.month,
        amount: Math.round(row.net).toLocaleString("en-IN"),
        date: row.status === "Paid" ? "Disbursed" : "Finalizing",
        status: row.status,
        details: {
           basic: Math.round(row.basic).toLocaleString("en-IN"),
           hra: Math.round(row.hra).toLocaleString("en-IN"),
           special: Math.round(row.allowances).toLocaleString("en-IN"),
           reimbursement: Math.round(row.reimbursements).toLocaleString("en-IN"),
           gross: Math.round(row.gross).toLocaleString("en-IN"),
           pf: Math.round(row.pf).toLocaleString("en-IN"),
           pt: Math.round(row.pt).toLocaleString("en-IN"),
           tds: Math.round(row.tds).toLocaleString("en-IN"),
           totalDeductions: Math.round(row.totalDeductions).toLocaleString("en-IN"),
        }
     };
  }

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CreditCard size={18} />
          </div>
          <h4 className="text-xl font-bold text-[#042f2e] tracking-tight">Latest Payslip</h4>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center py-6 border-b border-slate-100 mb-6">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{latestPayslipData.month}</p>
           <h2 className="text-4xl font-black text-[#042f2e] tracking-tighter">₹{latestPayslipData.amount}</h2>
           <p className="text-[11px] font-bold text-teal-600 mt-2 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-100 uppercase tracking-widest">{latestPayslipData.date === 'Processing' ? 'Draft Calculated' : `Disbursed`}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button 
              onClick={() => generatePayslipPDF(latestPayslipData)}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all group"
           >
              <Eye size={20} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-900">View Detail</span>
           </button>
           <button 
              onClick={() => generatePayslipPDF(latestPayslipData)}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all group text-teal-600"
           >
              <FileDown size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-900">Download</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default PayslipPreview;
