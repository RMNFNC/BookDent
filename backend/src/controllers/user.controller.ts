import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Non autorizzato' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Utente non trovato' });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero profilo' });
    return;
  }
};