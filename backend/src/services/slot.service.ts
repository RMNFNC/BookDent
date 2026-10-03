import { prisma } from '../config/prisma';
import { AppointmentStatus, Role } from '@prisma/client';

interface ActingUser {
  userId: number;
  role: Role;
}

interface CreateSlotInput {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  actingUser: ActingUser;
}

interface SearchAvailabilityInput {
  serviceId: number;
  date: string;
}

const assertDoctorOwnership = async (doctorId: number, actingUser: ActingUser) => {
  if (actingUser.role !== Role.DOCTOR) return;

  const doctor = await prisma.doctor.findUnique({ where: { userId: actingUser.userId } });
  if (!doctor || doctor.id !== doctorId) {
    throw new Error('Non sei autorizzato a gestire il calendario di questo dentista');
  }
};

export const getSlotsByDoctor = async (doctorId: number) => {
  return prisma.availabilitySlot.findMany({
    where: {
      doctorId,
      isBooked: false,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
};

export const createSlot = async ({
  doctorId,
  date,
  startTime,
  endTime,
  actingUser,
}: CreateSlotInput) => {
  await assertDoctorOwnership(doctorId, actingUser);

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error('Dentista non trovato');
  }

  const slotDate = new Date(date);
  const slotStart = new Date(startTime);
  const slotEnd = new Date(endTime);

  if (
    Number.isNaN(slotDate.getTime()) ||
    Number.isNaN(slotStart.getTime()) ||
    Number.isNaN(slotEnd.getTime())
  ) {
    throw new Error('Data o orario non validi');
  }

  if (slotEnd <= slotStart) {
    throw new Error('L’orario di fine deve essere successivo all’orario di inizio');
  }

  if (slotStart <= new Date()) {
    throw new Error('Non è possibile creare uno slot nel passato');
  }

  // Gli slot rimasti collegati ad appuntamenti annullati sono solo storico:
  // non occupano più il calendario e non devono bloccare nuovi slot.
  const overlappingSlot = await prisma.availabilitySlot.findFirst({
    where: {
      doctorId,
      date: slotDate,
      AND: [{ startTime: { lt: slotEnd } }, { endTime: { gt: slotStart } }],
      appointments: { none: { status: AppointmentStatus.CANCELLED } },
    },
  });

  if (overlappingSlot) {
    throw new Error('Esiste già uno slot che si sovrappone a questo orario');
  }

  return prisma.availabilitySlot.create({
    data: {
      doctorId,
      date: slotDate,
      startTime: slotStart,
      endTime: slotEnd,
      isBooked: false,
    },
  });
};

export const searchAvailableSlots = async ({ serviceId, date }: SearchAvailabilityInput) => {
  const service = await prisma.dentalService.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Prestazione non trovata');
  if (!service.isActive) throw new Error('Prestazione non disponibile');

  const slotDate = new Date(date);
  if (Number.isNaN(slotDate.getTime())) {
    throw new Error('Data non valida');
  }

  const requiredDurationMs = (service.durationMin ?? 0) * 60 * 1000;

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      date: slotDate,
      isBooked: false,
      doctor: { isActive: true },
    },
    include: {
      doctor: {
        select: { id: true, firstName: true, lastName: true, specialization: true },
      },
    },
    orderBy: [{ startTime: 'asc' }, { doctorId: 'asc' }],
  });

  return slots.filter(
    (slot) => slot.endTime.getTime() - slot.startTime.getTime() >= requiredDurationMs
  );
};

export const deleteSlot = async (slotId: number, doctorId: number, actingUser: ActingUser) => {
  await assertDoctorOwnership(doctorId, actingUser);

  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new Error('Slot non trovato');
  }

  if (slot.doctorId !== doctorId) {
    throw new Error('Slot non appartiene a questo dentista');
  }

  if (slot.isBooked) {
    throw new Error('Impossibile eliminare uno slot già prenotato');
  }

  return prisma.availabilitySlot.delete({
    where: { id: slotId },
  });
};
