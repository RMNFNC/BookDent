import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createAppointmentHandler,
  getMyAppointmentsHandler,
  getAppointmentHandler,
  updateAppointmentStatusHandler,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/', authenticate, authorize(Role.PATIENT), createAppointmentHandler);
router.get('/me', authenticate, authorize(Role.PATIENT, Role.DOCTOR), getMyAppointmentsHandler);
router.get('/:id', authenticate, getAppointmentHandler);
router.put('/:id/status', authenticate, authorize(Role.DOCTOR, Role.ADMIN), updateAppointmentStatusHandler);

export default router;