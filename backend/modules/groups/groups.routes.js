import express from 'express';
import { createGroup, joinGroupAPI, getGroupsByUserIdAPI, updateGroupAPI, deleteGroupAPI } from './groups.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/create', createGroup);
router.post('/join', joinGroupAPI);
router.get('/:userId', getGroupsByUserIdAPI);
router.put('/update/:id', updateGroupAPI);
router.delete('/delete/:id', deleteGroupAPI);

export default router;
