import React, { useState, useMemo } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Wallet, ShieldCheck, Clock, Download, 
  Search, Filter, Lock, Unlock, FileText, 
  ChevronRight, Info, AlertCircle, TrendingUp,
  User, Landmark, Briefcase, MinusCircle, 
  PlusCircle, CheckCircle2, MoreHorizontal,
  Printer, X, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '../../context/GlobalContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { API_URL } from '../../config';

// ─── MASTER DUMMY DATA (Now in GlobalContext) ──────────────────────────────────


// ─── UTILITIES ───────────────────────────────────────────────────────────────
const formatCurr = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const calcPayrollRow = (empId, employees, financials, daysInMonth = 30) => {
  const emp = employees.find(e => e.id === empId);
  if (!emp) return null;

  const isDraft = !financials.find(fin => fin.id === empId && fin.month === (window.currentPayrollCycle || 'March 2026'));
  const f = financials.find(fin => fin.id === empId && fin.month === (window.currentPayrollCycle || 'March 2026')) || {
    basic: emp.type === 'Freelancer' ? emp.baseSalary : emp.baseSalary,
    hra: emp.type === 'Freelancer' ? 0 : emp.hraAmount,
    allowances: emp.type === 'Freelancer' ? 0 : emp.totalAllowances,
    perqs: [],
    lwp: 0,
    tds: false,
    loan: null
  };
  
  // Earnings
  const perqTotal = (f.perqs || []).reduce((acc, curr) => acc + (curr.mode === 'fixed' ? curr.value : (f.basic * curr.value / 100)), 0);
  const gross = f.basic + f.hra + f.allowances + perqTotal;
  
  // Deductions
  const pf = (emp.type === 'Freelancer' || !emp.pfEnabled) ? 0 : (f.basic * (emp.pfEmployee || 12) / 100);
  const pt = (emp.type === 'Freelancer' || !emp.profTax) ? 0 : 200;
  const loanDeduct = f.loan?.active ? f.loan.emi : 0;
  const lwpDeduct = (gross / daysInMonth) * (f.lwp || 0);
  
  // TDS Calculation (Simplified Slab)
  let tds = 0;
  if (emp.tds) {
    if (emp.type === 'Freelancer') {
      tds = gross * 0.10; // Flat 10% TDS for contractors
    } else {
      const annualTaxable = (gross * 12) - (pf * 12) - 50000; // 50k Standard Deduction
      if (annualTaxable > 1500000) tds = annualTaxable * 0.25 / 12;
      else if (annualTaxable > 1000000) tds = annualTaxable * 0.20 / 12;
      else if (annualTaxable > 700000) tds = annualTaxable * 0.10 / 12;
      else tds = annualTaxable * 0.05 / 12;
      if (tds < 0) tds = 0;
    }
  }

  const otherDeductions = emp.totalOtherDeduct || 0;
  const deductions = pf + pt + loanDeduct + lwpDeduct + tds + otherDeductions;
  const net = gross - deductions;

  return {
    id: empId,
    emp,
    financials: f,
    basic: f.basic,
    gross,
    allowances: f.hra + f.allowances,
    perqs: perqTotal,
    deductions,
    loan: loanDeduct,
    statutory: pf + pt + tds,
    lwpDeduct,
    net,
    status: isDraft ? 'Draft' : (f.status === 'Paid' ? 'Paid' : (f.lwp > 0 ? 'Hold' : 'Calculated'))
  };
};

