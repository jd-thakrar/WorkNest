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
        due: t.endDate ? new Date(t.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No Date'
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
    const requests = await LeaveRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const leaveStats = {
      remaining: 12, // Placeholder
      total: 24,
      upcoming: { range: 'No Upcoming', reason: '--' },
      nextHoliday: 'Holi (Mar 25)' // Placeholder
    };

    // 5. Attendance Summary
    const attendanceRecords = await Attendance.find({ 
       employeeId: employee._id,
       date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    }).sort({ date: 1 });

    const attendanceSummary = {
      status: 'Ready', 
      mode: 'Office',
      lastPunch: 'Not Punched',
      timer: '00:00:00',
      weeklyStatus: attendanceRecords.map(a => ({
         day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'narrow' }),
         status: a.status === 'Present' ? 'present' : 'absent'
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
        date: new Date(r.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      })),
      leave: leaveStats,
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

    const tasks = await Task.find({ members: employee._id })
      .sort({ endDate: 1 });

    const mappedTasks = tasks.map(t => ({
      id: t._id,
      title: t.name,
      priority: t.priority,
      due: t.status === 'Completed' ? 'Closed' : (t.endDate < new Date() ? 'Overdue' : new Date(t.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
      status: t.status === 'Completed' ? 'Done' : (t.endDate < new Date() ? 'Overdue' : 'Active'),
      time: '0h 0m' 
    }));

    res.json(mappedTasks);
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
    let record = await Attendance.findOne({ 
      empId: employee._id, 
      date: today 
    });

    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!record) {
      // First punch of the day -> Check-In
      record = await Attendance.create({
        empId: employee._id,
        date: today,
        checkIn: currentTime,
        status: 'Present',
        company: req.user.company,
      });
    } else if (!record.checkOut) {
      // Already checked in -> Check-Out
      record.checkOut = currentTime;
      await record.save();
    } else {
      return res.status(400).json({ message: 'Daily session already completed' });
    }

    res.json({
      status: record.checkOut ? 'Ready' : 'Clocked In',
      lastPunch: currentTime,
      timer: '00:00:00'
    });

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

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
