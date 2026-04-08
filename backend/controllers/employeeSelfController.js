import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';

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
      status: record?.status === 'ACTIVE' ? 'Clocked In' : (record?.status === 'ON_BREAK' ? 'On Break' : (record?.status === 'COMPLETED' ? 'Session Secured' : 'Ready')), 
      mode: 'Office',
      lastPunch: record?.checkIn || 'Not Punched',
      timer: '00:00:00',
      notes: record?.notes || '',
      weeklyStatus: history.slice(0, 7).map(a => ({
         day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'narrow' }),
         status: a.status === 'COMPLETED' || a.status === 'ACTIVE' || a.status === 'Late' ? 'present' : 'absent'
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

    // 4. Punch Out (ACTIVE -> COMPLETED)
    if (record.status === 'ACTIVE') {
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

    if (record.status === 'ACTIVE') {
      // Start Break: ACTIVE -> ON_BREAK
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

    res.json(mappedHistory);
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
