import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  contestId: {
    type: Number,
    required: true
  },
  contestName: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  oldRating: {
    type: Number,
    required: true
  },
  newRating: {
    type: Number,
    required: true
  },
  ratingChange: {
    type: Number,
    required: true
  },
  ratingUpdateTimeSeconds: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

contestSchema.index({ studentId: 1, contestId: 1 }, { unique: true });
contestSchema.index({ studentId: 1, date: -1 });

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;
