import React, { useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { API_URL } from "../config";

export const GlobalProvider = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollStatus, setPayrollStatus] = useState(() => {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    return {
      isLocked: false,
      cycle: prevMonthDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    window.innerWidth < 1024,
  );

  // Synchronize ALL backend data seamlessly to remove dummy data permanently
  const syncGlobalData = async () => {
    if (!user) return;
    setLoading(true);
    try {

      const headers = { Authorization: `Bearer ${user.token}` };

      // If employee, limit initial fetches to avoid 401s
      if (user.role === "admin") {
        const [empRes, teamRes, taskRes, attRes, leaveRes, payRes] =
          await Promise.all([
            fetch(`${API_URL}/employees`, { headers }),
            fetch(`${API_URL}/teams`, { headers }),
            fetch(`${API_URL}/tasks`, { headers }),
            fetch(`${API_URL}/attendance`, { headers }),
            fetch(`${API_URL}/attendance/leaves`, { headers }),
            fetch(`${API_URL}/payroll`, { headers }),
          ]);

        let rawEmps = [];
        if (empRes.ok) rawEmps = await empRes.json();

        if (rawEmps.length > 0) {
          setEmployees(formatEmployees(rawEmps));
        }

        if (teamRes.ok) setTeams(formatTeams(await teamRes.json()));
        if (taskRes.ok) setTasks(formatTasks(await taskRes.json()));
        if (attRes.ok) setAttendance(formatAttendance(await attRes.json()));
        if (leaveRes.ok) setLeaveRequests(formatLeaves(await leaveRes.json()));
        if (payRes.ok) setFinancials(formatFinancials(await payRes.json()));
      } else {
        // Employee Logic: Fetch only what's allowed via self endpoints
        const [dashRes, taskRes, attRes, leaveRes] = await Promise.all([
          fetch(`${API_URL}/employee-self/dashboard`, { headers }),
          fetch(`${API_URL}/employee-self/tasks`, { headers }),
          fetch(`${API_URL}/employee-self/attendance`, { headers }),
          fetch(`${API_URL}/employee-self/leaves`, { headers }),
        ]);

        if (dashRes.ok) {
          const dash = await dashRes.json();
          // Inject themselves into employee list for context compatibility
          setEmployees([
            {
              id: user.id || user._id,
              ...dash.employee,
              name: `${dash.employee.firstName} ${dash.employee.lastName}`,
            },
          ]);
        }

        if (taskRes.ok) {
          const data = await taskRes.json();
          setTasks(data.tasks.map((t) => ({ ...t, name: t.title })));
        }

        if (attRes.ok) setAttendance(await attRes.json());
        if (leaveRes.ok) {
          const lData = await leaveRes.json();
          setLeaveRequests(lData.requests);
        }
      }
    } catch (err) {
      console.error("Global Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };


  // Helper formatters to keep code clean
  const formatEmployees = (raw) =>
    raw.map((e) => ({
      id: e._id,
      name: `${e.firstName} ${e.lastName}`,
      role: e.designation,
      dept: e.department,
      avatar: `https://ui-avatars.com/api/?name=${e.firstName}+${e.lastName}&background=random`,
      email: e.email,
      status: "Active",
      type: e.type,
      joiningDate: e.joiningDate || e.createdAt,
      ctc: Number(e.ctc || 0),
      basic: Number(e.basic || 0),
      hra: Number(e.hra || 0),
      travel: Number(e.travel || 0),
      daily: Number(e.daily || 0),
      otherAllowances: e.otherAllowances || [],
      baseSalary: Number(e.salary || e.basicSalary || e.basic || e.rate || 0),
      hraAmount: Number(e.hra || 0),
      totalAllowances:
        Number(e.travel || 0) +
        Number(e.daily || 0) +
        (Array.isArray(e.otherAllowances)
          ? e.otherAllowances.reduce((sum, i) => sum + Number(i.amount || 0), 0)
          : 0),
      pan: e.pan,
      accountNumber: e.accountNumber,
      pfEnabled: Boolean(e.pfEnabled),
      pfEmployee: Number(e.pfEmployee || 0),
      profTax: Boolean(e.profTax),
      tds: Boolean(e.tds),
      otherDeductions: e.otherDeductions || [],
      totalOtherDeduct: Array.isArray(e.otherDeductions)
        ? e.otherDeductions.reduce((sum, i) => sum + Number(i.amount || 0), 0)
        : 0,
    }));


  const formatTeams = (raw) =>
    raw.map((t) => ({
      id: t._id,
      name: t.name,
      color: t.color || "blue",
      lead: t.lead ? t.lead._id : null,
      membersRaw: t.members,
    }));

  const formatTasks = (raw) =>
    raw.map((t) => ({
      id: t._id,
      name: t.name,
      description: t.description,
      priority: t.priority,
      teamId: t.teamId?._id,
      teamName: t.teamId?.name,
      members: (t.members || []).map((m) => m._id || m),

      startDate: t.startDate?.split("T")[0],
      endDate: t.endDate?.split("T")[0],
      status: t.status,
      category: t.category,
    }));

  const formatAttendance = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((a) => ({
      ...a,
      id: a._id,
      empId: a.empId,
      date: a.date,
      checkIn: a.checkIn,
      checkOut: a.checkOut,
      status: a.status,
      workedHours: a.workedHours
    }));
  };

  const formatLeaves = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((l) => ({
      ...l,
      id: l._id,
      empId: l.empId,
      type: l.type,
      from: l.from,
      to: l.to,
      days: l.days,
      reason: l.reason,
      status: l.status,
    }));
  };

  const formatFinancials = (raw) =>
    raw.map((p) => ({
      _id: p._id,
      id: p.empId?._id || p.empId,
      month: p.month,
      basic: p.basic,
      hra: p.hra,
      allowances: p.allowances,
      gross: p.gross,
      deductions: p.deductions,
      reimbursements: p.reimbursements || 0,
      lop: p.lop || 0,
      loanDeduction: p.loanDeduction || 0,
      net: p.net,
      status: p.status,
    }));

  useEffect(() => {
    syncGlobalData();
  }, [user]);

  // Derived teams
  const teamsWithMembers = teams.map((t) => ({
    ...t,
    members: employees.filter((e) =>
      t.membersRaw?.some((rm) => {
        const rmId = typeof rm === "object" ? rm._id || rm.id : rm;
        return String(rmId) === String(e.id);
      }),
    ),
  }));

  const lockPayroll = (val) =>
    setPayrollStatus((prev) => ({ ...prev, isLocked: val }));

  return (
    <GlobalContext.Provider
      value={{
        employees,
        setEmployees,
        financials,
        setFinancials,
        tasks,
        setTasks,
        attendance,
        setAttendance,
        teams,
        setTeams,
        teamsWithMembers,
        leaveRequests,
        setLeaveRequests,
        payrollStatus,
        lockPayroll,
        sidebarCollapsed,
        setSidebarCollapsed,
        refreshGlobal: syncGlobalData,
        loading,
      }}

    >
      {children}
    </GlobalContext.Provider>
  );
};
