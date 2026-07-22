import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

interface CreateRecordInput {
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  notes?: string;
}

interface UpdateRecordInput {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export const createMedicalRecord = async ({
  appointmentId,
  diagnosis,
  treatment,
  notes,
}: CreateRecordInput) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) throw new Error('Appuntamento non trovato');

  const existingRecord = await prisma.medicalRecord.findUnique({
    where: { appointmentId },
  });

  if (existingRecord) throw new Error('Referto già esistente');

  return prisma.medicalRecord.create({
    data: {
      appointmentId,
      diagnosis,
      treatment,
      notes,
    },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: { include: { user: { select: { id: true, email: true } } } },
          service: true,
          slot: true,
        },
      },
    },
  });
};

export const getMyRecords = async (userId: number, role: Role) => {
  if (role !== Role.PATIENT) {
    throw new Error('Solo il paziente può visualizzare i propri referti');
  }

  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) throw new Error('Profilo paziente non trovato');

  return prisma.medicalRecord.findMany({
    where: {
      appointment: {
        patientId: patient.id,
      },
    },
    include: {
      appointment: {
        include: {
          doctor: { include: { user: { select: { id: true, email: true } } } },
          service: true,
          slot: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getRecordById = async (id: number) => {
  return prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: { include: { user: { select: { id: true, email: true } } } },
          service: true,
          slot: true,
        },
      },
    },
  });
};

export const updateMedicalRecord = async (
  id: number,
  data: UpdateRecordInput
) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
  });

  if (!record) throw new Error('Referto non trovato');

  return prisma.medicalRecord.update({
    where: { id },
    data,
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: { include: { user: { select: { id: true, email: true } } } },
          service: true,
          slot: true,
        },
      },
    },
  });
};