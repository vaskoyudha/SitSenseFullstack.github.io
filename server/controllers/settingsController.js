import User from '../models/User.js';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Update preferences
    user.preferences = {
      ...user.preferences,
      ...req.body,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

