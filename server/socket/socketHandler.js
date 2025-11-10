import Device from '../models/Device.js';
import Session from '../models/Session.js';
import PostureData from '../models/PostureData.js';
import { calculatePostureScore, calculateBalance } from '../utils/postureScoring.js';

// Store active connections
const activeConnections = new Map(); // deviceId -> { socketId, userId, device }

/**
 * Initialize Socket.io handlers
 * @param {Server} io - Socket.io server instance
 */
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle device registration
    socket.on('device:register', async (data) => {
      try {
        const { deviceId, metadata } = data;

        if (!deviceId) {
          socket.emit('error', { message: 'Device ID is required' });
          return;
        }

        // Find device in database
        const device = await Device.findOne({ deviceId });

        if (!device) {
          socket.emit('error', { message: 'Device not found. Please register device first.' });
          return;
        }

        // Store connection info
        activeConnections.set(deviceId, {
          socketId: socket.id,
          userId: device.userId.toString(),
          device: device._id.toString(),
        });

        // Update device metadata
        device.metadata = {
          ...device.metadata,
          ...metadata,
          status: 'online',
          lastSeen: new Date(),
        };
        await device.save();

        // Join device room for targeted broadcasts
        socket.join(`device:${deviceId}`);

        // Create or get active session
        let session = await Session.findOne({
          deviceId: device._id,
          userId: device.userId,
          isActive: true,
        });

        if (!session) {
          session = await Session.create({
            userId: device.userId,
            deviceId: device._id,
            startTime: new Date(),
            isActive: true,
          });
        }

        socket.emit('device:registered', {
          success: true,
          deviceId,
          sessionId: session._id.toString(),
        });

        // Notify all clients connected to this user
        io.to(`user:${device.userId}`).emit('device:connected', {
          deviceId,
          status: 'online',
        });

        console.log(`Device registered: ${deviceId} (Socket: ${socket.id})`);
      } catch (error) {
        console.error('Device registration error:', error);
        socket.emit('error', { message: 'Registration failed' });
      }
    });

    // Handle posture data from ESP32
    socket.on('posture:data', async (data) => {
      try {
        const { deviceId, fsr, ultrasonic } = data;

        if (!deviceId) {
          socket.emit('error', { message: 'Device ID is required' });
          return;
        }

        const connection = activeConnections.get(deviceId);
        if (!connection) {
          socket.emit('error', { message: 'Device not registered' });
          return;
        }

        // Extract sensor data
        const fsrVal = Number(fsr) || 0;
        let backDist = ultrasonic?.punggung_cm !== undefined ? Number(ultrasonic.punggung_cm) : null;
        let neckDist = ultrasonic?.leher_cm !== undefined ? Number(ultrasonic.leher_cm) : null;

        // Convert if values are too large (might be in different units)
        if (backDist !== null && backDist > 100) {
          const backMM = backDist / 10;
          const backCM = backDist / 100;
          if (backMM >= 5 && backMM <= 50) {
            backDist = backMM;
          } else if (backCM >= 5 && backCM <= 50) {
            backDist = backCM;
          }
        }

        if (neckDist !== null && neckDist > 100) {
          const neckMM = neckDist / 10;
          const neckCM = neckDist / 100;
          if (neckMM >= 20 && neckMM <= 100) {
            neckDist = neckMM;
          } else if (neckCM >= 20 && neckCM <= 100) {
            neckDist = neckCM;
          }
        }

        // Get active session
        const device = await Device.findById(connection.device);
        let session = await Session.findOne({
          deviceId: device._id,
          userId: device.userId,
          isActive: true,
        });

        if (!session) {
          // Create new session if none exists
          session = await Session.create({
            userId: device.userId,
            deviceId: device._id,
            startTime: new Date(),
            isActive: true,
          });
        }

        // Calculate scores
        const scores = calculatePostureScore(backDist || 0, neckDist || 0, fsrVal);
        const fsrPct = Math.round(Math.min(100, Math.max(0, (fsrVal / 4095) * 100)));
        const balance = calculateBalance(fsrPct, backDist, neckDist);

        // Save posture data to database
        const postureData = await PostureData.create({
          sessionId: session._id,
          deviceId: device._id,
          userId: device.userId,
          timestamp: new Date(),
          fsr: fsrVal,
          backDist,
          neckDist,
          scores,
          balance,
        });

        // Update session stats
        session.stats.totalReadings += 1;
        const totalScore = session.stats.averageScore * (session.stats.totalReadings - 1) + scores.total;
        session.stats.averageScore = Math.round(totalScore / session.stats.totalReadings);
        if (scores.total >= 80) session.stats.goodPostureCount += 1;
        if (scores.total < 60) session.stats.badPostureCount += 1;
        if (scores.total > session.stats.maxScore) session.stats.maxScore = scores.total;
        if (scores.total < session.stats.minScore && scores.total > 0) {
          session.stats.minScore = scores.total;
        }
        await session.save();

        // Prepare data for broadcast
        const broadcastData = {
          deviceId,
          timestamp: new Date().toISOString(),
          fsr: fsrVal,
          fsrPct,
          backDist,
          neckDist,
          scores,
          balance,
        };

        // Broadcast to all clients connected to this user
        io.to(`user:${device.userId}`).emit('posture:update', broadcastData);

        // Also broadcast to device-specific room
        io.to(`device:${deviceId}`).emit('posture:update', broadcastData);

        // Acknowledge to sender
        socket.emit('posture:ack', {
          success: true,
          timestamp: broadcastData.timestamp,
        });
      } catch (error) {
        console.error('Posture data processing error:', error);
        socket.emit('error', { message: 'Failed to process posture data' });
      }
    });

    // Handle device info updates
    socket.on('device:info', async (data) => {
      try {
        const { deviceId, info } = data;

        if (!deviceId) {
          socket.emit('error', { message: 'Device ID is required' });
          return;
        }

        const connection = activeConnections.get(deviceId);
        if (!connection) {
          socket.emit('error', { message: 'Device not registered' });
          return;
        }

        const device = await Device.findById(connection.device);
        device.metadata = {
          ...device.metadata,
          ...info,
          lastSeen: new Date(),
        };
        await device.save();

        // Broadcast device info update
        io.to(`user:${device.userId}`).emit('device:info:update', {
          deviceId,
          info: device.metadata,
        });
      } catch (error) {
        console.error('Device info update error:', error);
        socket.emit('error', { message: 'Failed to update device info' });
      }
    });

    // Handle client joining user room (for frontend connections)
    socket.on('user:join', async (data) => {
      try {
        const { userId } = data;
        if (userId) {
          socket.join(`user:${userId}`);
          console.log(`User ${userId} joined their room (Socket: ${socket.id})`);
        }
      } catch (error) {
        console.error('User join error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Find and remove connection
      for (const [deviceId, connection] of activeConnections.entries()) {
        if (connection.socketId === socket.id) {
          activeConnections.delete(deviceId);

          // Update device status
          try {
            const device = await Device.findOne({ deviceId });
            if (device) {
              device.metadata.status = 'offline';
              device.metadata.lastSeen = new Date();
              await device.save();

              // Notify clients
              io.to(`user:${device.userId}`).emit('device:disconnected', {
                deviceId,
                status: 'offline',
              });
            }
          } catch (error) {
            console.error('Error updating device on disconnect:', error);
          }

          break;
        }
      }
    });
  });

  console.log('Socket.io handlers initialized');
};

export default initializeSocket;

