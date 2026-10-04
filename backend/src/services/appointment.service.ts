import { prisma } from '../config/prisma';
import { AppointmentStatus, Role } from '@prisma/client';

interface CreateAppointmentInput {
  userId: number;
  serviceId: number;
  date: string;
  startTime: string;
}

const SLOT_TAKEN = 'SLOT_TAKEN';

// Ciclo di vita ammesso: PENDING -> CONFIRMED -> COMPLETED, con annullamento
// possibile finché la visita non è completata. COMPLETED e CANCELLED sono finali.
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'in attesa',
  [AppointmentStatus.CONFIRMED]: 'confermato',
  [AppointmentStatus.COMPLETED]: 'completato',
  [AppointmentStatus.CANCELLED]: 'annullato',
};

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

  if (requestedStart <= new Date()) {
    throw new Error('Non è possibile prenotare un orario già passato');
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
        medicalRecord: true,
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
        medicalRecord: true,
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
      medicalRecord: true,
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
    include: { doctor: true, patient: true, slot: true },
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
  }

  if (!ALLOWED_TRANSITIONS[appointment.status].includes(status)) {
    throw new Error(
      `Impossibile passare da "${STATUS_LABEL[appointment.status]}" a "${STATUS_LABEL[status]}"`
    );
  }

  return prisma.$transaction(async (tx) => {
    // Aggiornamento condizionato allo stato letto sopra: se due richieste
    // concorrenti cambiano lo stesso appuntamento, solo la prima passa (evita
    // ad esempio di creare due slot sostitutivi per un doppio annullamento).
    const changed = await tx.appointment.updateMany({
      where: { id, status: appointment.status },
      data: { status },
    });

    if (changed.count === 0) {
      throw new Error('Lo stato dell’appuntamento è cambiato nel frattempo, ricarica la pagina');
    }

    // Lo slot originale resta collegato all'appuntamento annullato (slotId è
    // univoco, e così l'appuntamento conserva data e orario nello storico).
    // Per rimettere l'orario a disposizione si crea uno slot libero identico,
    // solo se è ancora nel futuro.
    if (status === AppointmentStatus.CANCELLED && appointment.slot.startTime > new Date()) {
      await tx.availabilitySlot.create({
        data: {
          doctorId: appointment.slot.doctorId,
          date: appointment.slot.date,
          startTime: appointment.slot.startTime,
          endTime: appointment.slot.endTime,
          isBooked: false,
        },
      });
    }

    return tx.appointment.findUniqueOrThrow({
      where: { id },
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
