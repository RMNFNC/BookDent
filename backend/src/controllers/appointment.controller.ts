import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from '../services/appointment.service';
import { searchAvailableSlots } from '../services/slot.service';

export const createAppointmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const { serviceId, date, startTime } = req.body;

    const appointment = await createAppointment({
      userId: req.user.userId,
      serviceId: Number(serviceId),
      date,
      startTime,
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

export const getAvailabilityHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const serviceId = Number(req.query.serviceId);
    const date = String(req.query.date ?? '');

    if (isNaN(serviceId)) {
      res.status(400).json({ message: 'serviceId non valido' });
      return;
    }

    const slots = await searchAvailableSlots({ serviceId, date });
    res.status(200).json(slots);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore ricerca disponibilità',
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

export const getAllAppointmentsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await getAllAppointments();
    res.status(200).json(appointments);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore recupero appuntamenti' });
    return;
  }
};

export const getAppointmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

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

    const isOwner =
      req.user.role === Role.ADMIN ||
      (req.user.role === Role.PATIENT && appointment.patient.userId === req.user.userId) ||
      (req.user.role === Role.DOCTOR && appointment.doctor.user.id === req.user.userId);

    if (!isOwner) {
      res.status(403).json({ message: 'Accesso negato' });
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
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID appuntamento non valido' });
      return;
    }

    const updatedAppointment = await updateAppointmentStatus(id, status, {
      userId: req.user.userId,
      role: req.user.role,
    });
    res.status(200).json(updatedAppointment);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore aggiornamento stato',
    });
    return;
  }
};
