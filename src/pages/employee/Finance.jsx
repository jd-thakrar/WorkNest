import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, FileText, Receipt, Download, ShieldAlert } from "lucide-react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// Components
import LoansSummary from "../../components/employee/finance/LoansSummary";
import ClaimsHistory from "../../components/employee/finance/ClaimsHistory";
import NewClaimForm from "../../components/employee/finance/NewClaimForm";
import FinanceSummaryStrip from "../../components/employee/finance/FinanceSummaryStrip";

const Finance = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
     claims: [],
     loans: [],
     latestPayslip: null,
     stats: { pendingClaimsCount: 0, pendingClaimsValue: 0, ytdApproved: 0, activeLoan: null }
  });
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
     try {
        const res = await fetch(`${API_URL}/employee-self/finance`, {
           headers: { "Authorization": `Bearer ${user.token}` }
        });
        if (res.ok) {
           const json = await res.json();
           setData(json);
        }
     } catch (err) {
        console.error("Finance fetch error:", err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => { fetchFinanceData(); }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1, y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (loading) return <EmployeeLayout title="Payroll & Financial Services"><div className="p-10 text-center animate-pulse text-teal-600 font-bold">Synchronizing Financial Data...</div></EmployeeLayout>;

  return (
    <EmployeeLayout title="Payroll & Financial Services">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 pb-20"
      >
        {/* Row 1 — Financial Pulse (4 Data Items) */}
        <motion.div variants={itemVariants}>
          <FinanceSummaryStrip data={data} />
        </motion.div>

        {/* Row 2 — Main Operational Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDE: Application Form (2/3 width) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <NewClaimForm onClaimSubmitted={fetchFinanceData} />
          </motion.div>

          {/* RIGHT SIDE: Loan & Status Stack (1/3 width) */}
          <div className="lg:col-span-1 space-y-4">
             {/* Loan Status */}
             <motion.div variants={itemVariants}>
                <LoansSummary loan={data.stats.activeLoan} />
             </motion.div>

             {/* Tax Declaration Card */}
             <motion.div variants={itemVariants} className="p-5 bg-[#042f2e] rounded-xl relative overflow-hidden group border border-teal-500/20 shadow-lg shadow-teal-900/10">
                <div className="relative z-10">
                   <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 leading-none">Tax Declaration</p>
                   <p className="text-[12px] font-bold text-white tracking-tight leading-relaxed mb-4">
                      FY 2025-26 submissions are now open. Upload your proofs to optimize tax.
                   </p>
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-400 hover:text-white transition-colors">
                      Declare Now <ShieldAlert size={14} />
                   </button>
                </div>
                <FileText className="absolute right-[-10px] bottom-[-10px] text-teal-700/20 group-hover:text-teal-500/10 transition-colors pointer-events-none" size={120} strokeWidth={1} />
             </motion.div>

             {/* Latest Payslip Card */}
             <motion.div variants={itemVariants} className="p-5 bg-white border border-slate-200/60 rounded-xl flex items-center justify-between group hover:border-teal-500/30 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                      <Receipt size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Latest Payslip</p>
                      <p className="text-[14px] font-bold text-[#042f2e] tracking-tight">{data.latestPayslip?.month || "No Entry"}: <span className="text-teal-600">₹{data.latestPayslip?.net?.toLocaleString('en-IN') || "0"}</span></p>
                   </div>
                </div>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-teal-600 hover:text-white transition-all shadow-sm">
                   <Download size={16} />
                </button>
             </motion.div>
          </div>
        </div>

        {/* Row 3 — Records (Full Width at bottom) */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                    <History size={18} />
                 </div>
                 <div>
                    <h4 className="text-[14px] font-bold text-[#042f2e] tracking-tight">Reimbursement Records</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Audit trail for all your financial claims</p>
                 </div>
              </div>
           </div>
           <div>
              <ClaimsHistory claims={data.claims} />
           </div>
        </motion.div>

      </motion.div>
    </EmployeeLayout>
  );
};

export default Finance;
