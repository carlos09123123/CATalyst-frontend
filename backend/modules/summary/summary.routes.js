import express from 'express';
import { generateSummary } from './summary.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.post('/', generateSummary);

export default router;
