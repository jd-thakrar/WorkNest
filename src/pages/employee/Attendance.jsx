import React, { useState, useEffect } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// Components
import PunchPanel from "../../components/employee/attendance/PunchPanel";
import TodayTimeline from "../../components/employee/attendance/TodayTimeline";
import MonthlyAttendance from "../../components/employee/attendance/MonthlyAttendance";
import StatusChips from "../../components/employee/attendance/StatusChips";

const Attendance = () => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendanceData = async () => {
    try {
      const [dashRes, histRes] = await Promise.all([
        fetch(`${API_URL}/employee-self/dashboard`, { headers: { "Authorization": `Bearer ${user.token}` } }),
        fetch(`${API_URL}/employee-self/attendance`, { headers: { "Authorization": `Bearer ${user.token}` } })
      ]);
      
      const dashData = await dashRes.json();
      const histData = await histRes.json();

      if (dashRes.ok) setSessionData(dashData.attendance);
      if (histRes.ok) setHistory(histData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAttendanceData();
  }, [user]);

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

  if (isLoading) {
    return (
      <EmployeeLayout title="Attendance Tracking">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout title="Attendance & Time Tracking">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 pb-10"
      >
        {/* ZONE 1 — PRIMARY ACTION & STATS */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <PunchPanel initialData={sessionData} onPunchSuccess={fetchAttendanceData} />
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm h-full flex items-center">
              <StatusChips history={history} />
            </div>
          </motion.div>
        </div>

        {/* ZONE 3 — MAIN TRACKING GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          {/* Column 1: Activity Stream */}
          <div className="xl:col-span-1">
            <motion.div variants={itemVariants}>
              <TodayTimeline record={history.find(r => r.date === new Date().toISOString().split('T')[0])} />
            </motion.div>
          </div>

          {/* Column 2-4: Monthly Log */}
          <div className="xl:col-span-3">
            <motion.div variants={itemVariants}>
              <MonthlyAttendance history={history} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </EmployeeLayout>
  );
};

export default Attendance;
