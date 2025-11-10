import express from 'express';
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
} from '../controllers/deviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/').get(getDevices).post(createDevice);
router.route('/:id').get(getDevice).put(updateDevice).delete(deleteDevice);

export default router;

