import { Request, Response } from 'express';
import { getSlotsByDoctor, createSlot, deleteSlot } from '../services/slot.service';

export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);

    if (isNaN(doctorId)) {
      res.status(400).json({ message: 'ID dentista non valido' });
      return;
    }

    const slots = await getSlotsByDoctor(doctorId);
    res.status(200).json(slots);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore nel recupero slot' });
    return;
  }
};

export const addSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);
    const { date, startTime, endTime } = req.body;

    if (isNaN(doctorId)) {
      res.status(400).json({ message: 'ID dentista non valido' });
      return;
    }

    const slot = await createSlot({ doctorId, date, startTime, endTime });
    res.status(201).json(slot);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore creazione slot',
    });
    return;
  }
};

export const removeSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = Number(req.params.id);
    const slotId = Number(req.params.slotId);

    if (isNaN(doctorId) || isNaN(slotId)) {
      res.status(400).json({ message: 'ID non valido' });
      return;
    }

    await deleteSlot(slotId, doctorId);
    res.status(200).json({ message: 'Slot eliminato con successo' });
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore eliminazione slot',
    });
    return;
  }
};
