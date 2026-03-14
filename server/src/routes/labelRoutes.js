import { Router } from 'express';
import multer from 'multer';
import * as labelControllers from '../controllers/labelControllers.js';

const router = Router();
const upload = multer();

router.get('/', labelControllers.getAllLabels);
router.post('/', upload.single('file'), labelControllers.createLabel);
router.get('/admin', labelControllers.getAllLabelsAdmin);
router.get('/search', labelControllers.getAllLabelsBySearch);
router.put('/:id', upload.single('file'), labelControllers.updateLabel);
router.delete('/:id', labelControllers.deleteLabel);
router.get('/:id/releases', labelControllers.getAllReleasesByLabelId);
router.get('/discogs-preview/:discogsId', labelControllers.previewLabelFromDiscogs);

export default router;
