import { Router } from 'express';
import multer from 'multer';
import * as releaseControllers from '../controllers/releaseControllers.js';

const router = Router();
const upload = multer();

router.get('/', releaseControllers.getAllReleases);
router.post('/', upload.single('file'), releaseControllers.createRelease);
router.get('/:id', releaseControllers.getReleaseById);
router.get('/discogs/:id', releaseControllers.fetchDiscogsRelease);

export default router;
