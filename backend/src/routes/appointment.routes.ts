import { Router } from 'express';
import { z } from 'zod';
import { AppointmentStatus, Role } from '@prisma/client';
import {
  createAppointmentHandler,
  getMyAppointmentsHandler,
  getAllAppointmentsHandler,
  getAppointmentHandler,
  updateAppointmentStatusHandler,
  getAvailabilityHandler,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';

const router = Router();

const bookAppointmentSchema = z.object({
  serviceId: z.coerce.number().int().positive('serviceId non valido'),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Data non valida'),
  startTime: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Orario di inizio non valido'),
});

const updateStatusSchema = z.object({
  status: z.enum([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.COMPLETED,
  ]),
});

/**
 * @openapi
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Prenota un appuntamento (il dentista viene assegnato automaticamente)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, date, startTime]
 *             properties:
 *               serviceId: { type: integer }
 *               date: { type: string, format: date }
 *               startTime: { type: string, format: date-time }
 *     responses:
 *       201: { description: Appuntamento creato con dentista assegnato automaticamente }
 *       400: { description: Nessun dentista disponibile o dati non validi }
 */
router.post(
  '/',
  authenticate,
  authorize(Role.PATIENT),
  validate(bookAppointmentSchema),
  createAppointmentHandler
);

/**
 * @openapi
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Elenco di tutti gli appuntamenti (solo ADMIN)
 *     responses:
 *       200: { description: Elenco completo appuntamenti }
 *       403: { description: Accesso negato }
 */
router.get('/', authenticate, authorize(Role.ADMIN), getAllAppointmentsHandler);

/**
 * @openapi
 * /appointments/me:
 *   get:
 *     tags: [Appointments]
 *     summary: Appuntamenti dell'utente autenticato (paziente o dentista)
 *     responses:
 *       200: { description: Elenco appuntamenti }
 */
router.get('/me', authenticate, authorize(Role.PATIENT, Role.DOCTOR), getMyAppointmentsHandler);

/**
 * @openapi
 * /appointments/availability:
 *   get:
 *     tags: [Appointments]
 *     summary: Cerca orari disponibili per una prestazione in una data (Search Availability)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Slot disponibili compatibili con la durata della prestazione }
 */
router.get('/availability', getAvailabilityHandler);

/**
 * @openapi
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Dettaglio appuntamento (solo proprietario paziente/dentista o ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Dettaglio appuntamento }
 *       403: { description: Accesso negato }
 *       404: { description: Appuntamento non trovato }
 */
router.get('/:id', authenticate, getAppointmentHandler);

/**
 * @openapi
 * /appointments/{id}/status:
 *   put:
 *     tags: [Appointments]
 *     summary: Aggiorna lo stato di un appuntamento (paziente proprietario può solo cancellare; DOCTOR assegnato o ADMIN possono confermare/completare/cancellare)
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [CONFIRMED, CANCELLED, COMPLETED] }
 *     responses:
 *       200: { description: Stato aggiornato }
 *       403: { description: Accesso negato }
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
  validate(updateStatusSchema),
  updateAppointmentStatusHandler
);

export default router;
