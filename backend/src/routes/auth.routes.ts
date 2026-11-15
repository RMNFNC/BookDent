import { Router } from 'express';
import { z } from 'zod';
import { login, register, refresh } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginLimiter, loginIpLimiter, registerLimiter } from '../middleware/rateLimit';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'La password deve avere almeno 8 caratteri'),
  firstName: z.string().trim().min(1, 'Nome obbligatorio'),
  lastName: z.string().trim().min(1, 'Cognome obbligatorio'),
  codiceFiscale: z.string().trim().min(11, 'Codice fiscale non valido').max(16),
  dateOfBirth: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Data di nascita non valida'),
  phone: z.string().trim().min(6, 'Numero di telefono non valido'),
});

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password obbligatoria'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obbligatorio'),
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra un nuovo paziente
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, codiceFiscale, dateOfBirth, phone]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               codiceFiscale: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               phone: { type: string }
 *     responses:
 *       201: { description: Utente registrato, con access e refresh token }
 *       400: { description: Dati non validi o email/codice fiscale già registrati }
 */
router.post('/register', registerLimiter, validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login utente
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login riuscito, con access e refresh token }
 *       401: { description: Credenziali non valide }
 */
router.post('/login', loginIpLimiter, loginLimiter, validate(loginSchema), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Ottiene un nuovo access token tramite refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nuovo access token }
 *       401: { description: Refresh token non valido o scaduto }
 */
router.post('/refresh', validate(refreshSchema), refresh);

export default router;
