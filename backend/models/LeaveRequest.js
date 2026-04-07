import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  company: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('LeaveRequest', LeaveRequestSchema);
