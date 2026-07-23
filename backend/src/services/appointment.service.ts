import { prisma } from '../config/prisma';
import { AppointmentStatus, Role } from '@prisma/client';

interface CreateAppointmentInput {
  patientId: number;
  doctorId: number;
  serviceId: number;
  slotId: number;
}

export const createAppointment = async ({
  patientId,
  doctorId,
  serviceId,
  slotId,
}: CreateAppointmentInput) => {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Paziente non trovato');

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw new Error('Dentista non trovato');

  const service = await prisma.dentalService.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error('Prestazione non trovata');

  const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
  if (!slot) throw new Error('Slot non trovato');

  if (slot.doctorId !== doctorId) {
    throw new Error('Lo slot non appartiene al dentista selezionato');
  }

  if (slot.isBooked) {
    throw new Error('Slot già prenotato');
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const updatedSlot = await tx.availabilitySlot.updateMany({
      where: {
        id: slotId,
        isBooked: false,
      },
      data: {
        isBooked: true,
      },
    });

    if (updatedSlot.count === 0) {
      throw new Error('Slot già prenotato');
    }

    return tx.appointment.create({
      data: {
        patientId,
        doctorId,
        serviceId,
        slotId,
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

  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: { isBooked: true },
  });

  return appointment;
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

export const updateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new Error('Appuntamento non trovato');
  }

  return prisma.$transaction(async (tx) => {
    const updatedAppointment = await tx.appointment.update({
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

    if (status === AppointmentStatus.CANCELLED) {
      await tx.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    }

    return updatedAppointment;
  });
};
