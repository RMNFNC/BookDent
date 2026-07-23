import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createRecordHandler,
  getMyRecordsHandler,
  getRecordHandler,
  updateRecordHandler,
} from '../controllers/record.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/', authenticate, authorize(Role.DOCTOR), createRecordHandler);
router.get('/me', authenticate, authorize(Role.PATIENT), getMyRecordsHandler);
router.get(
  '/:id',
  authenticate,
  authorize(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
  getRecordHandler
);
router.put('/:id', authenticate, authorize(Role.DOCTOR), updateRecordHandler);

export default router;
