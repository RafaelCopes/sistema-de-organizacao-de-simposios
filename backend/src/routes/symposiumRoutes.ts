import express from 'express';
import {
    getAllSymposiums,
    getSymposiumById,
    createSymposium,
    updateSymposium,
    deleteSymposium,
} from '../controllers/symposiumController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkOrganizer } from '../middlewares/checkOrganizer';

const router = express.Router();

router.get('/symposiums', getAllSymposiums);
router.get('/symposiums/:id', getSymposiumById);
router.post('/symposiums', authMiddleware, checkOrganizer, createSymposium);
router.put('/symposiums/:id', authMiddleware, checkOrganizer, updateSymposium);
router.delete('/symposiums/:id', authMiddleware, checkOrganizer, deleteSymposium);

export default router;
