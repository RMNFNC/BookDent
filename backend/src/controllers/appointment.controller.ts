import { Request, Response } from 'express';
import { AppointmentStatus } from '@prisma/client';
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from '../services/appointment.service';

export const createAppointmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const { doctorId, serviceId, slotId } = req.body;
    const patientId = Number(req.body.patientId);

    const appointment = await createAppointment({
      patientId,
      doctorId: Number(doctorId),
      serviceId: Number(serviceId),
      slotId: Number(slotId),
    });

    res.status(201).json(appointment);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore creazione appuntamento',
    });
    return;
  }
};

export const getMyAppointmentsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const appointments = await getMyAppointments(req.user.userId, req.user.role);
    res.status(200).json(appointments);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore recupero appuntamenti',
    });
    return;
  }
};

export const getAppointmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID appuntamento non valido' });
      return;
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      res.status(404).json({ message: 'Appuntamento non trovato' });
      return;
    }

    res.status(200).json(appointment);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore recupero appuntamento' });
    return;
  }
};

export const updateAppointmentStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID appuntamento non valido' });
      return;
    }

    const allowedStatuses = [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ message: 'Status non valido' });
      return;
    }

    const updatedAppointment = await updateAppointmentStatus(id, status);
    res.status(200).json(updatedAppointment);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore aggiornamento stato',
    });
    return;
  }
};
