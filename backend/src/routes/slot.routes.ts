import { Router } from 'express';
import { getSlots, addSlot, removeSlot } from '../controllers/slot.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true });

router.get('/', getSlots);
router.post('/', authenticate, authorize(Role.DOCTOR, Role.ADMIN), addSlot);
router.delete('/:slotId', authenticate, authorize(Role.DOCTOR, Role.ADMIN), removeSlot);

export default router;
