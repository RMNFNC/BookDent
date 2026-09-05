import { Router } from 'express';
import { getMe } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Profilo dell'utente autenticato
 *     responses:
 *       200: { description: Dati utente }
 *       401: { description: Non autorizzato }
 */
router.get('/me', authenticate, getMe);

export default router;
