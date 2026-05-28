import express from 'express';
import { generateSummary, getSummaryByGroupAPI } from './summarizer.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/:id', generateSummary);
router.get('/:group_id', getSummaryByGroupAPI);

export default router;
