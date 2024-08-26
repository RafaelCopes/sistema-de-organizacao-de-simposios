import { Router } from 'express';
import { createUser, listUsers } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { listUserSymposiums } from '../controllers/symposiumController';

const router = Router();

router.post('/users', createUser);
router.get('/users', listUsers);
router.get('/user/symposiums', authMiddleware, listUserSymposiums);

export default router;
