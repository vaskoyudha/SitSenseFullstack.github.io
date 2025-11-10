import mongoose from 'mongoose';

const postureDataSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Raw sensor data
    fsr: {
      type: Number,
      default: 0,
    },
    backDist: {
      type: Number, // in cm
      default: null,
    },
    neckDist: {
      type: Number, // in cm
      default: null,
    },
    // Calculated scores
    scores: {
      back: {
        type: Number,
        default: 0,
      },
      neck: {
        type: Number,
        default: 0,
      },
      pressure: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    // Balance data
    balance: {
      fsrPct: {
        type: Number,
        default: 0,
      },
      neckBackBalance: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
postureDataSchema.index({ sessionId: 1, timestamp: -1 });
postureDataSchema.index({ userId: 1, timestamp: -1 });
postureDataSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index to auto-delete old data after 90 days (optional)
// postureDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const PostureData = mongoose.model('PostureData', postureDataSchema);

export default PostureData;

