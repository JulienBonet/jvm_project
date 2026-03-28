// server\src\router.js
import { Router } from 'express';
import releaseRoutes from './routes/releaseRoutes.js';
import releaseMobileRoutes from './routes/releaseMobileRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import labelRoutes from './routes/labelRoutes.js';
import genreRoutes from './routes/genreRoutes.js';
import styleRoutes from './routes/styleRoutes.js';
import authRoutes from './routes/authRoutes.js';

const router = Router();

router.use('/release', releaseRoutes);
router.use('/mobile', releaseMobileRoutes);
router.use('/artist', artistRoutes);
router.use('/label', labelRoutes);
router.use('/genre', genreRoutes);
router.use('/style', styleRoutes);
router.use('/auth', authRoutes);

export default router;
