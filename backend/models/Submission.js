import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  contestId: Number,
  index: String,
  name: String,
  type: String,
  points: Number,
  rating: Number,
  tags: [String]
}, { _id: false });

const memberSchema = new mongoose.Schema({
  handle: String
}, { _id: false });

const authorSchema = new mongoose.Schema({
  contestId: Number,
  members: [memberSchema],
  participantType: String,
  ghost: Boolean,
  room: Number,
  startTimeSeconds: Number
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submissionId: {
    type: Number,
    required: true,
    index: true
  },
  contestId: {
    type: Number,
    index: true
  },
  creationTimeSeconds: Number,
  relativeTimeSeconds: Number,
  problem: problemSchema, 
  author: authorSchema,   
  programmingLanguage: String,
  verdict: String,
  testset: String,
  passedTestCount: Number,
  timeConsumedMillis: Number,
  memoryConsumedBytes: Number,
  submissionDate: Date
}, {
  timestamps: true
});

submissionSchema.index({ studentId: 1, submissionId: 1 }, { unique: true });const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
