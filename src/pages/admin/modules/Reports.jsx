import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  FileText,
  Search,
  Calendar,
  Users,
  Wallet,
  Clock,
  Activity,
  ShieldCheck,
  Printer,
  ChevronDown,
  ArrowRightCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "../../../context/GlobalContext.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

// ─── MASTER REPORT CATALOG ──────────────────────────────────────────────────
const REPORT_CATALOG = [
  {
    id: "salary-summary",
    name: "Salary reconciliation",
    desc: "Monthly gross to net audit.",
    module: "Payroll",
    icon: Wallet,
  },
  {
    id: "payslip",
    name: "Batch Payslips",
    desc: "Secure document distribution.",
    module: "Payroll",
    icon: FileText,
  },
  {
    id: "tds",
    name: "TDS Registry",
    desc: "Statutory compliance tracking.",
    module: "Compliance",
    icon: ShieldCheck,
  },
  {
    id: "attendance",
    name: "Attendance Matrix",
    desc: "Daily labor presence & leave.",
    module: "Workforce",
    icon: Clock,
  },
];

const formatCurr = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const ReportCard = ({ report, isActive, onClick }) => (
  <motion.button
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`min-w-[240px] p-4 rounded-[24px] border transition-all text-left flex items-start gap-3.5 shrink-0 relative overflow-hidden group ${
      isActive
        ? "bg-[#042f2e] border-[#042f2e] text-white shadow-xl shadow-teal-900/20"
        : "bg-white border-gray-100 text-[#042f2e] hover:border-teal-200 hover:shadow-lg"
    }`}
  >
    <div
      className={`p-3 rounded-xl shrink-0 transition-all duration-300 ${
        isActive ? "bg-white/10 text-white" : "bg-gray-50 text-gray-400"
      }`}
    >
      <report.icon size={18} />
    </div>
    <div className="flex-1 min-w-0 z-10">
      <span
        className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 block ${isActive ? "text-teal-400" : "text-gray-400"}`}
      >
        {report.module}
      </span>
      <h3
        className={`text-[14px] font-semibold leading-snug transition-colors ${
          isActive ? "!text-white" : "!text-[#042f2e]"
        }`}
      >
        {report.name}
      </h3>
    </div>
  </motion.button>
);

const FilterInput = ({ label, icon: Icon, type = "select", options = [] }) => (
  <div className="space-y-2 flex-1 min-w-[180px]">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Icon
          size={14}
          className="text-gray-400 group-focus-within:text-teal-600 transition-colors"
        />
      </div>
      {type === "select" ? (
        <select className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-[20px] text-xs font-bold text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-200 transition-all appearance-none cursor-pointer">
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={`Search...`}
          className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-[20px] text-xs font-bold text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-200 transition-all"
        />
      )}
      {type === "select" && (
        <ChevronDown
          size={12}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}
    </div>
  </div>
);

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ─── CUSTOM STYLED DROPDOWN (Portal-based, never clips) ─────────────────────
 const StyledDropdown = ({ label, icon: Icon, value, onChange, options }) => {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const triggerRef = React.useRef(null);

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen(prev => !prev);
  };

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className="space-y-1.5" style={{ flex: 1, minWidth: 0 }}>
      {label && <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center gap-2 px-3 py-[9px] rounded-xl border text-xs font-bold transition-all duration-200 ${
          open
            ? 'bg-[#042f2e] border-[#042f2e] text-white shadow-lg'
            : 'bg-white border-gray-200 text-[#042f2e] hover:border-teal-400 hover:shadow-sm'
        }`}
      >
        {Icon && <Icon size={13} className={open ? 'text-teal-300 shrink-0' : 'text-gray-400 shrink-0'} />}
        <span className="flex-1 text-left truncate">{selected?.label ?? 'Select...'}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-teal-300' : 'text-gray-400'
          }`}
        />
      </button>

      {open && rect && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            zIndex: 99999,
          }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18)' }}
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/80">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                {label || 'Select'}
              </p>
            </div>
            {/* Options */}
            <div className="max-h-56 overflow-y-auto">
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-[#042f2e] text-white'
                        : 'text-[#042f2e] hover:bg-teal-50 hover:text-teal-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const Reports = () => {
  const { employees, financials, attendance } = useGlobal();
  
  const [selectedId, setSelectedId] = useState("salary-summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [reportResult, setReportResult] = useState({ cols: [], rows: [], insights: [] });

  // Filters
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [dept, setDept] = useState("All Departments");
  const [search, setSearch] = useState("");

  // Always show all 12 months — user picks freely, "No Data" shown if nothing found
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear + 1; y >= 2020; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const selectedReport = REPORT_CATALOG.find((r) => r.id === selectedId);

  const handleGenerate = () => {
    setIsGenerating(true);
    setHasData(false);
    
    const period = `${monthNames[selMonth]} ${selYear}`;
      let filteredEmps = employees;
      if (dept !== "All Departments") {
        filteredEmps = filteredEmps.filter(e => e.dept === dept);
      }
      if (search) {
        filteredEmps = filteredEmps.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
      }

      // Period Parsing
      const targetMonth = selMonth;
      const targetYear = selYear;

      let cols = [];
      let rows = [];
      let insights = [];

      if (selectedId === "salary-summary") {
        cols = ["Employee", "Type", "Gross Pay", "Deductions", "Net Pay", "Status"];
        // ONLY include employees who actually have a financial record for THIS month
        const empsWithFin = filteredEmps.filter(e => financials.some(fin => fin.id === e.id && fin.month === period));
        
        rows = empsWithFin.map(e => {
           const f = financials.find(fin => fin.id === e.id && fin.month === period);
           return {
              emp: e.name,
              type: e.type,
              gross: formatCurr(f.gross || 0),
              deduct: formatCurr(f.deductions || 0),
              net: formatCurr(f.net || 0),
              status: f.status || 'Draft'
           };
        });
        
        const totalNet = empsWithFin.reduce((acc, e) => {
           const f = financials.find(fin => fin.id === e.id && fin.month === period);
           return acc + (f?.net || 0);
        }, 0);
        insights = [
          { label: "Reported Net", val: formatCurr(totalNet), icon: Wallet, color: "text-teal-600" },
          { label: "Headcount", val: empsWithFin.length, icon: Users, color: "text-[#042f2e]" },
          { label: "Avg Payout", val: formatCurr(empsWithFin.length > 0 ? totalNet / empsWithFin.length : 0), icon: Activity, color: "text-blue-600" }
        ];
      } else if (selectedId === "payslip") {
        cols = ["Reference", "Employee", "Gross", "Net Pay", "Bank Status", "Email"];
        const empsWithFin = filteredEmps.filter(e => financials.some(fin => fin.id === e.id && fin.month === period));
        
        rows = empsWithFin.map(e => {
           const f = financials.find(fin => fin.id === e.id && fin.month === period);
           return {
              ref: `PS-${e.id?.slice(-4) || 'XXXX'}`,
              name: e.name,
              gross: formatCurr(f.gross || 0),
              net: formatCurr(f.net || 0),
              status: f.status === 'Paid' ? 'Transfer Occured' : 'Awaiting Batch',
              email: e.email
           };
        });
        insights = [
          { label: "Drafted slips", val: rows.filter(r => r.status === 'Awaiting Batch').length, icon: FileText, color: "text-amber-600" },
          { label: "Slips Ready", val: rows.length, icon: CheckCircle2, color: "text-teal-600" }
        ];
      } else if (selectedId === "tds") {
        cols = ["Taxpayer", "Type", "Gross Income", "TDS Deduct", "PAN Ref", "Statutory Status"];
        const empsWithFin = filteredEmps.filter(e => financials.some(fin => fin.id === e.id && fin.month === period));
        
        rows = empsWithFin.map(e => {
           const f = financials.find(fin => fin.id === e.id && fin.month === period);
           const tdsAmt = (f?.gross || 0) * (e.type === 'Freelancer' ? 0.10 : 0.05);
           return {
              name: e.name,
              category: e.type,
              income: formatCurr(f?.gross || 0),
              tds: formatCurr(tdsAmt),
              pan: e.id?.toUpperCase().slice(-5) || 'PAN-ERR',
              status: 'Calculatd (194J/I)'
           };
        });
        const totalTDS = rows.reduce((acc, r) => acc + parseFloat(r.tds.replace(/[₹,]/g,'') || 0), 0);
        insights = [
          { label: "TDS Liability", val: formatCurr(totalTDS), icon: ShieldCheck, color: "text-rose-600" },
          { label: "Compliant Refs", val: rows.length, icon: CheckCircle2, color: "text-teal-600" }
        ];
      } else {
        // Attendance logic
        cols = ["Employee", "Dept", "Present", "Absent", "Late", "On Leave"];
        rows = filteredEmps.map(e => {
          const empAtts = attendance.filter(a => {
             if (!a.date) return false;
             const d = new Date(a.date);
             const aEmpId = String(a.empId?._id || a.empId);
             const eId = String(e._id || e.id);
             return d.getMonth() === targetMonth && d.getFullYear() === targetYear && aEmpId === eId;
          });
          return {
            name: e.name,
            dept: e.dept,
            p: empAtts.filter(a => ["Present", "Late", "ACTIVE", "COMPLETED", "ON_BREAK"].includes(a.status)).length,
            a: empAtts.filter(a => a.status === 'Absent').length,
            l: empAtts.filter(a => a.status === 'Late').length,
            ol: empAtts.filter(a => a.status === 'ON_LEAVE').length
          };
        });
        
        // Ensure even empty rows show up so the table isn't invisible
        // const rowsWithData = rows.filter(r => r.p > 0 || r.a > 0 || r.l > 0 || r.ol > 0);
        // rows = rowsWithData;

        const totalP = rows.reduce((acc, r) => acc + r.p, 0);
        const totalA = rows.reduce((acc, r) => acc + r.a, 0);
        insights = [
          { label: "Avg Attendance", val: rows.length > 0 ? `${Math.round((totalP / (totalP + totalA || 1)) * 100)}%` : '—', icon: Clock, color: "text-teal-600" },
          { label: "Total Absences", val: rows.length > 0 ? totalA : '—', icon: Calendar, color: "text-rose-600" },
          { label: "Late Ratio", val: rows.length > 0 ? `${totalP > 0 ? ((rows.reduce((acc,r) => acc+r.l, 0) / totalP) * 100).toFixed(1) : 0}%` : '—', icon: Activity, color: "text-amber-600" }
        ];
      }

      setReportResult({ cols, rows, insights });
      setIsGenerating(false);
      setHasData(true);
  };

  const handleDownloadCSV = () => {
    if (!hasData) return;
    const periodStr = `${monthNames[selMonth]}_${selYear}`;
    const csvContent = reportResult.cols.join(",") + "\n" + 
      reportResult.rows.map(row => Object.values(row).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedId}_${periodStr}.csv`);
    link.click();
    
    toast.success('Inventory manifest exported to CSV', {
       style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
    });
  };

  const handleDownloadPDF = () => {
    if (!hasData) return;
    const periodStr = `${monthNames[selMonth]} ${selYear}`;
    const doc = new jsPDF();
    doc.text(`${selectedReport.name} - ${periodStr}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [reportResult.cols],
      body: reportResult.rows.map(r => Object.values(r)),
      theme: 'grid',
      headStyles: { fillColor: [4, 47, 46] }
    });
    doc.save(`${selectedId}_${periodStr.replace(' ','_')}.pdf`);
    
    toast.success('Structured PDF documentation generated', {
       style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
    });
  };

  const handleDownloadXLS = () => {
    if (!hasData) return;
    const periodStr = `${monthNames[selMonth]}_${selYear}`;
    const ws = XLSX.utils.json_to_sheet(reportResult.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.utils.writeFile(wb, `${selectedId}_${periodStr}.xlsx`);
    
    toast.success('Comprehensive Workbook (XLSX) exported', {
       style: { borderRadius: '16px', background: '#042_2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
    });
  };

  return (
    <AdminLayout title="Reports center">
      <div className="space-y-8 pb-10 w-full animate-in">
        {/* CATALOG SELECTOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-lg shadow-teal-500/50" />
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-lg font-bold text-[#042f2e]"
              >
                Inventory & Analytics
              </h2>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-3 px-3 lg:mx-0 lg:px-0">
            {REPORT_CATALOG.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                isActive={selectedId === r.id}
                onClick={() => {
                  setSelectedId(r.id);
                  setHasData(false);
                }}
              />
            ))}
          </div>
        </div>

        {/* CONFIG & ENGINE PANEL */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Primary Engine Control */}
          <section className="xl:col-span-3 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-10 items-start justify-between relative z-10">
              <div className="flex-1 w-full space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[22px] bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner border border-teal-100/50">
                    <selectedReport.icon size={28} />
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-2xl font-bold text-[#042f2e] tracking-tight"
                    >
                      {selectedReport.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                      {selectedReport.desc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                  <div className="md:col-span-2 flex gap-3 items-end">
                    {/* Month Dropdown */}
                    <StyledDropdown
                      label="Period Month"
                      icon={Calendar}
                      value={selMonth}
                      onChange={(v) => { setSelMonth(v); setHasData(false); }}
                      options={monthNames.map((m, i) => ({ label: m, value: i }))}
                    />
                    {/* Year Dropdown */}
                    <StyledDropdown
                      label="Year"
                      value={selYear}
                      onChange={(v) => { setSelYear(v); setHasData(false); }}
                      options={availableYears.map(y => ({ label: String(y), value: y }))}
                    />
                  </div>

                  <StyledDropdown
                    label="Department"
                    icon={Users}
                    value={dept}
                    onChange={(v) => setDept(v)}
                    options={[
                      { label: 'All Departments', value: 'All Departments' },
                      ...Array.from(new Set(employees.map(e => e.dept))).filter(Boolean).map(d => ({ label: d, value: d }))
                    ]}
                  />

                  <div className="space-y-2 flex-1 min-w-[180px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Entity</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={14} className="text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                      </div>
                      <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search employee..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-[20px] text-xs font-bold text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-4 min-w-[220px]">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#042f2e] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-900 transition-all shadow-md disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Wait...
                    </div>
                  ) : (
                    <>
                      Extract Report <ArrowRightCircle size={14} />
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  {["PDF", "XLS", "CSV"].map((ext) => (
                    <button
                      key={ext}
                      onClick={() => {
                        if (ext === 'CSV') handleDownloadCSV();
                        else if (ext === 'PDF') handleDownloadPDF();
                        else if (ext === 'XLS') handleDownloadXLS();
                      }}
                      disabled={!hasData || isGenerating}
                      className="py-2.5 bg-gray-50 text-[#042f2e] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-50 hover:text-teal-600 transition-all disabled:opacity-30 border border-transparent shadow-sm"
                    >
                      {ext}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Quick Insights Summary */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center space-y-6">
            {(hasData ? reportResult.insights : [
              { label: "Total Net Payroll", val: "₹0", icon: Wallet, color: "text-teal-600" },
              { label: "Headcount", val: "0", icon: Users, color: "text-[#042f2e]" },
              { label: "Avg Payout", val: "₹0", icon: Activity, color: "text-blue-600" }
            ]).map((ins, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${ins.color} shadow-sm`}
                >
                  <ins.icon size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    {ins.label}
                  </p>
                  <p
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-lg font-black text-[#042f2e]"
                  >
                    {ins.val}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* PREVIEW ENGINE */}
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-80 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-[#042f2e] uppercase tracking-[0.2em]">
                  Structuring documentation...
                </p>
              </div>
            </motion.div>
          ) : hasData ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-teal-500" />
                  <h4
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-lg font-black text-[#042f2e]"
                  >
                    Structure Preview
                  </h4>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700">
                  <Printer size={14} /> Full Print
                </button>
              </div>
              <div className="overflow-x-auto thin-scroll">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {reportResult.cols.map((c) => (
                        <th
                          key={c}
                          className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reportResult.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-8 py-5 text-xs font-bold text-[#042f2e]"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                 </table>
                 {reportResult.rows.length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center text-center">
                     <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                       <AlertCircle size={24} />
                     </div>
                     <p className="text-xs font-black text-[#042f2e] uppercase tracking-widest">no data</p>
                     <p className="text-[10px] text-gray-400 mt-1 font-bold">No documentation exists for {monthNames[selMonth]} {selYear}.</p>
                   </div>
                 )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[48px] py-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[28px] bg-gray-50 flex items-center justify-center text-gray-200 mb-6">
                <FileText size={32} />
              </div>
              <p className="text-sm font-black text-[#042f2e] uppercase tracking-widest">
                No Extraction Active
              </p>
              <p className="text-xs text-gray-400 mt-1 font-bold">
                Select documentation from the catalog to begin.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default Reports;
