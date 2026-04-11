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
        const doc = r.toObject();
        
        const parseTimeStr = (t) => {
           if (!t || t === '--') return null;
           // Match format like "03:52 pm" or "3:52 PM"
           const parts = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
           if (!parts) return null;
           let h = parseInt(parts[1]);
           const m = parseInt(parts[2]);
           const mod = parts[3].toUpperCase();
           if (mod === 'PM' && h !== 12) h += 12;
           if (mod === 'AM' && h === 12) h = 0;
           return h * 60 + m;
        };

        const startMins = parseTimeStr(doc.checkIn);
        const endMins = parseTimeStr(doc.checkOut);

        // Dynamic Late Detection for Admin Side
        let finalStatus = doc.status;
        if (startMins !== null && startMins > (9 * 60 + 30)) {
           finalStatus = 'Late';
        }

        if (startMins !== null && endMins !== null) {
           const diffMins = endMins - startMins - (doc.totalBreakTime || 0);
           const h = Math.floor(Math.max(0, diffMins) / 60);
           const m = Math.max(0, diffMins) % 60;
           worked = `${h}h ${m}m`;
        } else if (doc.status === 'COMPLETED' || doc.status === 'ACTIVE' || doc.status === 'ON_BREAK') {
           worked = doc.totalWorkingHours || '0h 0m';
        }

        return { ...doc, workedHours: worked, status: finalStatus };
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

    // Notify the ADMIN (since employee is applying)
    // Find an admin for this company or just notify the HR group
    // For now, let's notify the current user (if employee) and also the admin could be hardcoded?
    // Actually, usually we notify the recipient. 
    // If employee applies, notify Admin. If Admin applies for employee, notify Employee.
    
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
    ).populate('empId');

    // Notify the employee about the result
    if (leave.empId && leave.empId.user) {
       await Notification.create({
          type: status === 'Approved' ? 'success' : 'alert',
          title: `Time-Off ${status}`,
          desc: `Your leave request from ${leave.from} has been ${status.toLowerCase()}.`,
          userId: leave.empId.user
       });
    }

    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

