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

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between"
  >
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-[#042f2e]">{value}</p>
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
            const empName = row.empId?.firstName ? `${row.empId.firstName} ${row.empId.lastName}` : "Personnel";
            const state = STATUS_CONFIG[row.status] || STATUS_CONFIG["Present"];

            return (
              <tr key={row._id} className="hover:bg-slate-50/10 transition-colors group">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                         <img src={row.empId?.avatar || "/default-avatar.png"} className="w-full h-full object-cover" alt="" />
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

const LeaveRequestsTable = ({ data, employees, onApprove, onReject }) => {
  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Employee
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Leave Details
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Duration
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Reason
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Status
            </th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((req) => {
            const emp = employees.find((e) => e.id === req.empId);
            const style =
              LEAVE_STATUS_CONFIG[req.status] || LEAVE_STATUS_CONFIG["Pending"];

            return (
              <tr
                key={req.id}
                className="hover:bg-teal-50/10 transition-colors"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={emp?.avatar}
                      alt=""
                      className="w-10 h-10 rounded-xl border border-gray-100"
                    />
                    <div className="text-sm font-bold text-[#042f2e]">
                      {emp?.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-[#042f2e]">{req.type}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    {req.from} to {req.to}
                  </p>
                </td>
                <td className="px-6 py-5 font-black text-sm text-teal-600">
                  {req.days} Days
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs text-gray-500 max-w-[200px] line-clamp-2 italic">
                    “{req.reason}”
                  </p>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.color} ${style.border}`}
                  >
                    <style.icon size={12} />
                    {req.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {req.status === "Pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onApprove(req.id)}
                        className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button className="text-gray-300 hover:text-gray-500 transition-colors">
                      <Info size={20} />
                    </button>
                  )}
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
  const {
    employees,
    attendance,
    setAttendance,
    leaveRequests,
    setLeaveRequests,
  } = useGlobal();
  const [activeTab, setActiveTab] = useState("daily");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("2026-03-15");

  // Stats
  const statCounts = useMemo(
    () => ({
      present: attendance.filter(
        (a) => a.status === "Present" || a.status === "Late",
      ).length,
      absent: attendance.filter((a) => a.status === "Absent").length,
      leave: attendance.filter((a) => a.status === "On Leave").length,
      late: attendance.filter((a) => a.status === "Late").length,
    }),
    [attendance],
  );

  const handleApprove = async (id) => {
    try {
      await fetch(`${API_URL}/attendance/leaves/${id}`, {
         method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
         body: JSON.stringify({ status: "Approved" })
      });
      setLeaveRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
      const req = leaveRequests.find((r) => r.id === id);
      if (req) setAttendance((prev) => prev.map((a) => a.empId === req.empId ? { ...a, status: "On Leave" } : a));
    } catch(err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`${API_URL}/attendance/leaves/${id}`, {
         method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
         body: JSON.stringify({ status: "Rejected" })
      });
      setLeaveRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
    } catch (err){ console.error(err); }
  };

  const activeData =
    activeTab === "daily"
      ? attendance.filter((a) =>
          employees
            .find((e) => e.id === a.empId)
            ?.name.toLowerCase()
            .includes(search.toLowerCase()),
        )
      : leaveRequests.filter((r) =>
          employees
            .find((e) => e.id === r.empId)
            ?.name.toLowerCase()
            .includes(search.toLowerCase()),
        );

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
            label="On Leave"
            value={statCounts.leave}
            icon={Users}
            color="text-teal-600"
            bg="bg-teal-50"
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
                      alert(
                        `Override requested for ${employees.find((e) => e.id === row.empId)?.name}`,
                      )
                    }
                  />
                ) : (
                  <LeaveRequestsTable
                    data={activeData}
                    employees={employees}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                )}

                {activeData.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                      <Search size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      No matching records found
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Attendance;
