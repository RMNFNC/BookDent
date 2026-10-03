// Deve restare il primo import: carica backend/.env prima che gli altri moduli
// leggano process.env (es. JWT_SECRET in auth.service.ts).
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import serviceRouter from './routes/service.routes';
import doctorRouter from './routes/doctor.routes';
import appointmentRouter from './routes/appointment.routes';
import recordRouter from './routes/record.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'DentalCare API running' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/services', serviceRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/records', recordRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
