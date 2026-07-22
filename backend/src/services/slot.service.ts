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
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });
};

export const createSlot = async ({
  doctorId,
  date,
  startTime,
  endTime,
}: CreateSlotInput) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error('Dentista non trovato');
  }

  return prisma.availabilitySlot.create({
    data: {
      doctorId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
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