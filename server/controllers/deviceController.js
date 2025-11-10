import Device from '../models/Device.js';

// @desc    Get all devices for user
// @route   GET /api/devices
// @access  Private
export const getDevices = async (req, res, next) => {
  try {
    const devices = await Device.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Private
export const getDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.status(200).json({
      success: true,
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new device
// @route   POST /api/devices
// @access  Private
export const createDevice = async (req, res, next) => {
  try {
    const { deviceId, name, metadata } = req.body;

    // Check if device already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        error: 'Device already exists',
      });
    }

    const device = await Device.create({
      deviceId,
      userId: req.user.id,
      name: name || 'SitSense Device',
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
export const updateDevice = async (req, res, next) => {
  try {
    let device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private
export const deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    await device.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

