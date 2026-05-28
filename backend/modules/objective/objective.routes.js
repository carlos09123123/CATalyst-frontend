import express from 'express';
import { generateObjectives, getObjectives, saveObjectiveEdit } from './objective.controller.js';

const router = express.Router();

router.post('/generate', generateObjectives);
router.get('/:groupId', getObjectives);
router.put('/:id', saveObjectiveEdit);

export default router;
