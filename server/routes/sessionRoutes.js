import express from 'express';
import {
  getSessions,
  getSession,
  createSession,
  endSession,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/').get(getSessions).post(createSession);
router.route('/:id').get(getSession);
router.put('/:id/end', endSession);

export default router;

