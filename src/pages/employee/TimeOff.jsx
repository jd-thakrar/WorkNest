import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, History, CalendarCheck } from "lucide-react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// Components
import LeaveHistoryTable from "../../components/employee/time-off/LeaveHistoryTable";
import ApplyLeaveForm from "../../components/employee/time-off/ApplyLeaveForm";
import LeaveSummaryStrip from "../../components/employee/time-off/LeaveSummaryStrip";

const TimeOff = () => {
  const { user } = useAuth();
  const [leaveStats, setLeaveStats] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_URL}/employee-self/leaves`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLeaveStats(data.stats);
        setLeaveHistory(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLeaves();
  }, [user]);

  const handleRequestSubmit = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/employee-self/apply-leave`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchLeaves(); // Refresh data
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

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
    <EmployeeLayout title="Time Off & Leave Management">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 pb-20"
      >
        {/* Row 1 — Balance Summary Strip */}
        <motion.div variants={itemVariants}>
          <LeaveSummaryStrip stats={leaveStats} />
        </motion.div>

        {/* Row 2 — Main Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Column 1-2: Request History */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 flex flex-col">
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex-1 flex flex-col">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                        <History size={18} />
                     </div>
                     <div>
                        <h4 className="text-[14px] font-bold text-[#042f2e] tracking-tight">Request History</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Review status of your leave applications</p>
                     </div>
                  </div>
                  <button className="text-[11px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest px-3 py-1.5 bg-teal-50/50 rounded-md transition-colors">
                     View All Records
                  </button>
               </div>
               <div className="flex-1">
                  <LeaveHistoryTable history={leaveHistory} />
               </div>
            </div>

            {/* Quick Actions / Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 bg-teal-900 rounded-xl relative overflow-hidden group">
                  <div className="relative z-10">
                     <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 leading-none">Sick Leave Policy</p>
                     <p className="text-[12px] font-bold text-white tracking-tight leading-relaxed max-w-[240px]">
                        Medical certificates are mandatory for any unplanned sick leave exceeding 2 working days.
                     </p>
                  </div>
                  <Clock className="absolute right-[-10px] bottom-[-10px] text-teal-700/30 group-hover:text-teal-500/10 transition-colors pointer-events-none" size={100} strokeWidth={1} />
               </div>
               <div className="p-5 bg-white border border-slate-200/60 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                     <CalendarCheck size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Planned Time Off</p>
                     <p className="text-[14px] font-bold text-[#042f2e] tracking-tight">Next: <span className="text-orange-600">{leaveStats?.upcoming ? `${leaveStats.upcoming.range} — ${leaveStats.upcoming.type}` : 'No Approved Leaves'}</span></p>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Column 3: Application Form */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <ApplyLeaveForm onSubmit={handleRequestSubmit} stats={leaveStats} />
          </motion.div>

        </div>
      </motion.div>
    </EmployeeLayout>
  );
};

export default TimeOff;
