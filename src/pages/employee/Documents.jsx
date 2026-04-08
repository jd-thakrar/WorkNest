import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileDown, ShieldAlert, History, Search, Filter, ShieldCheck, Inbox, Receipt, Download, FileText, ChevronRight } from "lucide-react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { API_URL } from "../../config";
import { calcPayrollRow } from "../../utils/payrollUtils";
import { generatePayslipPDF, generateDocumentPDF } from "../../utils/pdfGenerator";

// Components
import PayslipList from "../../components/employee/documents/PayslipList";
import OfficialDocs from "../../components/employee/documents/OfficialDocs";
import TaxSummary from "../../components/employee/documents/TaxSummary";

const Documents = () => {
  const { user } = useAuth();
  const { employees, financials } = useGlobal();
  const [data, setData] = useState({
    financials: [],
    employee: null,
    settings: null
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFinanceData = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
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
    else if (!user) setLoading(false);
  }, [user]);

  if (loading) return (
    <EmployeeLayout title="Records & Compliance">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-6" />
        <p className="text-teal-600 font-bold uppercase tracking-widest text-[10px] animate-pulse">
           Indexation of Secure Records in Progress...
        </p>
      </div>
    </EmployeeLayout>
  );

  const userId = user?.id || user?._id;
  const activeEmp = (data.employee) 
  ? {
      ...data.employee,
      id: userId,
      name: `${data.employee.firstName} ${data.employee.lastName}`,
      role: data.employee.designation,
      dept: data.employee.department
    }
  : (employees.find(e => e.id === userId || e._id === userId) || { name: user?.name, role: "Associate" });

  const financialRecords = (data.financials && data.financials.length > 0) 
     ? data.financials.map(f => ({ ...f, id: userId })) 
     : financials;

  const getMonthRecord = (month) => {
    if (!activeEmp) return null;
    const row = calcPayrollRow(userId, [activeEmp], financialRecords, month);
    if (!row) return null;

    const calculatedSum = (row.pf || 0) + (row.pt || 0) + (row.tds || 0) + (row.otherExtras || 0);
    const discrepancy = (row.status === 'Paid') ? (row.statutory - calculatedSum) : 0;

    return {
      employeeName: activeEmp.name,
      designation: activeEmp.role,
      panNo: activeEmp.pan || data.employee?.pan,
      accountNo: activeEmp.accountNumber || data.employee?.accountNumber,
      company: {
        name: data.settings?.companyName || "WORKNEST TECHNOLOGIES",
        address: [data.settings?.address, data.settings?.city, data.settings?.pinCode].filter(Boolean).join(", ") || "123 Business Hub, Cyber City",
        phone: data.settings?.phone || "+91 80 1234 5678",
        email: data.settings?.email || "hr@worknest.com"
      },
      month: row.month,
      amount: Math.round(row.net).toLocaleString("en-IN"),
      status: row.status,
      date: row.status === "Paid" ? "Disbursed" : "Finalizing",
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

  const currentYear = new Date().getFullYear();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    .map(m => `${m} ${currentYear}`)
    .map(m => getMonthRecord(m))
    .filter(Boolean)
    .filter(r => r.status === 'Paid'); // Only show issued payslips

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
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

  return (
    <EmployeeLayout title="Records & Compliance">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto pb-20"
      >
        {/* EXCLUSIVE REPOSITORY FOCUS */}
        <motion.div variants={itemVariants} className="w-full">
           <OfficialDocs 
              employeeName={activeEmp?.name} 
              company={data.settings} 
              joiningDate={activeEmp?.joiningDate}
           />
        </motion.div>

        {/* SECURITY & TRUST FOOTER */}
        <motion.div 
           variants={itemVariants}
           className="mt-12 p-8 bg-slate-50 rounded-[32px] border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6"
        >
           <div className="flex items-center gap-4 text-slate-400">
              <ShieldCheck size={20} />
              <p className="text-[11px] font-bold uppercase tracking-widest">End-to-End Encrypted Secure Storage</p>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-[10px] font-black text-[#042f2e] uppercase tracking-tighter">Compliance Engine Active</span>
           </div>
        </motion.div>
      </motion.div>
    </EmployeeLayout>
  );
};

export default Documents;
