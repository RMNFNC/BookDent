import { Router } from 'express';
import { getDoctors, getDoctor } from '../controllers/doctor.controller';
import slotRouter from './slot.routes';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.use('/:id/slots', slotRouter);

export default router;
