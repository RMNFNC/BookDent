import { Request, Response } from 'express';
import { getAllServices, createDentalService } from '../services/service.service';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await getAllServices();
    res.status(200).json(services);
    return;
  } catch (error) {
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
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Errore creazione prestazione',
    });
    return;
  }
};