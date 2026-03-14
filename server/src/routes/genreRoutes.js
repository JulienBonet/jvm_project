import { Router } from 'express';
import * as genreControllers from '../controllers/genreControllers.js';

const router = Router();

router.get('/', genreControllers.getAllGenres);
router.get('/orderbyid', genreControllers.getAllGenresOrderById);
router.get('/search', genreControllers.getAllGenresBySearch);
router.post('/', genreControllers.createGenre);
router.get('/:id', genreControllers.getGenreById);
router.put('/:id', genreControllers.updateGenre);
router.delete('/:id', genreControllers.deleteGenre);

export default router;
