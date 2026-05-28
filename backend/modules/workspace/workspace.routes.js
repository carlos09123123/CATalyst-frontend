import express from 'express';
import { getWorkspaces, createWorkspace } from './workspace.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', getWorkspaces);
router.post('/', createWorkspace);

export default router;
