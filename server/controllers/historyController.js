import Session from '../models/Session.js';
import PostureData from '../models/PostureData.js';

// @desc    Get history with filters
// @route   GET /api/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const { deviceId, startDate, endDate, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id, isActive: false };
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    const sessions = await Session.find(query)
      .populate('deviceId', 'deviceId name')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily statistics
// @route   GET /api/history/stats/daily
// @access  Private
export const getDailyStats = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const sessions = await Session.find({
      userId: req.user.id,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      isActive: false,
    });

    let totalDuration = 0;
    let totalScore = 0;
    let totalReadings = 0;
    let goodCount = 0;
    let badCount = 0;

    sessions.forEach((session) => {
      totalDuration += session.duration || 0;
      totalScore += session.stats.averageScore * session.stats.totalReadings;
      totalReadings += session.stats.totalReadings;
      goodCount += session.stats.goodPostureCount;
      badCount += session.stats.badPostureCount;
    });

    const avgScore = totalReadings > 0 ? totalScore / totalReadings : 0;

    res.status(200).json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        totalSessions: sessions.length,
        totalDuration, // in seconds
        averageScore: Math.round(avgScore),
        goodPostureCount: goodCount,
        badPostureCount: badCount,
        totalReadings,
      },
    });
  } catch (error) {
    next(error);
  }
};

