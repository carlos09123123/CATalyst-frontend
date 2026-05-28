import express from 'express';
import { analyzeGaps, getGapsByGroupAPI } from './gap.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/:id', analyzeGaps);
router.get('/:group_id', getGapsByGroupAPI);

export default router;