const STATS_CONFIG = {
  processed: { label: 'Personnel Processed', color: 'text-teal-600', bg: 'bg-teal-50', icon: User },
  totalNet:  { label: 'Total Net Payroll',   color: 'text-[#042f2e]', bg: 'bg-gray-50', icon: Wallet },
  paid:      { label: 'Total Paid',          color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  remaining: { label: 'Total Remaining',     color: 'text-rose-600', bg: 'bg-rose-50', icon: Clock },
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const StatCard = ({ type, value }) => {
  const c = STATS_CONFIG[type];
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{c.label}</p>
        <p style={{ fontFamily: "'Outfit', sans-serif" }} className={`text-2xl font-black ${c.color}`}>{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center shrink-0`}>
        <c.icon size={24} className={c.color} />
      </div>
    </motion.div>
  );
};

const PayrollDrawer = ({ data, onClose }) => {
  if (!data) return null;
  const f = data.financials;

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-16 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={data.emp.avatar} className="w-12 h-12 rounded-2xl border border-gray-200 shadow-sm" alt="" />
          <div>
            <h3 className="text-lg font-black text-[#042f2e]">{data.emp.name}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{data.emp.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-300 hover:text-[#042f2e] transition-colors"><X size={24}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Earnings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center"><PlusCircle size={14} className="text-teal-600" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#042f2e]">Earnings Breakdown</h4>
          </div>
          <div className="space-y-3 bg-gray-50/50 rounded-3xl p-5 border border-gray-100">
             {[
               { l: 'Basic Salary', v: data.basic },
               { l: 'HRA & Allowances', v: data.allowances },
               { l: 'Perquisites', v: data.perqs },
             ].map(i => (
               <div key={i.l} className="flex justify-between text-sm">
                 <span className="font-medium text-gray-500">{i.l}</span>
                 <span className="font-bold text-[#042f2e]">{formatCurr(i.v)}</span>
               </div>
             ))}
             <div className="pt-3 border-t border-gray-200 mt-2 flex justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-teal-600">Gross Monthly</span>
                <span className="text-base font-black text-teal-600">{formatCurr(data.gross)}</span>
             </div>
          </div>
        </section>

        {/* Deductions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center"><MinusCircle size={14} className="text-rose-600" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#042f2e]">Deduction Breakdown</h4>
          </div>
          <div className="space-y-3 bg-gray-50/50 rounded-3xl p-5 border border-gray-100">
             {[
               { l: 'Statutory (PF, PT, TDS)', v: data.statutory },
               { l: 'Loan EMI Deduction', v: data.loan },
               { l: 'Leave Impact (LWP)', v: data.lwpDeduct },
             ].map(i => (
               <div key={i.l} className="flex justify-between text-sm">
                 <span className="font-medium text-gray-500">{i.l}</span>
                 <span className="font-bold text-rose-600">-{formatCurr(i.v)}</span>
               </div>
             ))}
             <div className="pt-3 border-t border-gray-200 mt-2 flex justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-[#042f2e]">Total Deductions</span>
                <span className="text-base font-black text-rose-700">{formatCurr(data.deductions)}</span>
             </div>
          </div>
        </section>

        {/* Loan Progress */}
        {f.loan && (
          <section className="bg-[#042f2e] text-white rounded-[32px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 blur-2xl -mr-12 -mt-12 pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-400">Active Loan Repayment</h4>
              <Landmark size={16} className="text-teal-400" />
            </div>
            <p className="text-2xl font-black mb-1">{formatCurr(f.loan.emi * f.loan.rem)}</p>
            <p className="text-[10px] font-bold text-teal-100/50 uppercase tracking-widest mb-4">Remaining Balance</p>
            <div className="space-y-1.5">
               <div className="flex justify-between text-[9px] font-bold text-teal-400 uppercase tracking-widest">
                  <span>Tenure Remaining</span>
                  <span>{f.loan.rem} Months</span>
               </div>
               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(f.loan.rem / 24) * 100}%` }} className="h-full bg-teal-400" />
               </div>
            </div>
          </section>
        )}
      </div>

      <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Net Payable</p>
            <p style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#042f2e]">{formatCurr(data.net)}</p>
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-[#042f2e] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-900 transition-all shadow-lg shadow-teal-900/10">
            <Printer size={16} /> Print Slip
         </button>
      </div>
    </motion.div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

const Payroll = () => {
  const { user } = useAuth();
  const { employees, financials, payrollStatus, lockPayroll, refreshGlobal } = useGlobal();
  const [activeCycle, setActiveCycle] = useState(payrollStatus.cycle);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Generate rows
  const rows = useMemo(() => {
    window.currentPayrollCycle = activeCycle;
    return employees.map(e => calcPayrollRow(e.id, employees, financials)).filter(Boolean);
  }, [employees, financials, activeCycle]);
  
  const processedCount = useMemo(() => rows.filter(r => r.status !== 'Draft').length, [rows]);
  
  const filteredRows = rows.filter(r => r.emp.name.toLowerCase().includes(search.toLowerCase()));

  const totals = useMemo(() => ({
    gross: rows.reduce((acc, r) => acc + r.gross, 0),
    deducts: rows.reduce((acc, r) => acc + r.deductions, 0),
    net: rows.reduce((acc, r) => acc + r.net, 0),
    paid: rows.reduce((acc, r) => acc + (r.financials?.status === 'Paid' ? r.net : 0), 0),
  }), [rows]);

  const handleRunPayroll = async () => {
    setIsRunning(true);
    try {
      await fetch(`${API_URL}/payroll`, {
         method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
         body: JSON.stringify({ month: activeCycle })
      });
      if (refreshGlobal) await refreshGlobal();
    } catch(err) { console.error(err); }
    setIsRunning(false);
  };

  const handleExportCSV = () => {
    if (rows.length === 0) {
      alert("No active payroll data to export.");
      return;
    }
    const headers = ["Employee ID", "Name", "Role", "Type", "Gross Pay", "Total Deductions", "Net Pay", "Internal Status", "Live Status"];
    const csvRows = rows.map(r => [
      r.emp.employeeId || "N/A",
      `"${r.emp.name}"`,
      `"${r.emp.role}"`,
      r.emp.type,
      r.gross,
      r.deductions,
      r.net,
      r.financials?.status || 'Draft',
      r.status
    ].join(","));

    const csvContent = headers.join(",") + "\n" + csvRows.join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Export_${payrollStatus.cycle.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Payroll Hub">
      <div className="space-y-8 animate-in pb-20">
        
        {/* Header Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Clock size={18} className="text-teal-500" />
                </div>
                <select 
                  value={activeCycle}
                  onChange={(e) => setActiveCycle(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-[20px] text-sm font-black text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 shadow-sm appearance-none cursor-pointer"
                >
                  {['January', 'February', 'March', 'April'].map(m => (
                    <option key={m} value={`${m} 2026`}>{m} 2026</option>
                  ))}
                </select>
             </div>
             
             <div className="flex items-center bg-white border border-gray-100 px-4 py-2.5 rounded-[20px] shadow-sm group focus-within:ring-4 focus-within:ring-teal-500/5 transition-all flex-1 min-w-[300px]">
                <Search size={18} className="text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search personnel by name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium text-[#042f2e] w-full placeholder:text-gray-300 ml-3"
                />
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
               onClick={handleRunPayroll}
               disabled={payrollStatus.isLocked || isRunning}
               className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 disabled:opacity-50 transition-all shadow-sm"
            >
               {isRunning ? <TrendingUp size={16} className="animate-bounce" /> : <PlusCircle size={16} />}
               {isRunning ? 'Calculating...' : 'Run Payroll'}
            </button>
            <button 
               onClick={() => lockPayroll(!payrollStatus.isLocked)}
               className={`flex items-center gap-2 px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${payrollStatus.isLocked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
            >
               {payrollStatus.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
               {payrollStatus.isLocked ? 'Payroll Locked' : 'Lock Payroll'}
            </button>
            <button 
               onClick={handleExportCSV}
               title="Download CSV Export"
               className="flex items-center justify-center w-12 h-12 bg-[#042f2e] text-white rounded-[20px] hover:bg-teal-900 transition-all shadow-lg shadow-teal-900/10"
            >
               <Download size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard type="processed" value={`${rows.filter(r => r.financials?.status === 'Paid').length}/${employees.length}`} />
           <StatCard type="totalNet"  value={formatCurr(totals.net)} />
           <StatCard type="paid"      value={formatCurr(totals.paid)} />
           <StatCard type="remaining" value={formatCurr(totals.net - totals.paid)} />
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto thin-scroll">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]" >Personnel</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Base / Allow</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">EMI / Perqs</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Statutory</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">LWP Impact</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross / Net</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredRows.map(row => (
                      <tr 
                         key={row.id} 
                         onClick={() => setSelectedEmp(row)}
                         className="hover:bg-teal-50 transition-colors group cursor-pointer"
                      >
                          <td className="px-8 py-5 sticky left-0 bg-white group-hover:bg-teal-50 z-10 transition-colors shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                  <img src={row.emp.avatar} alt="" className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-[#042f2e]">{row.emp.name}</div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{row.emp.dept}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="space-y-0.5">
                               <span className="text-xs font-bold text-[#042f2e] block">{formatCurr(row.basic)}</span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{formatCurr(row.allowances)}</span>
                            </div>
                         </td>
                         <td className="px-6 py-5 text-center">
                             <div className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${row.loan > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-300'}`}>
                                   EMI: {formatCurr(row.loan)}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${row.perqs > 0 ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-300'}`}>
                                   PRQ: {formatCurr(row.perqs)}
                                </span>
                             </div>
                         </td>
                         <td className="px-6 py-5 text-center">
                            <span className="text-xs font-black text-rose-500">-{formatCurr(row.statutory)}</span>
                         </td>
                         <td className="px-6 py-5 text-center">
                            {row.lwpDeduct > 0 ? (
                               <div className="flex items-center justify-center gap-1.5 text-rose-600">
                                  <AlertCircle size={14} />
                                  <span className="text-xs font-black">-{formatCurr(row.lwpDeduct)}</span>
                               </div>
                            ) : (
                               <span className="text-xs font-bold text-gray-400">0.00</span>
                            )}
                         </td>
                         <td className="px-6 py-5">
                             <div className="space-y-0.5">
                                <span className="text-xs font-bold text-gray-400 block line-through">{formatCurr(row.gross)}</span>
                                <span className="text-sm font-black text-emerald-600 block">{formatCurr(row.net)}</span>
                             </div>
                         </td>
                         <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                               row.status === 'Calculated' || row.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                               row.status === 'Hold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                               'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${
                                  row.status === 'Calculated' || row.status === 'Paid' ? 'bg-emerald-500' :
                                  row.status === 'Hold' ? 'bg-amber-500' :
                                  'bg-emerald-500'
                               }`} />
                               {payrollStatus.isLocked && row.status !== 'Paid' ? 'Locked' : row.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                             <button className="p-2 text-gray-300 hover:text-[#042f2e] hover:bg-gray-50 rounded-xl transition-all">
                                <MoreHorizontal size={18} />
                             </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          
          {filteredRows.length === 0 && (
             <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mx-auto text-gray-300">
                   <Briefcase size={32} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching payroll records</p>
             </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="bg-teal-50 border border-teal-100 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                 <ShieldCheck size={28} className="text-teal-600" />
              </div>
              <div>
                 <h4 className="text-base font-bold text-[#042f2e]">Disbursement Assurance</h4>
                 <p className="text-sm text-teal-700 font-medium">Verified for SPF, ESI and Statutory compliance based on India Tax Regime 2026.</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  try {
                    // Gatecheck: ensure there are no drafts
                    if (rows.some(r => r.status === 'Draft')) {
                       alert("You must execute 'Run Payroll' at the top right first to commit these Drafts to the database before disbursing funds.");
                       return;
                    }
                    
                    setIsRunning(true);
                    const unpaidRows = rows.filter(r => r.financials?.status !== 'Paid');
                    await Promise.all(unpaidRows.map(r => 
                       fetch(`${API_URL}/payroll/${r.financials._id}/pay`, {
                         method: "PUT", headers: { "Authorization": `Bearer ${user.token}` }
                       })
                    ));
                    if(refreshGlobal) refreshGlobal();
                    alert("Payroll Disbursed Successfully!");
                  } catch (e) { console.error(e); } finally {
                    setIsRunning(false);
                  }
                }}
                disabled={isRunning || rows.length === 0 || rows.every(r => r.financials?.status === 'Paid')} 
                className="px-8 py-3 bg-[#042f2e] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-teal-900 transition-all shadow-lg shadow-teal-900/10 disabled:opacity-50"
              >
                 {rows.every(r => r.financials?.status === 'Paid') && rows.length > 0 ? "Disbursed Fully" : "Finalize & Pay"}
              </button>
           </div>
        </div>

      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedEmp && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setSelectedEmp(null)}
               className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" 
            />
            <PayrollDrawer data={selectedEmp} onClose={() => setSelectedEmp(null)} />
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

// Simple Icon helper since I used PlayCircleIcon name accidentally
const PlayCircleIcon = ({ size }) => <motion.div whileTap={{ scale: 0.9 }}><PlusCircle size={size} /></motion.div>;

export default Payroll;
