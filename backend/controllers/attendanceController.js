import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';

export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ company: req.user.company })
      .populate('empId', 'firstName lastName');
    res.json(attendance);
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
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { status: req.body.status },
      { new: true }
    );
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
