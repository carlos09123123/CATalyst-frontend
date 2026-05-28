import express from 'express';
import { 
  consolidateGaps,
  getIntegratedGaps
} from './integration.controller.js';

const router = express.Router();

router.post('/consolidate', consolidateGaps);
router.get('/integrated/:groupId', getIntegratedGaps);

export default router;
