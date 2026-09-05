import { prisma } from '../config/prisma';
import { AppointmentStatus, Role } from '@prisma/client';

interface CreateAppointmentInput {
  userId: number;
  serviceId: number;
  date: string;
  startTime: string;
}

const SLOT_TAKEN = 'SLOT_TAKEN';

export const createAppointment = async ({
  userId,
  serviceId,
  date,
  startTime,
}: CreateAppointmentInput) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Profilo paziente non trovato');

  const service = await prisma.dentalService.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Prestazione non trovata');
  if (!service.isActive) throw new Error('Prestazione non disponibile');

  const slotDate = new Date(date);
  const requestedStart = new Date(startTime);

  if (Number.isNaN(slotDate.getTime()) || Number.isNaN(requestedStart.getTime())) {
    throw new Error('Data o orario non validi');
  }

  const requiredDurationMs = (service.durationMin ?? 0) * 60 * 1000;

  // Auto-assign: il paziente non sceglie il dentista, il sistema cerca fra
  // tutti i dentisti attivi uno slot libero a quella data/ora con durata
  // sufficiente per la prestazione richiesta.
  const candidateSlots = await prisma.availabilitySlot.findMany({
    where: {
      date: slotDate,
      startTime: requestedStart,
      isBooked: false,
      doctor: { isActive: true },
    },
    orderBy: { doctorId: 'asc' },
  });

  const eligibleSlots = candidateSlots.filter(
    (slot) => slot.endTime.getTime() - slot.startTime.getTime() >= requiredDurationMs
  );

  if (eligibleSlots.length === 0) {
    throw new Error('Nessun dentista disponibile per l’orario selezionato');
  }

  for (const slot of eligibleSlots) {
    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const updatedSlot = await tx.availabilitySlot.updateMany({
          where: {
            id: slot.id,
            isBooked: false,
          },
          data: {
            isBooked: true,
          },
        });

        if (updatedSlot.count === 0) {
          throw new Error(SLOT_TAKEN);
        }

        return tx.appointment.create({
          data: {
            patientId: patient.id,
            doctorId: slot.doctorId,
            serviceId,
            slotId: slot.id,
            status: AppointmentStatus.PENDING,
          },
          include: {
            patient: true,
            doctor: {
              include: {
                user: {
                  select: { id: true, email: true },
                },
              },
            },
            service: true,
            slot: true,
          },
        });
      });

      return appointment;
    } catch (error) {
      if (error instanceof Error && error.message === SLOT_TAKEN) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Nessun dentista disponibile per l’orario selezionato');
};

export const getMyAppointments = async (userId: number, role: Role) => {
  if (role === Role.PATIENT) {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new Error('Profilo paziente non trovato');

    return prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: { select: { id: true, email: true } } } },
        service: true,
        slot: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  if (role === Role.DOCTOR) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new Error('Profilo dentista non trovato');

    return prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: true,
        service: true,
        slot: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  throw new Error('Ruolo non autorizzato per questa route');
};

export const getAllAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: { include: { user: { select: { id: true, email: true } } } },
      service: true,
      slot: true,
    },
    orderBy: { id: 'desc' },
  });
};

export const getAppointmentById = async (id: number) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: { select: { id: true, email: true } } } },
      service: true,
      slot: true,
      medicalRecord: true,
    },
  });
};

export const updateAppointmentStatus = async (
  id: number,
  status: AppointmentStatus,
  actingUser: { userId: number; role: Role }
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, patient: true },
  });

  if (!appointment) {
    throw new Error('Appuntamento non trovato');
  }

  if (actingUser.role === Role.DOCTOR && appointment.doctor.userId !== actingUser.userId) {
    throw new Error('Non sei il dentista assegnato a questo appuntamento');
  }

  if (actingUser.role === Role.PATIENT) {
    if (appointment.patient.userId !== actingUser.userId) {
      throw new Error('Non puoi modificare un appuntamento di un altro paziente');
    }

    if (status !== AppointmentStatus.CANCELLED) {
      throw new Error('Il paziente può solo cancellare un appuntamento');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new Error('Impossibile cancellare un appuntamento già completato');
    }
  }

  return prisma.$transaction(async (tx) => {
    if (status === AppointmentStatus.CANCELLED) {
      await tx.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    }

    return tx.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
        service: true,
        slot: true,
      },
    });
  });
};
