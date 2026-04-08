import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ShieldCheck, Landmark, IndianRupee } from "lucide-react";

const PayslipModal = ({ isOpen, onClose, data }) => {
  const printRef = useRef();

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:bg-white print:p-0 print:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative print:shadow-none print:max-w-full print:w-full print:h-auto print:overflow-visible print:p-0"
        >
          {/* Header Actions - hidden on print */}
          <div className="sticky top-0 right-0 p-4 flex justify-end gap-2 bg-gradient-to-b from-white via-white to-transparent z-10 print:hidden">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all shadow-sm"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={printRef} className="p-10 pt-2 print:p-8">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
              <div>
                <h1 className="text-3xl font-black text-[#042f2e] tracking-tighter uppercase">Payslip</h1>
                <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mt-2">{data.month}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Nexus Corporate</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">123 Tech Avenue, Cyber City</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} /> Confirmed Disbursed
                </div>
              </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee Name</p>
                <p className="text-sm font-bold text-slate-800">John Doe (EMP-120)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                <p className="text-sm font-bold text-slate-800">Senior Engineer</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Landmark size={14} className="text-teal-600"/> HDFC Bank</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account No.</p>
                <p className="text-sm font-bold text-slate-800">XXXX-XXXX-1234</p>
              </div>
            </div>

            {/* Earnings & Deductions Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Earnings */}
              <div>
                <h3 className="text-xs font-black text-[#042f2e] uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">Earnings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Basic Salary</span>
                    <span className="font-bold text-slate-800">₹{data.details?.basic || "40,000"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">House Rent Allowance</span>
                    <span className="font-bold text-slate-800">₹{data.details?.hra || "20,000"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Special Allowance</span>
                    <span className="font-bold text-slate-800">₹{data.details?.special || "25,000"}</span>
                  </div>
                  <div className="flex justify-between text-sm italic">
                    <span className="font-medium text-teal-600">Reimbursement (Claim)</span>
                    <span className="font-bold text-teal-700">₹{data.details?.reimbursement || "4,000"}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Gross Earnings</span>
                  <span className="text-sm font-black text-emerald-600">₹{data.details?.gross || "89,000"}</span>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-xs font-black text-[#042f2e] uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">Deductions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Provident Fund (PF)</span>
                    <span className="font-bold text-slate-800">₹{data.details?.pf || "1,800"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Professional Tax</span>
                    <span className="font-bold text-slate-800">₹{data.details?.pt || "200"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">Income Tax (TDS)</span>
                    <span className="font-bold text-rose-600">₹{data.details?.tds || "3,000"}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Deductions</span>
                  <span className="text-sm font-black text-rose-600">₹{data.details?.totalDeductions || "5,000"}</span>
                </div>
              </div>
            </div>

            {/* Net Amount */}
            <div className="bg-[#042f2e] text-white rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-teal-900/20 print:bg-slate-100 print:text-black">
              <div>
                <p className="text-[10px] font-black text-teal-400/80 uppercase tracking-[0.2em] mb-1 print:text-slate-500">Net Transferred Amount</p>
                <div className="flex items-center gap-2">
                  <IndianRupee size={24} className="text-teal-400 print:text-slate-800" />
                  <h2 className="text-4xl font-black tracking-tighter">{data.amount || "84,000"}</h2>
                </div>
                <p className="text-xs font-medium text-slate-300 mt-2 italic print:text-slate-600">Eighty-Four Thousand Rupees Only</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid On</p>
                <p className="text-sm font-bold mt-1">{data.date}</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              This is a computer-generated document and requires no signature.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PayslipModal;
