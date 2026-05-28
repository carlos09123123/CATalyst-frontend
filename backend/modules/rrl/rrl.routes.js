import express from 'express';
import { runAssessment, getAssessments, submitFeedback } from './rrl.controller.js';

const router = express.Router();

router.post('/assess', runAssessment);
router.get('/:groupId', getAssessments);
router.post('/feedback', submitFeedback);

export default router;
