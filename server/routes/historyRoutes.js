import express from 'express';
import { getHistory, getDailyStats } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getHistory);
router.get('/stats/daily', getDailyStats);

export default router;

