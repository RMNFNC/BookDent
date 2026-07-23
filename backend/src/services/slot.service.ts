import { prisma } from '../config/prisma';

interface CreateSlotInput {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export const getSlotsByDoctor = async (doctorId: number) => {
  return prisma.availabilitySlot.findMany({
    where: {
      doctorId,
      isBooked: false,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
};

export const createSlot = async ({ doctorId, date, startTime, endTime }: CreateSlotInput) => {
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

export const deleteSlot = async (slotId: number, doctorId: number) => {
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
