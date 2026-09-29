import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/users', authorizeRoles(Role.ADMIN, Role.SUPERVISOR), usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.put('/users/:id', authorizeRoles(Role.ADMIN, Role.SUPERVISOR), usersController.updateUser);

router.get('/workers', usersController.getWorkers);
router.get('/workers/:id', usersController.getWorkerById);

export default router;
