import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  FileText,
  Receipt,
  Download,
  ShieldAlert,
} from "lucide-react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { API_URL } from "../../config";
import { generatePayslipPDF } from "../../utils/pdfGenerator";

// Components
import { calcPayrollRow } from "../../utils/payrollUtils";
import ClaimsHistory from "../../components/employee/finance/ClaimsHistory";
import NewClaimForm from "../../components/employee/finance/NewClaimForm";
import FinanceSummaryStrip from "../../components/employee/finance/FinanceSummaryStrip";

const Finance = () => {
  const { user } = useAuth();
  const { employees, financials } = useGlobal();
  const [data, setData] = useState({
    claims: [],
    latestPayslip: null, // this gets the last *disbursed*
    settings: null,
    stats: {
      pendingClaimsCount: 0,
      pendingClaimsValue: 0,
      ytdApproved: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/employee-self/finance`, {
        headers: { Authorization: `Bearer ${user.token}` },
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

  useEffect(() => {
    if (user) fetchFinanceData();
  }, [user]);

  const d = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    return prev.toLocaleString("en-US", { month: "long", year: "numeric" });
  });

  const userId = user?.id || user?._id;

  // Master lookup: prioritizes the local injected employee profile
  const activeEmp = (data.employee) 
  ? {
      ...data.employee,
      id: userId, // Use user ID for lookup compatibility
      name: `${data.employee.firstName} ${data.employee.lastName}`,
      role: data.employee.designation,
      dept: data.employee.department,
      baseSalary: Number(data.employee.basic || data.employee.salary || 0),
      hraAmount: Number(data.employee.hra || 0),
      totalAllowances: Number(data.employee.travel || 0) + Number(data.employee.daily || 0) + Number(data.employee.allowances || 0)
    }
  : employees.find(e => e.id === userId || e._id === userId);

  const employeesList = [activeEmp].filter(Boolean);
  // Source financials from local data if available (best for employees)
  const financialRecords = (data.financials && data.financials.length > 0) 
     ? data.financials.map(f => ({ ...f, id: userId })) // Normalize ID for engine
     : financials;

  const getFullBreakdown = (targetMonth) => {
    if (!userId) return null;
    if (employeesList.length === 0) return null;

    // Call the master admin logic
    const row = calcPayrollRow(userId, employeesList, financialRecords, targetMonth);
    if (!row) return null;

    // Fulfill the requirement to add 'Accepted' reimbursements 
    const liveApproved = (data.claims || [])
       .filter(c => c.status === 'Approved')
       .reduce((sum, c) => sum + Number(c.amount || 0), 0);
       
    if (row.reimbursements === 0 && liveApproved > 0 && targetMonth.includes(new Date().toLocaleString('en-US', { month: 'long' }))) {
       row.reimbursements = liveApproved;
       row.gross += liveApproved;
       row.net += liveApproved;
    }

    // Handle discrepancy if total Statutory is overridden in DB
    const calculatedSum = (row.pf || 0) + (row.pt || 0) + (row.tds || 0) + (row.otherExtras || 0);
    const discrepancy = (row.status === 'Paid') ? (row.statutory - calculatedSum) : 0;

    return {
      employeeName: activeEmp.name,
      designation: activeEmp.role,
      panNo: activeEmp.pan || data.employee?.pan,
      accountNo: activeEmp.accountNumber || data.employee?.accountNumber,
      company: {
        name: data.settings?.companyName || "WORKNEST TECHNOLOGIES",
        address: data.settings?.address || "123 Business Hub, Cyber City",
        phone: data.settings?.phone || "+91 80 1234 5678",
        email: data.settings?.email || "hr@worknest.com"
      },
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
        lwp: Math.round(row.lwpDeduct).toLocaleString("en-IN"),
        otherExtras: Math.round((row.otherExtras || 0) + discrepancy).toLocaleString("en-IN"),
      },
    };
  };

  const currentPayslipObj = getFullBreakdown(selectedMonth);

  const dynamicMonth = d.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const nextPayoutRow = userId ? calcPayrollRow(userId, employeesList, financialRecords, dynamicMonth) : null;
  const currentNetPayAmount = nextPayoutRow ? nextPayoutRow.net : null;

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ].map(m => `${m} ${d.getFullYear()}`);

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
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (loading)
    return (
      <EmployeeLayout title="Payroll & Financial Services">
        <div className="p-10 text-center animate-pulse text-teal-600 font-bold">
          Synchronizing Financial Data...
        </div>
      </EmployeeLayout>
    );

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
          <FinanceSummaryStrip
            data={{
              ...data,
              nextPayoutDraft:
                currentNetPayAmount !== null
                  ? Math.round(currentNetPayAmount)
                  : null,
              latestPayslip: currentPayslipObj
                ? {
                    net: parseFloat(currentPayslipObj.amount.replace(/,/g, '')),
                    month: currentPayslipObj.month,
                  }
                : null,
            }}
          />
        </motion.div>

        {/* Month Selection Bar */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#042f2e] uppercase tracking-widest">Financial Records</h3>
              <div className="h-px w-20 bg-slate-100" />
           </div>
           <select 
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#042f2e] focus:ring-4 focus:ring-teal-500/5 transition-all outline-none cursor-pointer"
           >
             {months.map(m => <option key={m} value={m}>{m}</option>)}
           </select>
        </motion.div>

        {/* Row 2 — Main Operational Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* RIGHT SIDE: Application Form (2/3 width) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <NewClaimForm onClaimSubmitted={fetchFinanceData} />
          </motion.div>

          {/* RIGHT SIDE: Status Stack (1/3 width) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tax Declaration Card */}
            <motion.div
              variants={itemVariants}
              className="p-5 bg-[#042f2e] rounded-xl relative overflow-hidden group border border-teal-500/20 shadow-lg shadow-teal-900/10"
            >
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 leading-none">
                  Tax Declaration
                </p>
                <p className="text-[12px] font-bold text-white tracking-tight leading-relaxed mb-4">
                  FY 2025-26 submissions are now open. Upload your proofs to
                  optimize tax.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-400 hover:text-white transition-colors">
                  Declare Now <ShieldAlert size={14} />
                </button>
              </div>
              <FileText
                className="absolute right-[-10px] bottom-[-10px] text-teal-700/20 group-hover:text-teal-500/10 transition-colors pointer-events-none"
                size={120}
                strokeWidth={1}
              />
            </motion.div>

            {/* Payslip Card */}
            {currentPayslipObj ? (
              <motion.div
                variants={itemVariants}
                className="p-5 bg-white border border-slate-200/60 rounded-xl flex items-center justify-between group hover:border-teal-500/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                      {currentPayslipObj.status === 'Paid' ? 'Issued Payslip' : 'Calculated Draft'}
                    </p>
                    <p className="text-[14px] font-bold text-[#042f2e] tracking-tight">
                      {currentPayslipObj.month}:{" "}
                      <span className="text-teal-600">
                        ₹{currentPayslipObj.amount}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => generatePayslipPDF(currentPayslipObj)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                >
                  <Download size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center gap-4 text-slate-400"
              >
                <Receipt size={20} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No records for {selectedMonth}
                </p>
              </motion.div>
            )}
          </div>
        </div>


        {/* Row 4 — Reimbursement History */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                <History size={18} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#042f2e] tracking-tight">
                  Reimbursement Records
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  Audit trail for all your financial claims
                </p>
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
