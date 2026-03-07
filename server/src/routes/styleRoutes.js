import { Router } from 'express';
import * as styleControllers from '../controllers/styleControllers.js';

const router = Router();

router.get('/', styleControllers.getAllStyles);
router.get('/orderbyid', styleControllers.getAllStylesOrderById);
router.post('/', styleControllers.createStyle);
router.get('/:id', styleControllers.getStyleById);
router.put('/:id', styleControllers.updateStyle);
router.delete('/:id', styleControllers.deleteStyle);

export default router;
