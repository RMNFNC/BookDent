import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import {
  createRecordHandler,
  getMyRecordsHandler,
  getRecordHandler,
  updateRecordHandler,
} from '../controllers/record.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';

const router = Router();

const createRecordSchema = z.object({
  appointmentId: z.coerce.number().int().positive('appointmentId non valido'),
  diagnosis: z.string().trim().min(1, 'Diagnosi obbligatoria'),
  treatment: z.string().trim().min(1, 'Trattamento obbligatorio'),
  notes: z.string().trim().optional(),
});

const updateRecordSchema = z.object({
  diagnosis: z.string().trim().min(1).optional(),
  treatment: z.string().trim().min(1).optional(),
  notes: z.string().trim().optional(),
});

/**
 * @openapi
 * /records:
 *   post:
 *     tags: [Records]
 *     summary: Crea un referto per un appuntamento COMPLETED (solo il DOCTOR assegnato)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, diagnosis, treatment]
 *             properties:
 *               appointmentId: { type: integer }
 *               diagnosis: { type: string }
 *               treatment: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Referto creato }
 *       400: { description: Appuntamento non completato o referto già esistente }
 *       403: { description: Non sei il dentista assegnato }
 */
router.post(
  '/',
  authenticate,
  authorize(Role.DOCTOR),
  validate(createRecordSchema),
  createRecordHandler
);

/**
 * @openapi
 * /records/me:
 *   get:
 *     tags: [Records]
 *     summary: Referti del paziente autenticato
 *     responses:
 *       200: { description: Elenco referti }
 */
router.get('/me', authenticate, authorize(Role.PATIENT), getMyRecordsHandler);

/**
 * @openapi
 * /records/{id}:
 *   get:
 *     tags: [Records]
 *     summary: Dettaglio referto (solo paziente/dentista coinvolti o ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Dettaglio referto }
 *       403: { description: Accesso negato }
 *   put:
 *     tags: [Records]
 *     summary: Aggiorna un referto (solo il DOCTOR assegnato)
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
 *             properties:
 *               diagnosis: { type: string }
 *               treatment: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Referto aggiornato }
 *       403: { description: Accesso negato }
 */
router.get(
  '/:id',
  authenticate,
  authorize(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
  getRecordHandler
);
router.put(
  '/:id',
  authenticate,
  authorize(Role.DOCTOR),
  validate(updateRecordSchema),
  updateRecordHandler
);

export default router;
