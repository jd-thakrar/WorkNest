import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import FinanceRequest from '../models/FinanceRequest.js';

// @desc    Get complete dashboard data for the logged-in employee
// @route   GET /api/employee-self/dashboard
// @access  Private/Employee
export const getEmployeeDashboard = async (req, res) => {
  try {
    // 1. Get the Employee Profile link to the User
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // 2. Fetch Active Tasks
    const activeTasks = await Task.find({ 
      members: employee._id, 
      status: { $ne: 'Completed' } 
    }).sort({ endDate: 1 }).limit(6);

    const taskStats = {
      activeCount: await Task.countDocuments({ members: employee._id, status: { $ne: 'Completed' } }),
      overdueCount: await Task.countDocuments({ 
        members: employee._id, 
        status: { $ne: 'Completed' },
        endDate: { $lt: new Date() }
      }),
      preview: activeTasks.map(t => ({
        id: t._id,
        title: t.name,
        priority: t.priority,
        due: t.endDate ? new Date(t.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No Date',
        status: t.status
      }))
    };

    // 3. Fetch Recent Payroll
    const recentPayroll = await Payroll.findOne({ empId: employee._id })
      .sort({ createdAt: -1 });

    const payrollSnapshot = {
      lastAmount: recentPayroll ? `₹${recentPayroll.net.toLocaleString('en-IN')}` : '₹0',
      lastDate: recentPayroll ? new Date(recentPayroll.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A',
      loanEMI: '₹0' // Placeholder for now
    };

    // 4. Fetch Leave Requests
    const requests = await LeaveRequest.find({ empId: employee._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const leaveStats = {
      remaining: 12, 
      total: 24,
      upcoming: { range: 'No Upcoming', reason: '--' },
      nextHoliday: 'Holi (Mar 25)' 
    };

    // 5. Attendance Summary
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ empId: employee._id, date: today });

    const history = await Attendance.find({ 
       empId: employee._id 
    }).sort({ date: -1 });

    const lateDaysCount = history.filter(h => {
       if (!h.checkIn) return false;
       const [time, modifier] = h.checkIn.split(' ');
       let [hrs, mins] = time.split(':').map(Number);
       if (modifier === 'PM' && hrs !== 12) hrs += 12;
       if (modifier === 'AM' && hrs === 12) hrs = 0;
       return (hrs > 9) || (hrs === 9 && mins > 15);
    }).length;

    const attendanceSummary = {
      status: (record?.status === 'ACTIVE' || record?.status === 'Late' || record?.status === 'Present') 
        ? 'Clocked In' 
        : (record?.status === 'ON_BREAK' ? 'On Break' : (record?.status === 'COMPLETED' ? 'Session Secured' : 'Ready')), 
      mode: 'Office',
      lastPunch: record?.checkIn || 'Not Punched',
      timer: '00:00:00',
      notes: record?.notes || '',
      weeklyStatus: await Promise.all([6,5,4,3,2,1,0].map(async daysAgo => {
         const d = new Date(); d.setDate(d.getDate() - daysAgo);
         const dayIso = d.toISOString().split('T')[0];
         const dayAtt = history.find(a => a.date === dayIso);
         
         if (dayAtt) {
            return {
               day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
               status: (dayAtt.status === 'COMPLETED' || dayAtt.status === 'ACTIVE' || dayAtt.status === 'Late') ? 'present' : (dayAtt.status === 'ON_LEAVE' ? 'leave' : 'absent')
            };
         }
         
         // No attendance record, check for approved leaves
         const hasLeave = await LeaveRequest.findOne({
            empId: employee._id,
            status: 'Approved',
            from: { $lte: dayIso },
            to: { $gte: dayIso }
         });

         return {
            day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
            status: hasLeave ? 'leave' : 'absent'
         };
      }))
    };

    res.json({
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.designation,
        employeeId: employee.employeeId,
        avatar: req.user.avatar || '',
      },
      attendance: attendanceSummary,
      tasks: taskStats,
      requests: requests.map(r => ({
        id: r._id,
        type: 'Leave Request',
        status: r.status,
        date: new Date(r.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      })),
      leave: {
         ...leaveStats,
         lateDays: lateDaysCount
      },
      payroll: payrollSnapshot
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks assigned to the logged-in employee
// @route   GET /api/employee-self/tasks
// @access  Private/Employee
export const getEmployeeTasks = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Fetch Tasks
    const tasks = await Task.find({ members: employee._id })
      .sort({ endDate: 1 });

    const mappedTasks = tasks.map(t => ({
      id: t._id,
      title: t.name,
      description: t.description,
      priority: t.priority,
      due: t.status === 'Completed' ? 'Closed' : (new Date(t.endDate) < new Date() ? 'Overdue' : new Date(t.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
      endDate: t.endDate, // RAW date for counter calculation
      status: t.status, 
      time: '0h 0m' 
    }));

    // Calculate Weekly Hours from Attendance
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    monday.setHours(0,0,0,0);

    const weeklyAttendance = await Attendance.find({
       empId: employee._id,
       date: { $gte: monday.toISOString().split('T')[0] },
       status: 'COMPLETED'
    });

    let totalMinutes = 0;
    weeklyAttendance.forEach(att => {
       if (att.totalWorkingHours) {
          const [h, m] = att.totalWorkingHours.split('h ').map(s => parseInt(s));
          totalMinutes += (h * 60) + (isNaN(m) ? 0 : m);
       }
    });

    const hTotal = Math.floor(totalMinutes / 60);
    const mTotal = totalMinutes % 60;
    const weeklyHours = `${hTotal}h ${mTotal}m`;

    res.json({ tasks: mappedTasks, weeklyHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status by employee
// @route   PUT /api/employee-self/tasks/:id
// @access  Private/Employee
export const updateTaskStatus = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findOne({ _id: req.params.id, members: employee._id });
    if (!task) {
       return res.status(404).json({ message: 'Task not found or access denied' });
    }

    task.status = status;
    await task.save();

    res.json({ message: `Task marked as ${status}`, status: task.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Self-punch attendance (In/Out)
// @route   POST /api/employee-self/punch
// @access  Private/Employee
export const punchAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    let record = await Attendance.findOne({ empId: employee._id, date: today });

    // 1. Initial Check-In (NOT_STARTED -> ACTIVE/LATE)
    if (!record) {
      // Determine if Late (Office start: 09:00 AM, Grace: 15m)
      const [time, modifier] = currentTime.split(' ');
      let [hrs, mins] = time.split(':').map(Number);
      if (modifier === 'PM' && hrs !== 12) hrs += 12;
      if (modifier === 'AM' && hrs === 12) hrs = 0;
      
      const isLate = (hrs > 9) || (hrs === 9 && mins > 15);

      record = await Attendance.create({
        empId: employee._id,
        date: today,
        checkIn: currentTime,
        status: isLate ? 'Late' : 'ACTIVE',
        company: req.user.company,
      });
      return res.json({ message: isLate ? 'Late Entry Logged' : 'Entry Secured', status: record.status, time: currentTime });
    }

    // 2. Reject if COMPLETED 
    if (record.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Daily session already locked' });
    }

    // 3. Reject if ON_BREAK (Must end break before punch out)
    if (record.status === 'ON_BREAK') {
       return res.status(400).json({ message: 'Please secure break session first' });
    }

    // 4. Punch Out (ACTIVE/Late -> COMPLETED)
    if (record.status === 'ACTIVE' || record.status === 'Late') {
       record.checkOut = currentTime;
       record.status = 'COMPLETED';
       
       // Calculate Duration
       const start = new Date(`2000-01-01 ${record.checkIn}`);
       const endReal = new Date(`2000-01-01 ${currentTime}`);
       
       const totalMs = endReal - start - ((record.totalBreakTime || 0) * 60000);
       const h = Math.floor(totalMs / 3600000);
       const m = Math.floor((totalMs % 3600000) / 60000);
       record.totalWorkingHours = `${h}h ${m}m`;

       await record.save();
       return res.json({ message: 'System Secured', status: 'COMPLETED', hours: record.totalWorkingHours });
    }

    res.status(400).json({ message: 'Invalid Operation' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leave requests and stats for the logged-in employee
// @route   GET /api/employee-self/leaves
// @access  Private/Employee
export const getEmployeeLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    const requests = await LeaveRequest.find({ empId: employee._id }).sort({ createdAt: -1 });

    // Enterprise Calculation Engine
    const QUOTA = 24; // Yearly Baseline
    const approvedUsage = requests
      .filter(r => r.status === 'Approved' && new Date(r.from).getFullYear() === new Date().getFullYear())
      .reduce((acc, r) => acc + r.days, 0);
    
    const pendingUsage = requests
      .filter(r => r.status === 'Pending')
      .reduce((acc, r) => acc + r.days, 0);

    const upcoming = requests
      .filter(r => r.status === 'Approved' && new Date(r.from) >= new Date())
      .sort((a, b) => new Date(a.from) - new Date(b.from))[0];

    res.json({
      stats: {
        total: QUOTA,
        used: approvedUsage,
        balance: QUOTA - approvedUsage,
        pending: pendingUsage,
        upcoming: upcoming ? { 
           range: `${new Date(upcoming.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(upcoming.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
           type: upcoming.type
        } : null
      },
      requests: requests.map(r => ({
        id: r._id,
        type: r.type,
        from: r.from,
        to: r.to,
        days: r.days,
        status: r.status,
        reason: r.reason,
        appliedDate: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for new leave
// @route   POST /api/employee-self/apply-leave
// @access  Private/Employee
export const applyLeave = async (req, res) => {
  try {
    const { type, from, to, days, reason } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    // Verification: Days must be positive
    if (days <= 0) return res.status(400).json({ message: 'Invalid leave duration' });

    const leave = await LeaveRequest.create({
      empId: employee._id,
      type,
      from,
      to,
      days,
      reason,
      company: employee.company,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Application Transmitted', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle break for employee
// @route   POST /api/employee-self/break
// @access  Private/Employee
export const toggleBreak = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    let record = await Attendance.findOne({ empId: employee._id, date: today });

    if (!record || record.status === 'COMPLETED') {
      return res.status(400).json({ message: 'No active session' });
    }

    if (record.status === 'ACTIVE' || record.status === 'Late') {
      // Start Break: ACTIVE/Late -> ON_BREAK
      record.status = 'ON_BREAK';
      record.breaks.push({ start: currentTime });
      await record.save();
      return res.json({ message: 'Break Session Launched', status: 'ON_BREAK', time: currentTime });
    }

    if (record.status === 'ON_BREAK') {
      // Find the last break that hasn't ended 
      const lastBreak = record.breaks[record.breaks.length - 1];
      lastBreak.end = currentTime;
      
      // Calculate break duration
      const s = new Date(`2000-01-01 ${lastBreak.start}`);
      const e = new Date(`2000-01-01 ${currentTime}`);
      const diffMs = e - s;
      record.totalBreakTime += Math.floor(diffMs / 60000); // add minutes

      record.status = 'ACTIVE';
      await record.save();
      return res.json({ message: 'Break Session Secured', status: 'ACTIVE', time: currentTime });
    }

    res.status(400).json({ message: 'Operation not Allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for employee
// @route   GET /api/employee-self/attendance
// @access  Private/Employee
export const getEmployeeAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    const records = await Attendance.find({ empId: employee._id })
      .sort({ date: -1 })
      .limit(31);

    // Calculate working hours for each record
    const mappedHistory = records.map(r => {
       let worked = '0h 0m';
       if (r.checkIn && r.checkOut) {
          const start = new Date(`2000-01-01 ${r.checkIn}`);
          const end = new Date(`2000-01-01 ${r.checkOut}`);
          const diffMs = end - start - ((r.totalBreakTime || 0) * 60 * 1000);
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          worked = `${diffHrs}h ${diffMins}m`;
       }
       return { ...r._doc, workedHours: worked };
    });

    // Inject Leaves
    const leaves = await LeaveRequest.find({
       empId: employee._id,
       status: 'Approved'
    });

    const leaveRecords = [];
    leaves.forEach(l => {
       const start = new Date(l.from);
       const end = new Date(l.to);
       let curr = new Date(start);
       while (curr <= end) {
          // Only add if no attendance record exists for this date
          if (!records.some(r => r.date === curr.toISOString().split('T')[0])) {
             leaveRecords.push({
                _id: `l_${l._id}_${curr.getTime()}`,
                date: curr.toISOString().split('T')[0],
                status: 'ON_LEAVE',
                checkIn: '--',
                checkOut: '--',
                workedHours: '0h 0m',
                isLeave: true
             });
          }
          curr.setDate(curr.getDate() + 1);
       }
    });

    res.json([...mappedHistory, ...leaveRecords].sort((a,b) => b.date.localeCompare(a.date)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update daily notes/logs
// @route   POST /api/employee-self/notes
// @access  Private/Employee
export const updateNotes = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    const today = new Date().toISOString().split('T')[0];
    let record = await Attendance.findOne({ empId: employee._id, date: today });

    if (!record) return res.status(404).json({ message: 'No active session' });

    record.notes = req.body.notes || '';
    await record.save();

    res.json({ message: 'Log Updated', notes: record.notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit reimbursement claim with receipt
// @route   POST /api/employee-self/finance/reimbursement
// @access  Private/Employee
export const applyReimbursement = async (req, res) => {
  try {
    const { amount, description, type } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt document is required' });
    }

    const claim = await FinanceRequest.create({
      empId: employee._id,
      type: type || 'Reimbursement',
      amount: Number(amount),
      description: description || 'Expense Claim',
      receipt: req.file.filename, // Store the filename
      company: employee.company,
      status: 'Pending'
    });

    res.status(201).json({ 
      message: 'Claim transmitted successfully', 
      claim 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get complete finance data (claims, loans, payslips)
// @route   GET /api/employee-self/finance
// @access  Private/Employee
export const getFinanceData = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    const requests = await FinanceRequest.find({ empId: employee._id }).sort({ createdAt: -1 });
    const payrollList = await Payroll.find({ empId: employee._id }).sort({ createdAt: -1 });

    const recentPayroll = payrollList[0];
    const latestPayslip = recentPayroll ? { 
       month: recentPayroll.month, 
       net: recentPayroll.net,
       gross: recentPayroll.gross
    } : null;

    // Separate claims and loans
    const claims = requests.filter(r => r.type === 'Reimbursement');
    const loans = requests.filter(r => r.type === 'Loan');

    // Aggregate values
    const pendingClaimsCount = claims.filter(c => c.status === 'Pending').length;
    const pendingClaimsValue = claims.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);
    const ytdApproved = claims.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);

    const activeLoan = loans.find(l => l.remainingMonths > 0) || null;

    res.json({
      claims,
      loans,
      latestPayslip,
      stats: {
        pendingClaimsCount,
        pendingClaimsValue,
        ytdApproved,
        activeLoan
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for a personal loan
// @route   POST /api/employee-self/finance/loan
// @access  Private/Employee
export const applyLoan = async (req, res) => {
  try {
    const { amount, description, tenureMonths } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Personnel record not found' });

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid loan amount' });
    }

    if (!tenureMonths || tenureMonths <= 0) {
      return res.status(400).json({ message: 'Invalid tenure' });
    }

    const monthlyEMI = Math.round(Number(amount) / Number(tenureMonths));

    const loanRequest = await FinanceRequest.create({
      empId: employee._id,
      type: 'Loan',
      amount: Number(amount),
      description: description || 'Personal Loan Request',
      totalAmount: Number(amount),
      monthlyEMI,
      tenureMonths: Number(tenureMonths),
      remainingMonths: Number(tenureMonths),
      company: employee.company,
      status: 'Pending'
    });

    res.status(201).json({ 
      message: 'Loan application transmitted successfully', 
      loan: loanRequest 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
