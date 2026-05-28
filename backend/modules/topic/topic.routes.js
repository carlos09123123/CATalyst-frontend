import express from 'express';
import { generateTopics, getTopicsByGroupIdAPI } from './topic.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/run', generateTopics);
router.get('/:group_id', getTopicsByGroupIdAPI);

export default router;
