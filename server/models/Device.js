import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'SitSense Device',
    },
    metadata: {
      ip: {
        type: String,
        trim: true,
      },
      firmware: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ['online', 'offline', 'unknown'],
        default: 'unknown',
      },
      lastSeen: {
        type: Date,
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
deviceSchema.index({ userId: 1, deviceId: 1 });

const Device = mongoose.model('Device', deviceSchema);

export default Device;

