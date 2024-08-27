import express from 'express';
import {
    getAllEventsForSymposium,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
} from '../controllers/eventController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkOrganizer } from '../middlewares/checkOrganizer';

const router = express.Router();

router.get('/symposiums/:id/events', getAllEventsForSymposium);
router.get('/events/:id', getEventById);
router.post('/events', authMiddleware, checkOrganizer, createEvent);
router.put('/events/:id', authMiddleware, checkOrganizer, updateEvent);
router.delete('/events/:id', authMiddleware, checkOrganizer, deleteEvent);

export default router;
