import { Request, Response } from 'express';
import {
  getAllServices,
  createDentalService,
  updateDentalService,
} from '../services/service.service';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await getAllServices();
    res.status(200).json(services);
    return;
  } catch (_error) {
    res.status(500).json({ message: 'Errore nel recupero prestazioni' });
    return;
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, durationMin, price } = req.body;

    const service = await createDentalService({
      name,
      description,
      durationMin,
      price,
    });

    res.status(201).json(service);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore creazione prestazione',
    });
    return;
  }
};

export const editService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ message: 'ID non valido' });
      return;
    }

    const { name, description, durationMin, price, isActive } = req.body;

    const service = await updateDentalService(id, {
      name,
      description,
      durationMin,
      price,
      isActive,
    });
    res.status(200).json(service);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore aggiornamento prestazione',
    });
    return;
  }
};
