import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  break: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'], required: true },
  company: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);
