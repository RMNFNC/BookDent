import { Router } from 'express';
import { z } from 'zod';
import { getServices, createService, editService } from '../controllers/service.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { Role } from '@prisma/client';

const router = Router();

const createServiceSchema = z.object({
  name: z.string().trim().min(1, 'Nome obbligatorio'),
  description: z.string().trim().optional(),
  durationMin: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().nonnegative().optional(),
});

const updateServiceSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  durationMin: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

/**
 * @openapi
 * /services:
 *   get:
 *     tags: [Services]
 *     summary: Elenco prestazioni attive (un ADMIN autenticato vede anche quelle disattivate)
 *     security: []
 *     responses:
 *       200: { description: Elenco prestazioni }
 *   post:
 *     tags: [Services]
 *     summary: Crea una nuova prestazione (solo ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               durationMin: { type: integer }
 *               price: { type: number }
 *     responses:
 *       201: { description: Prestazione creata }
 *       403: { description: Accesso negato }
 */
router.get('/', optionalAuthenticate, getServices);
router.post('/', authenticate, authorize(Role.ADMIN), validate(createServiceSchema), createService);

/**
 * @openapi
 * /services/{id}:
 *   patch:
 *     tags: [Services]
 *     summary: Aggiorna o disattiva una prestazione (solo ADMIN)
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
 *               name: { type: string }
 *               description: { type: string }
 *               durationMin: { type: integer }
 *               price: { type: number }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Prestazione aggiornata }
 *       403: { description: Accesso negato }
 *       404: { description: Prestazione non trovata }
 */
router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateServiceSchema),
  editService
);

export default router;
