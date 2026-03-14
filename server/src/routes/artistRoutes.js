import { Router } from 'express';
import multer from 'multer';

import * as artistControllers from '../controllers/artistControllers.js';

const router = Router();
const upload = multer();

router.get('/', artistControllers.getAllArtists);
router.post('/', upload.single('file'), artistControllers.createArtist);
router.get('/admin', artistControllers.getAllArtistsAdmin);
router.get('/search', artistControllers.getAllArtistsBySearch);
router.get('/:id', artistControllers.getArtistById);
router.put('/:id', upload.single('file'), artistControllers.updateArtist);
router.delete('/:id', artistControllers.deleteArtist);
router.get('/:id/releases', artistControllers.getAllReleasesByArtistId);
router.get('/discogs-preview/:discogsId', artistControllers.previewArtistFromDiscogs);

export default router;
