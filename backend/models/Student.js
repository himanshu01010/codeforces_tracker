import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  codeforcesHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  lastEmailDate: {
    type: Date,
    default: null
  },
  lastSubmissionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
