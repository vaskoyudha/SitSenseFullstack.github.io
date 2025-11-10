import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    stats: {
      totalReadings: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      goodPostureCount: {
        type: Number,
        default: 0,
      },
      badPostureCount: {
        type: Number,
        default: 0,
      },
      maxScore: {
        type: Number,
        default: 0,
      },
      minScore: {
        type: Number,
        default: 100,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ deviceId: 1, startTime: -1 });

// Calculate duration before saving
sessionSchema.pre('save', function (next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;

