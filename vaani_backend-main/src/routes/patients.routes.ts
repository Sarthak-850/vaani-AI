import { Router } from 'express';
import { patientsController } from '../controllers/patients.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createPatientSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', patientsController.getPatients);
router.post('/', validateBody(createPatientSchema), patientsController.createPatient);
router.get('/:id', patientsController.getPatientById);
router.put('/:id', patientsController.updatePatient);

export default router;
