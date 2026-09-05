import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  codiceFiscale: string;
  dateOfBirth: string;
  phone: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: number;
  role: Role;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ||
  '7d') as SignOptions['expiresIn'];

const signAccessToken = ({ userId, role }: TokenPayload) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const signRefreshToken = ({ userId, role }: TokenPayload) =>
  jwt.sign({ userId, role, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
  codiceFiscale,
  dateOfBirth,
  phone,
}: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email già registrata');
  }

  const existingPatient = await prisma.patient.findUnique({
    where: { codiceFiscale },
  });

  if (existingPatient) {
    throw new Error('Codice fiscale già registrato');
  }

  const parsedDateOfBirth = new Date(dateOfBirth);
  if (Number.isNaN(parsedDateOfBirth.getTime())) {
    throw new Error('Data di nascita non valida');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // La registrazione pubblica crea solo account PATIENT: DOCTOR e ADMIN
  // vanno creati tramite un flusso separato riservato agli amministratori.
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.PATIENT,
      patient: {
        create: {
          firstName,
          lastName,
          codiceFiscale,
          dateOfBirth: parsedDateOfBirth,
          phone,
        },
      },
    },
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Credenziali non valide');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error('Credenziali non valide');
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let decoded: TokenPayload & { type?: string };

  try {
    decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload & { type?: string };
  } catch (error) {
    throw new Error('Refresh token non valido o scaduto', { cause: error });
  }

  if (decoded.type !== 'refresh') {
    throw new Error('Refresh token non valido o scaduto');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    throw new Error('Utente non trovato');
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });

  return { accessToken };
};
