import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// Components
import HeroAttendanceCard from "../../components/employee/dashboard/HeroAttendanceCard";
import QuickActionsStrip from "../../components/employee/dashboard/QuickActionsStrip";
import TaskPreviewWidget from "../../components/employee/dashboard/TaskPreviewWidget";
import ApprovalStatusCards from "../../components/employee/dashboard/ApprovalStatusCards";
import LeaveBalanceCard from "../../components/employee/dashboard/LeaveBalanceCard";
import PayrollSnapshotCard from "../../components/employee/dashboard/PayrollSnapshotCard";
import AttendanceTimeline from "../../components/employee/dashboard/AttendanceTimeline";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/employee-self/dashboard`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        const result = await res.json();
        if (res.ok) {
           setData(result);
        } else {
           setError(result.message || "Access Denied");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Network connection interrupted");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchDashboard();
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
      <EmployeeLayout title="Dashboard Overview">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Synchronizing Profile...
            </p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (error || !data) {
    return (
      <EmployeeLayout title="Dashboard Unavailable">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="max-w-md text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-[#042f2e] mb-2">{error || "Personnel Profile Missing"}</h3>
            <p className="text-slate-500 text-sm mb-6">
              This dashboard requires an active Employee record. Admin accounts must use the Administrative control panel.
            </p>
            <a href="/" className="inline-block px-6 py-2.5 bg-[#042f2e] text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
              Return to Home
            </a>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout title="Dashboard Overview">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-10"
      >
        {/* Top Hero Section — Full Width */}
        <motion.div variants={itemVariants} className="col-span-12">
          <HeroAttendanceCard data={data.attendance} employee={data.employee} />
        </motion.div>

        {/* Quick Actions — Moved Up */}
        <motion.div variants={itemVariants} className="pt-2">
          <div className="mb-4 px-1 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Self Service Portal</h3>
            <div className="h-px flex-1 bg-slate-100 mx-6" />
          </div>
          <QuickActionsStrip />
        </motion.div>

        {/* Main Content Grid — Asymmetrical */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column — Big Work Center (Span 8) */}
          <div className="lg:col-span-8 space-y-8 flex flex-col">
            <motion.div variants={itemVariants} className="flex-1">
              <TaskPreviewWidget tasks={data.tasks} />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AttendanceTimeline attendance={data.attendance} />
            </motion.div>
          </div>

          {/* Right Column — Status & Finance (Span 4) */}
          <div className="lg:col-span-4 space-y-8 flex flex-col">
            <motion.div variants={itemVariants}>
              <LeaveBalanceCard leave={data.leave} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <PayrollSnapshotCard payroll={data.payroll} />
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
              <ApprovalStatusCards request={data.requests[0]} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </EmployeeLayout>

  );
};

export default Dashboard;
