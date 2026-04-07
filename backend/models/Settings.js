import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  pinCode: {
    type: String,
    default: '',
  },
  gstNo: {
    type: String,
    default: '',
  },
  tanNo: {
    type: String,
    default: '',
  },
  cinNo: {
    type: String,
    default: '',
  },
  udyamNo: {
    type: String,
    default: '',
  },
  aadhaar: {
    type: String,
    default: '',
  },
  cstNo: {
    type: String,
    default: '',
  },
  payrollLocked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Settings', SettingsSchema);
