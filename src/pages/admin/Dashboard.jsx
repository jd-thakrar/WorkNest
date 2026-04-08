import React, { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import ChartContainer from "../../components/admin/ChartContainer";
import ActivityFeed from "../../components/admin/ActivityFeed";
import DeadlinesWidget from "../../components/admin/DeadlinesWidget";
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
  Wallet,
  UserPlus,
  PlusCircle,
  PlayCircle,
  FileText,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGlobal } from "../../context/GlobalContext.jsx";

// Dynamic Dashboard Data logic calculated directly inside the component

const Dashboard = () => {
  const { employees, tasks, attendance, financials, payrollStatus } = useGlobal();
  const navigate = useNavigate();
  const [activePoint, setActivePoint] = useState(null);

  // Timezone-safe local date string builder (YYYY-MM-DD)
  const getLocalDate = (dateObj) => 
     `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  // Derive dynamic metrics replacing dummy data
  const DASHBOARD_DATA = React.useMemo(() => {
     // Line Chart for past 10 days
     const lineChart = [];
     for(let i=9; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = i === 0 ? "Today" : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const dayIso = getLocalDate(d);
        const v = tasks.filter(t => t.endDate === dayIso || t.startDate === dayIso).length;
        lineChart.push({ day: dayStr, v });
     }
     
     // Attendance Pulse
     const attChart = [];
     for(let i=9; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = i === 0 ? "Today" : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const dayIso = getLocalDate(d);
        const dayAtts = attendance.filter(a => a.date === dayIso);
        attChart.push({ 
           d: dayStr, 
           p: dayAtts.filter(a => ['Present', 'ACTIVE', 'ON_BREAK', 'COMPLETED', 'Late'].includes(a.status)).length,
           l: dayAtts.filter(a => a.status === 'Late').length,
           a: dayAtts.filter(a => a.status === 'Absent').length
        });
     }

     const totalNet = financials.filter(f => f.month === payrollStatus.cycle).reduce((acc, f) => acc + (f.net || 0), 0);
     const disbursedNet = financials.filter(f => f.month === payrollStatus.cycle).reduce((acc, f) => acc + (f.status === 'Paid' ? (f.net || 0) : 0), 0);
     const pendingNet = totalNet - disbursedNet;
     
     const payroll = {
        total: `₹${totalNet.toLocaleString()}`,
        disbursed: `₹${disbursedNet.toLocaleString()}`,
        pending: `₹${pendingNet.toLocaleString()}`,
        draft: "₹0",
        percents: { 
           disbursed: totalNet > 0 ? (disbursedNet / totalNet) * 100 : 0, 
           pending: totalNet > 0 ? (pendingNet / totalNet) * 100 : 0, 
           draft: 0 
        }
     };

     const counts = {};
     tasks.forEach(t => {
       if ((t.status === 'Completed' || t.status === 'In Progress') && t.members) {
          t.members.forEach(mId => counts[mId] = (counts[mId] || 0) + 1);
       }
     });
     const topPerformers = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,3).map(([mId, score]) => {
         const e = employees.find(emp => emp.id === mId);
         return { name: e?.name || "Unknown", dept: e?.dept || "Staff", score, p: `${Math.min(score * 20, 100)}%` };
     });

     return { lineChart, attendance: attChart, payroll, topPerformers };
  }, [tasks, attendance, financials, payrollStatus, employees]);

  // Derived stats
  const activeTasksCount = tasks.filter((t) => t.status !== "Completed").length;
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;

  const todayIso = getLocalDate(new Date());
  const presentToday = attendance.filter((a) => ['Present', 'ACTIVE', 'ON_BREAK', 'COMPLETED', 'Late'].includes(a.status) && a.date === todayIso).length;
  const tasksDueTodayCount = tasks.filter(t => t.endDate === todayIso).length;

  const currentStats = {
    totalEmployees: employees.length,
    activeTasks: activeTasksCount,
    presentToday: `${presentToday}/${employees.length}`,
    attendanceRate: employees.length > 0 ? `${Math.round((presentToday / employees.length) * 100)}%` : "0%",
    payrollPending: DASHBOARD_DATA.payroll.pending,
  };

  const handleAction = (act) => {
    if (act === "Add Employee") navigate("/app/employees");
    else if (act === "Create Task") navigate("/app/tasks");
    else if (act === "Run Payroll") navigate("/app/payroll");
    else if (act === "Generate Report") navigate("/app/reports");
    else alert(`Action [${act}] triggered.`);
  };

  const kpis = [
    {
      label: "Total Employees",
      value: currentStats.totalEmployees,
      trend: "₹50k/ea",
      trendUp: true,
      icon: Users,
      accent: "teal",
    },
    {
      label: "Active Tasks",
      value: currentStats.activeTasks,
      trend: `${tasks.filter((t) => t.status === "In Progress").length} IP + ${tasks.filter((t) => t.status === "Pending").length} PND`,
      trendUp: false,
      icon: CheckCircle2,
      accent: "emerald",
    },
    {
      label: "Tasks Due Today",
      value: tasksDueTodayCount,
      trend: "High Priority",
      trendUp: true,
      icon: Clock,
      accent: "amber",
    },
    {
      label: "Attendance Today",
      value: currentStats.presentToday,
      trend: currentStats.attendanceRate,
      trendUp: true,
      icon: CalendarDays,
      accent: "teal",
    },
    {
      label: "Net Payroll (Current)",
      value: DASHBOARD_DATA.payroll.total,
      trend: `Paid: ${DASHBOARD_DATA.payroll.disbursed} | Rem: ${DASHBOARD_DATA.payroll.pending}`,
      trendUp: true,
      icon: Wallet,
      accent: "rose",
    },
  ];

  return (
    <AdminLayout title="Operational Intel">
      <div className="space-y-8 animate-in pb-20">
        {/* Row 0: Quick Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
          <div className="max-w-md">
            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
              Micro-Management Mode: Monitoring
              <span className="text-teal-600 font-bold">
                {" "}
                {currentStats.totalEmployees} Employees{" "}
              </span>
              and{" "}
              <span className="text-teal-600 font-bold">
                ~{tasks.length} Active Tasks
              </span>
              .
            </p>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            {[
              {
                label: "Add Employee",
                icon: UserPlus,
                color: "bg-[#042f2e] text-white",
              },
              {
                label: "Create Task",
                icon: PlusCircle,
                color: "bg-white text-[#042f2e] border border-gray-100",
              },
              {
                label: "Run Payroll",
                icon: PlayCircle,
                color: "bg-white text-[#042f2e] border border-gray-100",
              },
              {
                label: "Generate Report",
                icon: FileText,
                color: "bg-white text-[#042f2e] border border-gray-100",
              },
            ].map((btn, i) => (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                key={i}
                onClick={() => handleAction(btn.label)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all whitespace-nowrap ${btn.color}`}
              >
                <btn.icon size={16} />
                {btn.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Row 1: KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {kpis.map((kpi, i) => (
            <StatCard key={i} {...kpi} />
          ))}
        </div>

        {/* Row 2: Charts (Tasks) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section 2: Task Completion Trend (PRECISION ALIGNMENT) */}
          <ChartContainer
            title="Productivity Momentum"
            subtitle="Hover or Click date/dots for precision telemetry"
            className="lg:col-span-8"
          >
            <div className="h-[320px] w-full relative">
              {/* Y Axis Highlight Layer */}
              <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-4 text-[9px] font-bold text-gray-300 pointer-events-none tracking-widest leading-none z-10 w-full">
                {[10, 8, 6, 4, 2, 0].map((v) => (
                  <div key={v} className="flex items-center gap-2 group/y">
                    <span className="w-6">{v}</span>
                    <div className="flex-1 h-px bg-gray-100 opacity-20" />
                  </div>
                ))}
              </div>

              <div className="ml-8 h-full relative">
                {/* SVG Line Chart with Accurate Coordinates */}
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 1000 300"
                >
                  {/* Line Path */}
                  <path
                    d={DASHBOARD_DATA.lineChart.reduce(
                      (acc, p, i) =>
                        acc +
                        `${i === 0 ? "M" : "L"} ${(i * 1000) / 9}, ${300 - p.v * 30}`,
                      "",
                    )}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Precision Points with Axis Highlighters */}
                  {DASHBOARD_DATA.lineChart.map((p, i) => {
                    const x = (i * 1000) / 9;
                    const y = 300 - p.v * 30;
                    const isActive = activePoint === i;

                    return (
                      <g
                        key={i}
                        className="group/point cursor-pointer"
                        onMouseEnter={() => setActivePoint(i)}
                        onMouseLeave={() => setActivePoint(null)}
                        onClick={() => setActivePoint(i)}
                      >
                        {/* Axis Highlight Lines - Persistent if active */}
                        <line
                          x1={x}
                          y1={y}
                          x2={x}
                          y2="300"
                          stroke="#0d9488"
                          strokeWidth={isActive ? "2" : "1"}
                          strokeDasharray="4"
                          className={`${isActive ? "opacity-60" : "opacity-0"} group-hover/point:opacity-40 transition-opacity`}
                        />
                        <line
                          x1={x}
                          y1={y}
                          x2="0"
                          y2={y}
                          stroke="#0d9488"
                          strokeWidth={isActive ? "2" : "1"}
                          strokeDasharray="4"
                          className={`${isActive ? "opacity-60" : "opacity-0"} group-hover/point:opacity-40 transition-opacity`}
                        />

                        {/* Pulse Ring for Active Point */}
                        {isActive && (
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="none"
                            stroke="#0d9488"
                            strokeWidth="2"
                            className="animate-ping opacity-30"
                          />
                        )}

                        {/* Dot - Exactly on line */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? "8" : "6"}
                          fill={isActive ? "#0d9488" : "white"}
                          stroke="#042f2e"
                          strokeWidth="3"
                          className="group-hover/point:r-8 group-hover/point:fill-teal-500 transition-all"
                        />

                        {/* Data Label (Tooltip) */}
                        <foreignObject
                          x={x - 40}
                          y={y - 50}
                          width="80"
                          height="40"
                          className={`${isActive ? "opacity-100" : "opacity-0"} group-hover/point:opacity-100 transition-all pointer-events-none`}
                        >
                          <div className="bg-[#042f2e] text-white p-1.5 rounded-lg shadow-2xl text-center border border-teal-500/30">
                            <div className="text-[7px] font-bold uppercase text-teal-400">
                              {p.day}
                            </div>
                            <div className="text-[10px] font-bold">
                              {p.v} Tasks
                            </div>
                          </div>
                        </foreignObject>

                        {/* Target Marker for easier hover */}
                        <rect
                          x={x - 15}
                          y="0"
                          width="30"
                          height="300"
                          fill="transparent"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X Axis Labels with Linkage */}
                <div className="absolute -bottom-8 w-full flex justify-between px-2 text-[9px] font-bold uppercase tracking-widest leading-none">
                  {DASHBOARD_DATA.lineChart.map((p, i) => (
                    <span
                      key={i}
                      onMouseEnter={() => setActivePoint(i)}
                      onMouseLeave={() => setActivePoint(null)}
                      onClick={() => setActivePoint(i)}
                      className={`cursor-pointer pb-4 transition-all duration-300 ${activePoint === i ? "text-teal-600 scale-125" : "text-gray-300 hover:text-teal-400"}`}
                    >
                      {p.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ChartContainer>

          {/* Section 3: Workload Balance (TOTAL TASK STATUS DATA) */}
          <ChartContainer
            title="Workload Balance"
            subtitle="Overall Task Distribution"
            className="lg:col-span-4 "
          >
            <div className="h-[320px] flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 group/donut cursor-pointer">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#0d9488"
                    strokeWidth="12"
                    strokeDasharray="251"
                    strokeDashoffset="125"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#fbbf24"
                    strokeWidth="12"
                    strokeDasharray="251"
                    strokeDashoffset="210"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e11d48"
                    strokeWidth="12"
                    strokeDasharray="251"
                    strokeDashoffset="240"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-3xl font-bold text-[#042f2e]"
                  >
                    {tasks.length}
                  </span>
                  <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                    Total Tasks
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-10 w-full px-4">
                {[
                  {
                    label: "DONE",
                    count: completedTasksCount,
                    c: "text-teal-600",
                    bg: "bg-teal-500",
                  },
                  {
                    label: "PROG",
                    count: tasks.filter((t) => t.status === "In Progress")
                      .length,
                    c: "text-amber-600",
                    bg: "bg-amber-400",
                  },
                  {
                    label: "PEND",
                    count: tasks.filter((t) => t.status === "Pending").length,
                    c: "text-rose-600",
                    bg: "bg-rose-500",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="text-center group/item hover:scale-110 transition-transform"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${s.bg} mx-auto mb-1.5`}
                    />
                    <div className={`text-sm font-bold ${s.c}`}>{s.count}</div>
                    <div className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartContainer>
        </div>

        {/* Row 3: Attendance Analytics (MICRO-SCALE 10 EMPLOYEES) */}
        <ChartContainer
          title="Attendance Pulse"
          subtitle="Labor Presence for 10 Personnel (Daily Flow)"
        >
          <div className="h-[300px] w-full mt-4 flex items-end justify-between px-4 pb-10 gap-4">
            {DASHBOARD_DATA.attendance.map((row, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end max-w-[80px] relative"
              >
                {/* Precision Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 z-50 bg-[#042f2e] text-white p-2 rounded-xl text-[8px] font-bold whitespace-nowrap shadow-2xl">
                  <div className="text-teal-400">Present: {row.p}/10</div>
                  <div className="text-amber-400">Late: {row.l}</div>
                  <div className="text-rose-400">Absent: {row.a}</div>
                </div>

                <div className="flex-1 w-full flex flex-col justify-end gap-1 min-h-[200px]">
                  {/* Present Segment */}
                  {row.p > 0 && (
                    <div
                      className="w-full bg-[#042f2e] rounded-md transition-all duration-500 hover:brightness-125"
                      style={{ height: `${row.p * 10}%` }}
                    />
                  )}
                  {/* Late/Leave Segment */}
                  {row.l > 0 && (
                    <div
                      className="w-full bg-amber-400 rounded-md transition-all duration-500 hover:brightness-110"
                      style={{ height: `${row.l * 10}%` }}
                    />
                  )}
                  {/* Absent Segment */}
                  {row.a > 0 && (
                    <div
                      className="w-full bg-rose-500 rounded-md transition-all duration-500 hover:brightness-110"
                      style={{ height: `${row.a * 10}%` }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest group-hover/bar:text-[#042f2e]">
                  {row.d}
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* Row 4: Payroll & Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartContainer
            title="Payroll Distribution"
            subtitle="Processing Stages Q1 2024"
          >
            <div className="space-y-12 py-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <TrendingUp size={18} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Total Monthly Payroll
                      </p>
                      <p className="text-xl font-bold text-[#042f2e]">
                        {DASHBOARD_DATA.payroll.total}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-4 bg-gray-50 rounded-2xl overflow-hidden flex border border-black/5">
                  <div
                    style={{
                      width: `${DASHBOARD_DATA.payroll.percents.disbursed}%`,
                    }}
                    className="h-full bg-teal-500"
                  />
                  <div
                    style={{
                      width: `${DASHBOARD_DATA.payroll.percents.pending}%`,
                    }}
                    className="h-full bg-teal-300"
                  />
                  <div
                    style={{
                      width: `${DASHBOARD_DATA.payroll.percents.draft}%`,
                    }}
                    className="h-full bg-amber-400"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    {
                      label: "DISBURSED",
                      val: DASHBOARD_DATA.payroll.disbursed,
                      c: "text-teal-600",
                    },
                    {
                      label: "PENDING",
                      val: DASHBOARD_DATA.payroll.pending,
                      c: "text-teal-300",
                    },
                    {
                      label: "DRAFT",
                      val: DASHBOARD_DATA.payroll.draft,
                      c: "text-amber-500",
                    },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100"
                    >
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {p.label}
                      </p>
                      <p className={`text-sm font-bold ${p.c}`}>{p.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ChartContainer>

          <ChartContainer
            title="Elite Performers"
            subtitle="Tasks Completed This Period"
          >
            <div className="space-y-6 pt-4">
              {DASHBOARD_DATA.topPerformers.map((emp, i) => (
                <div key={i} className="group cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-[#042f2e] group-hover:bg-[#042f2e] group-hover:text-white transition-all">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#042f2e]">
                          {emp.name}
                        </p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                          {emp.dept}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#042f2e]">
                        {emp.score}{" "}
                        <span className="text-[8px] text-gray-400">PTS</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#042f2e] rounded-full"
                      style={{ width: emp.p }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ChartContainer
            title="Command Center Log"
            subtitle="Real-time Telemetry"
            className="lg:col-span-7"
          >
            <ActivityFeed />
          </ChartContainer>
          <ChartContainer
            title="Strategic Deadlines"
            subtitle="Attention Required"
            className="lg:col-span-5"
          >
            <DeadlinesWidget />
          </ChartContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
