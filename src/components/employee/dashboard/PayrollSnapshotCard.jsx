import React from "react";
import { Wallet, Download } from "lucide-react";
import { generatePayslipPDF } from "../../../utils/pdfGenerator";
import { useAuth } from "../../../context/AuthContext";
import { useGlobal } from "../../../context/GlobalContext";

const PayrollSnapshotCard = ({ payroll }) => {
  const { user } = useAuth();

  const prevD = new Date();
  prevD.setMonth(prevD.getMonth() - 1);
  const fallbackMonth = prevD.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const latestF = payroll.record;

  let payslipData = {
    month: payroll.lastDate || fallbackMonth,
    amount: payroll.lastAmount?.replace('₹', '') || "0",
    date: "Processing",
    status: "Calculated",
    details: {}
  };

  if (latestF) {
     payslipData = {
        employeeName: `${user.firstName || ''} ${user.lastName || ''}`,
        designation: user.role,
        month: latestF.month,
        amount: latestF.net?.toLocaleString('en-IN') || "0",
        date: "Disbursed",
        status: "Disbursed",
        details: {
           basic: latestF.basic?.toLocaleString('en-IN') || "0",
           hra: latestF.hra?.toLocaleString('en-IN') || "0",
           special: latestF.allowances?.toLocaleString('en-IN') || "0",
           reimbursement: latestF.reimbursements?.toLocaleString('en-IN') || "0",
           gross: latestF.gross?.toLocaleString('en-IN') || "0",
           pf: latestF.pf?.toLocaleString('en-IN') || "0",
           pt: "200",
           tds: (latestF.deductions - (latestF.pf || 0) - 200 > 0 ? latestF.deductions - (latestF.pf || 0) - 200 : 0).toLocaleString('en-IN') || "0",
           totalDeductions: latestF.deductions?.toLocaleString('en-IN') || "0",
        }
     };
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
           <h4 
             style={{ fontFamily: "'Outfit', sans-serif" }}
             className="text-lg font-bold text-[#042f2e] tracking-tight"
           >
             Payroll
           </h4>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Disbursement</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600 border border-slate-100">
           <Wallet size={16} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Amount</p>
           <h2 className="text-xl font-bold text-[#042f2e] tracking-tight">₹{payslipData.amount}</h2>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">on {payslipData.month}</p>
        </div>
 
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">EMI</p>
              <p className="text-[11px] font-bold text-slate-700">{payroll.loanEMI}</p>
           </div>
           <button 
              onClick={() => generatePayslipPDF(payslipData)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-100 rounded-lg text-[8px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
           >
              <Download size={10} /> Slip
           </button>
        </div>
      </div>

    </div>
  );
};

export default PayrollSnapshotCard;
