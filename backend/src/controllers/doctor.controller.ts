import { Request, Response } from 'express';
import { getAllDoctors, getDoctorById } from '../services/doctor.service';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await getAllDoctors();
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
