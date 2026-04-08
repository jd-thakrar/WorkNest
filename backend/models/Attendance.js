import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: String },
  checkOut: { type: String },
  breaks: [{
    start: { type: String },
    end: { type: String }
  }],
  totalBreakTime: { type: Number, default: 0 }, // in minutes
  totalWorkingHours: { type: String, default: '0h 0m' },
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'ACTIVE', 'ON_BREAK', 'COMPLETED', 'Present', 'Absent', 'Late', 'ON_LEAVE'], 
    default: 'NOT_STARTED' 
  },
  notes: { type: String, default: '' },
  company: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);
