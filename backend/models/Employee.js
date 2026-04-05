import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  // Step 1: Basic Details
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  joiningDate: { type: Date, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  location: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, enum: ['Full-time', 'Freelancer'], default: 'Full-time' },

  // Step 2: Statutory
  profTax: { type: Boolean, default: false },
  pfEnabled: { type: Boolean, default: false },
  pfEmployee: { type: Number, default: 12 },
  pfEmployer: { type: Number, default: 12 },
  pfPension: { type: Number, default: 8.33 },
  tds: { type: Boolean, default: false },
  otherDeductions: [{ label: String, amount: Number }],

  // Step 3: Personal & ID
  fatherName: { type: String },
  address: { type: String },
  aadhaar: { type: String },
  pan: { type: String },
  dob: { type: Date },
  differentlyAbled: { type: Boolean, default: false },

  // Step 4: Bank Details
  bankName: { type: String },
  accountHolder: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String },
  accountType: { type: String },

  // Step 5: Salary Setup
  ctc: { type: Number },
  basic: { type: Number },
  hra: { type: Number },
  travel: { type: Number },
  daily: { type: Number },
  otherAllowances: [{ label: String, amount: Number }],
  carPerquisite: { type: Number },
  otherPerquisites: [{ label: String, amount: Number }],

  // Relationships
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('Employee', EmployeeSchema);
