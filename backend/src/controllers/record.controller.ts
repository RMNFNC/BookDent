import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import {
  createMedicalRecord,
  getMyRecords,
  getRecordById,
  updateMedicalRecord,
} from '../services/record.service';

export const createRecordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const { appointmentId, diagnosis, treatment, notes } = req.body;

    const record = await createMedicalRecord({
      appointmentId: Number(appointmentId),
      diagnosis,
      treatment,
      notes,
      doctorUserId: req.user.userId,
    });

    res.status(201).json(record);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore creazione referto',
    });
    return;
  }
};

export const getMyRecordsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const records = await getMyRecords(req.user.userId, req.user.role);
    res.status(200).json(records);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore recupero referti',
    });
    return;
  }
};

export const getRecordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID referto non valido' });
      return;
    }

    const record = await getRecordById(id);

    if (!record) {
      res.status(404).json({ message: 'Referto non trovato' });
      return;
    }

    const isOwner =
      req.user.role === Role.ADMIN ||
      (req.user.role === Role.PATIENT && record.appointment.patient.userId === req.user.userId) ||
      (req.user.role === Role.DOCTOR && record.appointment.doctor.user.id === req.user.userId);

    if (!isOwner) {
      res.status(403).json({ message: 'Accesso negato' });
      return;
    }

    res.status(200).json(record);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore recupero referto' });
    return;
  }
};

export const updateRecordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const id = Number(req.params.id);
    const { diagnosis, treatment, notes } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID referto non valido' });
      return;
    }

    const updatedRecord = await updateMedicalRecord(
      id,
      {
        diagnosis,
        treatment,
        notes,
      },
      req.user.userId
    );

    res.status(200).json(updatedRecord);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore aggiornamento referto',
    });
    return;
  }
};
