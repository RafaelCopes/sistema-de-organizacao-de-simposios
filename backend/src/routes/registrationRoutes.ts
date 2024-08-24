import express from 'express';
import {
    requestSymposiumRegistration,
    requestEventRegistration,
    approveOrRejectSymposiumRegistration,
    approveOrRejectEventRegistration,
} from '../controllers/registrationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkOrganizer } from '../middlewares/checkOrganizer';

const router = express.Router();

router.post('/symposiums/:id/registration', authMiddleware, requestSymposiumRegistration);
router.post('/events/:id/registration', authMiddleware, requestEventRegistration);
router.put('/symposiums/:symposiumId/registrations/:registrationId', authMiddleware, checkOrganizer, approveOrRejectSymposiumRegistration);
router.put('/events/:eventId/registrations/:registrationId', authMiddleware, checkOrganizer, approveOrRejectEventRegistration);

export default router;
