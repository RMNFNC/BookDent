import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import { AppointmentStatus, Role } from '@prisma/client';

interface CreateDoctorInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string;
  bio?: string;
}

export const getAllDoctors = async (includeInactive = false) => {
  return prisma.doctor.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });
};

export const createDoctor = async ({
  email,
  password,
  firstName,
  lastName,
  specialization,
  bio,
}: CreateDoctorInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email già registrata');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.DOCTOR,
      doctor: {
        create: {
          firstName,
          lastName,
          specialization,
          bio,
        },
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      doctor: true,
    },
  });
};

export const getDoctorById = async (id: number) => {
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      slots: true,
    },
  });
};

interface UpdateDoctorInput {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  bio?: string;
  isActive?: boolean;
}

export const updateDoctor = async (id: number, data: UpdateDoctorInput) => {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) throw new Error('Dentista non trovato');

  // Un dentista disattivato non riceve nuove prenotazioni, ma i pazienti che
  // hanno già un appuntamento futuro con lui resterebbero senza visita: prima
  // di disattivarlo quegli appuntamenti vanno annullati o completati.
  if (data.isActive === false && doctor.isActive) {
    const upcoming = await prisma.appointment.count({
      where: {
        doctorId: id,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        slot: { startTime: { gt: new Date() } },
      },
    });

    if (upcoming > 0) {
      throw new Error(
        upcoming === 1
          ? 'Il dentista ha 1 appuntamento futuro ancora attivo: annullalo prima di disattivarlo'
          : `Il dentista ha ${upcoming} appuntamenti futuri ancora attivi: annullali prima di disattivarlo`
      );
    }
  }

  return prisma.doctor.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, email: true } },
    },
  });
};
