import { Router } from 'express';
import { z } from 'zod';
import { getSlots, addSlot, removeSlot } from '../controllers/slot.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { Role } from '@prisma/client';

const router = Router({ mergeParams: true });

const createSlotSchema = z.object({
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Data non valida'),
  startTime: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Orario di inizio non valido'),
  endTime: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Orario di fine non valido'),
});

/**
 * @openapi
 * /doctors/{id}/slots:
 *   get:
 *     tags: [Slots]
 *     summary: Slot liberi di un dentista
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Elenco slot liberi }
 *   post:
 *     tags: [Slots]
 *     summary: Crea uno slot di disponibilità (DOCTOR proprietario o ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, startTime, endTime]
 *             properties:
 *               date: { type: string, format: date }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       201: { description: Slot creato }
 *       403: { description: Accesso negato }
 */
router.get('/', getSlots);
router.post(
  '/',
  authenticate,
  authorize(Role.DOCTOR, Role.ADMIN),
  validate(createSlotSchema),
  addSlot
);

/**
 * @openapi
 * /doctors/{id}/slots/{slotId}:
 *   delete:
 *     tags: [Slots]
 *     summary: Elimina uno slot non prenotato (DOCTOR proprietario o ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Slot eliminato }
 *       403: { description: Accesso negato }
 */
router.delete('/:slotId', authenticate, authorize(Role.DOCTOR, Role.ADMIN), removeSlot);

export default router;
