import mongoose from 'mongoose';

const PayrollSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // Format: "March 2026"
  basic: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  gross: { type: Number, required: true },
  deductions: { type: Number, default: 0 },
  net: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processed', 'Paid'], default: 'Pending' },
  company: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Payroll', PayrollSchema);
