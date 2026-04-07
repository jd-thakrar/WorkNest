import React, { useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { API_URL } from "../config";

export const GlobalProvider = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [financials, setFinancials] = useState({});
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollStatus, setPayrollStatus] = useState({
    isLocked: false,
    cycle: "March 2026",
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  // Synchronize ALL backend data seamlessly to remove dummy data permanently
  const syncGlobalData = async () => {
    if (!user) return;
    try {
      const headers = { "Authorization": `Bearer ${user.token}` };
      const [empRes, teamRes, taskRes, attRes, leaveRes, payRes] = await Promise.all([
        fetch(`${API_URL}/employees`, { headers }),
        fetch(`${API_URL}/teams`, { headers }),
        fetch(`${API_URL}/tasks`, { headers }),
        fetch(`${API_URL}/attendance`, { headers }),
        fetch(`${API_URL}/attendance/leaves`, { headers }),
        fetch(`${API_URL}/payroll`, { headers })
      ]);

      if (empRes.ok) {
        const emps = await empRes.json();
        // Flatten into required format for UI
        setEmployees(emps.map(e => ({ 
           id: e._id, name: `${e.firstName} ${e.lastName}`, 
           role: e.designation, dept: e.department, 
           avatar: `https://ui-avatars.com/api/?name=${e.firstName}+${e.lastName}&background=random`,
           email: e.email, status: 'Active', type: e.type,
           baseSalary: Number(e.salary || e.basicSalary || e.basic || e.rate || 25000),
           hraAmount: Number(e.hra || 10000),
           totalAllowances: Number(e.travel || 0) + Number(e.daily || 0) + (Array.isArray(e.otherAllowances) ? e.otherAllowances.reduce((sum, i) => sum + Number(i.amount || 0), 0) : 0),
           pfEnabled: Boolean(e.pfEnabled),
           pfEmployee: Number(e.pfEmployee || 0),
           profTax: Boolean(e.profTax),
           tds: Boolean(e.tds),
           totalOtherDeduct: Array.isArray(e.otherDeductions) ? e.otherDeductions.reduce((sum, i) => sum + Number(i.amount || 0), 0) : 0
        })));
      }
      if (teamRes.ok) {
         const tms = await teamRes.json();
         setTeams(tms.map(t => ({ id: t._id, name: t.name, color: t.color || 'blue', lead: t.lead ? t.lead._id : null, membersRaw: t.members })));
      }
      if (taskRes.ok) {
         const tsks = await taskRes.json();
         setTasks(tsks.map(t => ({
            id: t._id, name: t.name, description: t.description, priority: t.priority,
            teamId: t.teamId?._id, teamName: t.teamId?.name, 
            members: t.members.map(m => m._id),
            startDate: t.startDate?.split('T')[0], endDate: t.endDate?.split('T')[0],
            status: t.status, category: t.category
         })));
      }
      if (attRes.ok) {
         const atts = await attRes.json();
         setAttendance(atts.map(a => ({
           id: a._id, empId: a.empId._id, date: a.date, checkIn: a.checkIn, checkOut: a.checkOut, status: a.status
         })));
      }
      if (leaveRes.ok) {
         const lvs = await leaveRes.json();
         setLeaveRequests(lvs.map(l => ({
           id: l._id, empId: l.empId._id, type: l.type, from: l.from, to: l.to, days: l.days, reason: l.reason, status: l.status
         })));
      }
      // Populate payroll/financials
      if (payRes.ok) {
          const pays = await payRes.json();
          // Store raw array of all historical payroll records
          setFinancials(pays.map(p => ({
            id: p.empId._id, 
            month: p.month, 
            basic: p.basic, 
            hra: p.hra, 
            allowances: p.allowances, 
            gross: p.gross, 
            deductions: p.deductions, 
            net: p.net, 
            status: p.status 
          })));
      }
    } catch (err) { console.error("Global Sync Error:", err); }
  };

  useEffect(() => { syncGlobalData(); }, [user]);

  // Derived teams
  const teamsWithMembers = teams.map((t) => ({
    ...t,
    members: employees.filter((e) => 
      t.membersRaw?.some(rm => {
         const rmId = typeof rm === 'object' ? (rm._id || rm.id) : rm;
         return String(rmId) === String(e.id);
      })
    ),
  }));

  const lockPayroll = (val) =>
    setPayrollStatus((prev) => ({ ...prev, isLocked: val }));

  return (
    <GlobalContext.Provider
      value={{
        employees, setEmployees,
        financials, setFinancials,
        tasks, setTasks,
        attendance, setAttendance,
        teams, setTeams,
        teamsWithMembers,
        leaveRequests, setLeaveRequests,
        payrollStatus, lockPayroll,
        sidebarCollapsed, setSidebarCollapsed,
        refreshGlobal: syncGlobalData
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
