import Session from '../models/Session.js';
import PostureData from '../models/PostureData.js';

// @desc    Get all sessions for user
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res, next) => {
  try {
    const { deviceId, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    if (deviceId) {
      query.deviceId = deviceId;
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

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
export const getSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('deviceId', 'deviceId name');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Get posture data for this session
    const postureData = await PostureData.find({ sessionId: session._id })
      .sort({ timestamp: 1 })
      .limit(1000); // Limit to prevent huge responses

    res.status(200).json({
      success: true,
      data: {
        session,
        postureData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    // Verify device belongs to user
    const Device = (await import('../models/Device.js')).default;
    const device = await Device.findOne({
      _id: deviceId,
      userId: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    const session = await Session.create({
      userId: req.user.id,
      deviceId,
      startTime: new Date(),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End session
// @route   PUT /api/sessions/:id/end
// @access  Private
export const endSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Session already ended',
      });
    }

    // Calculate session stats from posture data
    const postureData = await PostureData.find({ sessionId: session._id });
    
    let totalScore = 0;
    let goodCount = 0;
    let badCount = 0;
    let maxScore = 0;
    let minScore = 100;

    postureData.forEach((data) => {
      const score = data.scores.total;
      totalScore += score;
      if (score >= 80) goodCount++;
      if (score < 60) badCount++;
      if (score > maxScore) maxScore = score;
      if (score < minScore && score > 0) minScore = score;
    });

    const avgScore = postureData.length > 0 ? totalScore / postureData.length : 0;

    session.endTime = new Date();
    session.isActive = false;
    session.stats = {
      totalReadings: postureData.length,
      averageScore: Math.round(avgScore),
      goodPostureCount: goodCount,
      badPostureCount: badCount,
      maxScore,
      minScore: minScore === 100 ? 0 : minScore,
    };

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

