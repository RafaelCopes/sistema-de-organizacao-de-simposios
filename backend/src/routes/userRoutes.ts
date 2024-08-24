import { Router } from 'express';
import { createUser, listUsers } from '../controllers/userController';

const router = Router();

router.post('/users', createUser);
router.get('/users', listUsers);

export default router;
