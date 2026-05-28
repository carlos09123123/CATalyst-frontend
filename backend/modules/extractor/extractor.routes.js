import express from 'express';
import multer from 'multer';
import { processExtraction, getExtractedFilesByGroupAPI } from './extractor.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

router.use(requireAuth);

router.post('/file', upload.single('file'), processExtraction);
router.get('/:group_id', getExtractedFilesByGroupAPI);

export default router;
