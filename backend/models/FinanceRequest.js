import mongoose from 'mongoose';

const FinanceRequestSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['Reimbursement', 'Loan'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  
  // For Reimbursement
  receipt: { type: String }, // URL/Path to image
  
  // For Loan
  totalAmount: { type: Number },
  monthlyEMI: { type: Number },
  tenureMonths: { type: Number },
  remainingMonths: { type: Number },
  deductFromPayroll: { type: Boolean, default: false },
  
  processedMonth: { type: String }, // Format: "April 2026"
  isDisbursed: { type: Boolean, default: false },
  
  company: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('FinanceRequest', FinanceRequestSchema);
