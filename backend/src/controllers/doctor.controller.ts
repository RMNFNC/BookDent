import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
} from '../services/doctor.service';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.user?.role === Role.ADMIN;
    const doctors = await getAllDoctors(includeInactive);
    res.status(200).json(doctors);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore nel recupero dentisti' });
    return;
  }
};

export const getDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID non valido' });
      return;
    }

    const doctor = await getDoctorById(id);

    if (!doctor) {
      res.status(404).json({ message: 'Dentista non trovato' });
      return;
    }

    res.status(200).json(doctor);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore nel recupero dettaglio dentista' });
    return;
  }
};

export const addDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, specialization, bio } = req.body;

    const doctor = await createDoctor({
      email,
      password,
      firstName,
      lastName,
      specialization,
      bio,
    });

    res.status(201).json(doctor);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore creazione dentista',
    });
    return;
  }
};

export const editDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID non valido' });
      return;
    }

    const { firstName, lastName, specialization, bio, isActive } = req.body;

    const doctor = await updateDoctor(id, { firstName, lastName, specialization, bio, isActive });
    res.status(200).json(doctor);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore aggiornamento dentista',
    });
    return;
  }
};
