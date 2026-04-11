import React, { useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Check,
  X,
  AlertCircle,
  FileText,
  CheckCircle2,
  Edit3,
  Info,
  ShieldCheck,
  SquareMenu,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobal } from "../../context/GlobalContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_URL } from "../../config";

// ─── UTILITIES ───────────────────────────────────────────────────────────────
const LEAVE_STATUS_CONFIG = {
  Pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Clock },
  Approved: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2 },
  Rejected: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: X },
};

const StatCard = ({ label, value, icon: Icon, color, bg, detail }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group relative"
  >
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <div className="flex items-baseline gap-2">
         <p style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-[#042f2e]">{value}</p>
         {detail && <span className="text-[8px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Active</span>}
      </div>
      {detail && (
         <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[#042f2e] text-white rounded-3xl text-[9px] font-bold z-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl border border-teal-500/20">
            <p className="text-teal-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">Current Personnel on Leave</p>
            <p className="leading-relaxed">{detail}</p>
         </div>
      )}
    </div>
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-sm`}>
      <Icon size={28} className={color} />
    </div>
  </motion.div>
);

const STATUS_CONFIG = {
  ACTIVE: { label: "Clocked In", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500" },
  ON_BREAK: { label: "On Break", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", dot: "bg-amber-500" },
  COMPLETED: { label: "Finished", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", dot: "bg-slate-400" },
  Late: { label: "Late Day", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", dot: "bg-rose-500" },
  Present: { label: "Present", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500" },
  Absent: { label: "Absent", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", dot: "bg-rose-500" },
  ON_LEAVE: { label: "Authorized Absence", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", dot: "bg-teal-500" },
};

const AttendanceTable = ({ data, onOverride }) => {
  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[9px] font-black text-gray-400">
            <th className="px-8 py-6">Personnel</th>
            <th className="px-6 py-6">Check In / Out</th>
            <th className="px-6 py-6 text-center">Break</th>
            <th className="px-6 py-6">Duration</th>
            <th className="px-6 py-6">Shift Log</th>
            <th className="px-6 py-6">Status</th>
            <th className="px-8 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => {
            const empName = row.empId?.firstName ? `${row.empId.firstName} ${row.empId.lastName}` : (row.empId?.name ? row.empId.name : (row.empId?.basic?.firstName ? `${row.empId.basic.firstName} ${row.empId.basic.lastName}` : "Personnel"));
            const state = STATUS_CONFIG[row.status] || STATUS_CONFIG["Present"];

            return (
              <tr key={row._id} className="hover:bg-slate-50/10 transition-colors group">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                         <img 
                           src={row.empId?.avatar || `https://ui-avatars.com/api/?name=${row.empId?.firstName || 'P'}+${row.empId?.lastName || ''}&background=random`} 
                           className="w-full h-full object-cover" 
                           alt="" 
                         />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-[#042f2e]">{empName}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{row.empId?.department || "General"}</div>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-center min-w-[55px]">
                         <span className="text-[8px] font-black text-slate-400 block tracking-tight">IN</span>
                         <span className="text-[11px] font-black text-[#042f2e]">{row.checkIn || "--:--"}</span>
                      </div>
                      <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-center min-w-[55px]">
                         <span className="text-[8px] font-black text-slate-400 block tracking-tight">OUT</span>
                         <span className="text-[11px] font-black text-[#042f2e]">{row.checkOut || "--:--"}</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5 text-center">
                   <span className="text-xs font-bold text-slate-400">{row.totalBreakTime || 0}m</span>
                </td>
                <td className="px-6 py-5 font-black text-sm text-[#042f2e]">
                   {row.workedHours || "0h 0m"}
                </td>
                <td className="px-6 py-5 max-w-[200px]">
                   <p className="text-xs text-slate-400 line-clamp-1 italic truncate">
                      {row.notes ? `“${row.notes}”` : "-"}
                   </p>
                </td>
                <td className="px-6 py-5">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${state.bg} ${state.color} ${state.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
                      {state.label}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button onClick={() => onOverride(row)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                      <Edit3 size={18} />
                   </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const LeaveRequestsTable = ({ data, employees, onApprove, onReject, onEdit }) => {
  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[9px] font-black text-gray-400">
            <th className="px-8 py-5">Employee</th>
            <th className="px-6 py-5">Leave Details</th>
            <th className="px-6 py-5">Duration</th>
            <th className="px-6 py-5">Reason</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((req) => {
            const resolveId = (id) => (id && typeof id === 'object') ? (id._id || id.id) : id;
            const emp = employees.find((e) => String(e.id) === String(resolveId(req.empId)));
            const empName = emp?.name || (req.empId?.firstName ? `${req.empId.firstName} ${req.empId.lastName}` : "Personnel");
            const style = LEAVE_STATUS_CONFIG[req.status] || LEAVE_STATUS_CONFIG["Pending"];

            return (
              <tr key={req.id} className="hover:bg-teal-50/10 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img 
                      src={emp?.avatar || (req.empId?.avatar || `https://ui-avatars.com/api/?name=${emp?.name || 'User'}&background=random`)} 
                      alt="" 
                      className="w-10 h-10 rounded-xl border border-gray-100" 
                    />
                    <div className="text-sm font-bold text-[#042f2e]">{empName}</div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-[#042f2e]">{req.type}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    {new Date(req.from).toLocaleDateString()} to {new Date(req.to).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-6 py-5 font-black text-sm text-teal-600">{req.days} Days</td>
                <td className="px-6 py-5">
                  <p className="text-xs text-gray-500 max-w-[200px] line-clamp-2 italic">“{req.reason}”</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.color} ${style.border}`}>
                    <style.icon size={12} />
                    {req.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {req.status === "Pending" && (
                      <>
                        <button onClick={() => onApprove(req.id)} className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><Check size={16} /></button>
                        <button onClick={() => onReject(req.id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"><X size={16} /></button>
                      </>
                    )}
                    <button onClick={() => onEdit(req)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-[#042f2e] hover:text-white transition-all shadow-sm"><Edit3 size={16} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

const Attendance = () => {
  const { user } = useAuth();
  const { employees, attendance, setAttendance, leaveRequests, setLeaveRequests, refreshGlobal } = useGlobal();
  const [activeTab, setActiveTab] = useState("daily");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingLeave, setEditingLeave] = useState(null);

  // Stats
  const statCounts = useMemo(() => {
    const todayRecords = attendance.filter(a => a.date === date);
    const present = todayRecords.filter((a) => ["Present", "Late", "ACTIVE", "COMPLETED", "ON_BREAK"].includes(a.status)).length;
    const leave = todayRecords.filter((a) => a.status === "ON_LEAVE").length;
    return {
      present,
      absent: Math.max(0, employees.length - present - leave),
      leave,
      late: todayRecords.filter((a) => a.status === "Late").length,
    };
  }, [attendance, date, employees.length]);

  const handleApprove = async (id) => {
    try {
      await fetch(`${API_URL}/attendance/leaves/${id}`, {
         method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
         body: JSON.stringify({ status: "Approved" })
      });
      if (refreshGlobal) await refreshGlobal();
    } catch(err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`${API_URL}/attendance/leaves/${id}`, {
         method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
         body: JSON.stringify({ status: "Rejected" })
      });
      if (refreshGlobal) await refreshGlobal();
    } catch (err){ console.error(err); }
  };

  const [errors, setErrors] = useState({});

  const validateLeaveEdit = () => {
     const errs = {};
     if (!editingLeave.reason || !editingLeave.reason.trim()) errs.reason = "Reason is mandatory for audit trails";
     if (!editingLeave.from) errs.from = "Start date required";
     if (!editingLeave.to) errs.to = "End date required";
     if (editingLeave.from && editingLeave.to && editingLeave.to < editingLeave.from) errs.to = "End date conflict";
     
     setErrors(errs);
     return Object.keys(errs).length === 0;
  };

  const handleUpdateLeave = async (e) => {
     if (e) e.preventDefault();
     if (!validateLeaveEdit()) return;

     try {
        const id = editingLeave.id || editingLeave._id;
        const res = await fetch(`${API_URL}/attendance/leaves/${id}`, {
           method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
           body: JSON.stringify(editingLeave)
        });
        if (res.ok) {
           if (refreshGlobal) await refreshGlobal();
           setEditingLeave(null);
           setErrors({});
        }
     } catch (err) { console.error(err); }
  };

  const activeData = useMemo(() => {
    const s = search.toLowerCase();
    const resolveEmpId = (id) => (id && typeof id === 'object') ? (id._id || id.id) : id;

    if (activeTab === "daily") {
       return attendance.filter((a) => {
          const isToday = a.date === date;
          const emp = employees.find((e) => String(e.id) === String(resolveEmpId(a.empId)));
          const nameMatches = emp?.name.toLowerCase().includes(s) || (a.empId?.firstName ? `${a.empId.firstName} ${a.empId.lastName}`.toLowerCase().includes(s) : false);
          return isToday && nameMatches;
       });
    } else {
       return leaveRequests.filter((r) => {
          const emp = employees.find((e) => String(e.id) === String(resolveEmpId(r.empId)));
          return emp?.name.toLowerCase().includes(s);
       });
    }
  }, [attendance, leaveRequests, activeTab, date, search, employees]);

  return (
    <AdminLayout title="Attendance & Workforce">
      <div className="space-y-8 animate-in pb-20">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <CalendarIcon size={18} className="text-teal-500" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-[20px] text-sm font-black text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/50 shadow-sm transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-[#042f2e] hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={16} className="text-gray-400" />
              Filter Team
            </button>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="flex flex-1 items-center gap-3 bg-white border border-gray-100 px-4 py-2.5 rounded-[20px] shadow-sm group focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/50 transition-all">
              <Search
                size={18}
                className="text-gray-400 group-focus-within:text-teal-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Search employee by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-[#042f2e] w-full placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Present Today"
            value={statCounts.present}
            icon={UserCheck}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label="Absent"
            value={statCounts.absent}
            icon={UserX}
            color="text-rose-600"
            bg="bg-rose-50"
          />
          <StatCard
            label="Staff on Leave Today"
            value={statCounts.leave}
            icon={Users}
            color="text-teal-600"
            bg="bg-teal-50"
            detail={attendance.filter(a => a.status === 'ON_LEAVE').map(a => a.empId?.firstName ? `${a.empId.firstName} ${a.empId.lastName}` : "Employee").join(', ') || "Everyone is working today!"}
          />
          <StatCard
            label="Late Entries"
            value={statCounts.late}
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* Main Section: Tab System */}
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm min-h-[500px] flex flex-col">
          {/* Tabs Navigation */}
          <div className="flex items-center space-x-8 px-10 pt-8 border-b border-gray-50">
            {[
              { id: "daily", label: "Daily Attendance", icon: SquareMenu },
              { id: "leave", label: "Leave Requests", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-5 text-xs font-black uppercase tracking-widest relative transition-all ${activeTab === tab.id ? "text-teal-600" : "text-gray-300 hover:text-gray-400"}`}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full"
                  />
                )}
                {tab.id === "leave" &&
                  leaveRequests.filter((r) => r.status === "Pending").length >
                    0 && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm">
                      {
                        leaveRequests.filter((r) => r.status === "Pending")
                          .length
                      }
                    </span>
                  )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === "daily" ? (
                  <AttendanceTable
                    data={activeData}
                    employees={employees}
                    onOverride={(row) =>
                      alert(`Override for ${employees.find((e) => e.id === row.empId)?.name}`)
                    }
                  />
                ) : (
                  <LeaveRequestsTable
                    data={activeData}
                    employees={employees}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEdit={setEditingLeave}
                  />
                )}

                {activeData.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                      <Search size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching records found</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Leave Modal */}
      <AnimatePresence>
        {editingLeave && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setEditingLeave(null)}
               className="absolute inset-0 bg-[#042f2e]/40 backdrop-blur-sm" 
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-teal-500/10"
            >
               <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <h3 className="text-xl font-bold text-[#042f2e]">Modify Request</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Executive Override</p>
                  </div>
                  <button onClick={() => setEditingLeave(null)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleUpdateLeave} className="p-8 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Leave Category</label>
                     <select 
                        value={editingLeave.type}
                        onChange={e => setEditingLeave({...editingLeave, type: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all"
                     >
                        <option>Annual Leave</option>
                        <option>Sick Leave</option>
                        <option>Compensatory Off</option>
                        <option>Bereavement</option>
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Effective From</label>
                        <input 
                           type="date"
                           value={editingLeave.from ? new Date(editingLeave.from).toISOString().split('T')[0] : ''}
                           onChange={e => setEditingLeave({...editingLeave, from: e.target.value})}
                           className={`w-full bg-gray-50 border rounded-2xl px-5 py-3 text-sm font-bold text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all ${errors.from ? "border-rose-500 bg-rose-50/30" : "border-gray-100"}`}
                        />
                        {errors.from && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{errors.from}</p>}
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Effective To</label>
                        <input 
                           type="date"
                           value={editingLeave.to ? new Date(editingLeave.to).toISOString().split('T')[0] : ''}
                           onChange={e => setEditingLeave({...editingLeave, to: e.target.value})}
                           className={`w-full bg-gray-50 border rounded-2xl px-5 py-3 text-sm font-bold text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all ${errors.to ? "border-rose-500 bg-rose-50/30" : "border-gray-100"}`}
                        />
                        {errors.to && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{errors.to}</p>}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Management Reason</label>
                     <textarea 
                        value={editingLeave.reason}
                        onChange={e => setEditingLeave({...editingLeave, reason: e.target.value})}
                        className={`w-full bg-gray-50 border rounded-2xl px-5 py-3 text-sm font-bold text-[#042f2e] min-h-[100px] resize-none focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all ${errors.reason ? "border-rose-500 bg-rose-50/30" : "border-gray-100"}`}
                     />
                     {errors.reason && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{errors.reason}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                     <button 
                        type="button"
                        onClick={async () => {
                           const updated = {...editingLeave, status: 'Rejected'};
                           setEditingLeave(updated);
                           // Manually trigger update with the new status
                           const res = await fetch(`${API_URL}/attendance/leaves/${updated.id || updated._id}`, {
                              method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                              body: JSON.stringify(updated)
                           });
                           if (res.ok) {
                              const data = await res.json();
                              setLeaveRequests(prev => prev.map(r => (r.id === data._id || r._id === data._id) ? { ...r, ...data, id: data._id } : r));
                              setEditingLeave(null);
                           }
                        }}
                        className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                     >
                        Reject
                     </button>
                     <button 
                        type="button"
                        onClick={async () => {
                           const updated = {...editingLeave, status: 'Approved'};
                           setEditingLeave(updated);
                           const res = await fetch(`${API_URL}/attendance/leaves/${updated.id || updated._id}`, {
                              method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                              body: JSON.stringify(updated)
                           });
                           if (res.ok) {
                              const data = await res.json();
                              setLeaveRequests(prev => prev.map(r => (r.id === data._id || r._id === data._id) ? { ...r, ...data, id: data._id } : r));
                              setEditingLeave(null);
                           }
                        }}
                        className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                     >
                        Approve
                     </button>
                     <button 
                        type="submit"
                        className="flex-[2] py-4 bg-[#042f2e] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-900 transition-all shadow-xl shadow-teal-900/10"
                     >
                        Save & Sync
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Attendance;
