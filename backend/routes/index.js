import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import groupsRoutes from '../modules/groups/groups.routes.js';
import extractorRoutes from '../modules/extractor/extractor.routes.js';
import summarizerRoutes from '../modules/summarizer/summarizer.routes.js';
import gapRoutes from '../modules/gap/gap.routes.js';
import topicRoutes from '../modules/topic/topic.routes.js';
import integrationRoutes from '../modules/integration/integration.routes.js';
import rrlRoutes from '../modules/rrl/rrl.routes.js';
import objectiveRoutes from '../modules/objective/objective.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/groups', groupsRoutes);
router.use('/extractor', extractorRoutes);
router.use('/summarizer', summarizerRoutes);
router.use('/gap', gapRoutes);
router.use('/topic', topicRoutes);
router.use('/integration', integrationRoutes);
router.use('/rrl', rrlRoutes);
router.use('/objective', objectiveRoutes);

export default router;
