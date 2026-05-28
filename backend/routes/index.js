import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import groupsRoutes from '../modules/groups/groups.routes.js';
import extractorRoutes from '../modules/extractor/extractor.routes.js';
import summarizerRoutes from '../modules/summarizer/summarizer.routes.js';
import gapRoutes from '../modules/gap/gap.routes.js';
import topicRoutes from '../modules/topic/topic.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/groups', groupsRoutes);
router.use('/extractor', extractorRoutes);
router.use('/summarizer', summarizerRoutes);
router.use('/gap', gapRoutes);
router.use('/topic', topicRoutes);

export default router;
