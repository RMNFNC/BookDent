import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { getDoctors, getDoctor, addDoctor, editDoctor } from '../controllers/doctor.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import slotRouter from './slot.routes';

const router = Router();

const createDoctorSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'La password deve avere almeno 8 caratteri'),
  firstName: z.string().trim().min(1, 'Nome obbligatorio'),
  lastName: z.string().trim().min(1, 'Cognome obbligatorio'),
  specialization: z.string().trim().min(1, 'Specializzazione obbligatoria'),
  bio: z.string().trim().optional(),
});

const updateDoctorSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  specialization: z.string().trim().min(1).optional(),
  bio: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

/**
 * @openapi
 * /doctors:
 *   get:
 *     tags: [Doctors]
 *     summary: Elenco dentisti attivi (un ADMIN autenticato vede anche quelli disattivati)
 *     security: []
 *     responses:
 *       200: { description: Elenco dentisti }
 *   post:
 *     tags: [Doctors]
 *     summary: Crea un account DOCTOR (solo ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, specialization]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               specialization: { type: string }
 *               bio: { type: string }
 *     responses:
 *       201: { description: Dentista creato }
 *       403: { description: Accesso negato }
 */
router.get('/', optionalAuthenticate, getDoctors);

/**
 * @openapi
 * /doctors/{id}:
 *   get:
 *     tags: [Doctors]
 *     summary: Dettaglio dentista con slot disponibili
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Dettaglio dentista }
 *       404: { description: Dentista non trovato }
 */
router.get('/:id', getDoctor);
router.post('/', authenticate, authorize(Role.ADMIN), validate(createDoctorSchema), addDoctor);

/**
 * @openapi
 * /doctors/{id}:
 *   patch:
 *     tags: [Doctors]
 *     summary: Aggiorna profilo o stato attivo di un dentista (solo ADMIN)
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               specialization: { type: string }
 *               bio: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Dentista aggiornato }
 *       403: { description: Accesso negato }
 *       404: { description: Dentista non trovato }
 */
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateDoctorSchema), editDoctor);
router.use('/:id/slots', slotRouter);

export default router;
