import express from 'express';
import { getAdvice } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/advice', getAdvice);

export default router;

