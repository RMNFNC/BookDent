// Deve restare il primo import: carica backend/.env prima che gli altri moduli
// leggano process.env (es. JWT_SECRET in auth.service.ts).
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import serviceRouter from './routes/service.routes';
import doctorRouter from './routes/doctor.routes';
import appointmentRouter from './routes/appointment.routes';
import recordRouter from './routes/record.routes';

// Senza un JWT_SECRET robusto i token sarebbero falsificabili (o ogni login
// fallirebbe a runtime): meglio fermarsi subito con un messaggio chiaro.
const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (JWT_SECRET.length < 32 || JWT_SECRET.startsWith('cambia-questa-chiave')) {
  console.error(
    'JWT_SECRET mancante o troppo debole: impostare in backend/.env una stringa casuale di almeno 32 caratteri'
  );
  process.exit(1);
}

// Origini autorizzate (separate da virgola), es. "http://localhost:5173,https://studio.example.it".
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Swagger è attivo salvo SWAGGER_ENABLED=false.
const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Smart Dental Care API running' });
});

if (swaggerEnabled) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/services', serviceRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/records', recordRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Risorsa non trovata' });
});

// Gestore finale: risponde sempre in JSON (es. body JSON malformato) invece
// della pagina HTML di default di Express, che in sviluppo include lo stack trace.
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? 'Errore interno del server' : 'Richiesta non valida',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS consentito per: ${corsOrigins.join(', ')}`);
  if (swaggerEnabled) console.log(`Documentazione API: http://localhost:${PORT}/api/docs`);
});
