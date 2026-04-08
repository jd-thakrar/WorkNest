import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';

export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ company: req.user.company })
      .populate('empId', 'firstName lastName avatar department');
    
    // Fetch Approved Leaves to show in attendance list
    const leaves = await LeaveRequest.find({ company: req.user.company, status: 'Approved' })
      .populate('empId', 'firstName lastName avatar department text');

    // Create virtual records for leaves
    const leaveRecords = [];
    leaves.forEach(l => {
       const start = new Date(l.from);
       const end = new Date(l.to);
       let curr = new Date(start);
       
       while (curr <= end) {
          leaveRecords.push({
             _id: `leave_${l._id}_${curr.toISOString()}`,
             empId: l.empId,
             date: curr.toISOString().split('T')[0],
             status: 'ON_LEAVE',
             checkIn: '--',
             checkOut: '--',
             type: l.type,
             isLeave: true,
             workedHours: '0h 0m'
          });
          curr.setDate(curr.getDate() + 1);
       }
    });

    const mapped = attendance.map(r => {
       let worked = '0h 0m';
       if (r.checkIn && r.checkOut) {
          const start = new Date(`2000-01-01 ${r.checkIn}`);
          const end = new Date(`2000-01-01 ${r.checkOut}`);
          const diffMs = end - start - ((r.totalBreakTime || 0) * 60 * 1000);
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          worked = `${diffHrs}h ${diffMins}m`;
       } else if (r.status === 'COMPLETED') {
          worked = r.totalWorkingHours || '0h 0m';
       }
       return { ...r._doc, workedHours: worked };
    });

    res.json([...mapped, ...leaveRecords]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const { empId, date, checkIn, checkOut } = req.body;
    const attendance = await Attendance.create({
      empId,
      date,
      checkIn,
      checkOut,
      status: 'Present',
      company: req.user.company,
    });
    
    // Create Notification
    const emp = await Employee.findById(empId);
    await Notification.create({
      type: 'message',
      title: checkOut ? 'Check-Out Detected' : 'Check-In Detected',
      desc: `${emp.firstName} ${emp.lastName} has ${checkOut ? 'checked out of' : 'checked into'} the facility at ${checkOut || checkIn}.`,
      userId: req.user._id
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const att = await Attendance.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true, upsert: false } // Only updating existing for now
    );
    res.json(att);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ company: req.user.company })
      .populate('empId', 'firstName lastName');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      company: req.user.company,
    });

    // Create Notification
    const emp = await Employee.findById(req.body.empId);
    await Notification.create({
      type: 'warning',
      title: 'Leave Requisition',
      desc: `A new time-off request has been submitted by ${emp?.firstName} ${emp?.lastName}.`,
      userId: req.user._id
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { status, type, from, to, days, reason } = req.body;
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { status, type, from, to, days, reason },
      { new: true }
    );
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
