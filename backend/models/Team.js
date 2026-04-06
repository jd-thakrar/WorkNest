import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Team lead is required']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  projects: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: 'bg-teal-50 text-teal-600 border-teal-100'
  },
  company: {
    type: String,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
