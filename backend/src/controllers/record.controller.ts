import { Request, Response } from 'express';
import {
  createMedicalRecord,
  getMyRecords,
  getRecordById,
  updateMedicalRecord,
} from '../services/record.service';

export const createRecordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointmentId, diagnosis, treatment, notes } = req.body;

    const record = await createMedicalRecord({
      appointmentId: Number(appointmentId),
      diagnosis,
      treatment,
      notes,
    });

    res.status(201).json(record);
    return;
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Errore creazione referto',
    });
    return;
  }
};

export const getMyRecordsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const records = await getMyRecords(req.user.userId, req.user.role);
    res.status(200).json(records);
    return;
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Errore recupero referti',
    });
    return;
  }
};

export const getRecordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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

    res.status(200).json(record);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Errore recupero referto' });
    return;
  }
};

export const updateRecordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { diagnosis, treatment, notes } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID referto non valido' });
      return;
    }

    const updatedRecord = await updateMedicalRecord(id, {
      diagnosis,
      treatment,
      notes,
    });

    res.status(200).json(updatedRecord);
    return;
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Errore aggiornamento referto',
    });
    return;
  }
};