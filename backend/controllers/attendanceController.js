import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';

export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ company: req.user.company })
      .populate('empId', 'firstName lastName');
    res.json(attendance);
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
