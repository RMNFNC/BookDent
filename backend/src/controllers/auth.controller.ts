import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    const result = await registerUser({
      email,
      password,
      role: role as Role,
    });

    res.status(201).json(result);
    return;
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Errore registrazione',
    });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(result);
    return;
  } catch (error) {
    res.status(401).json({
      message: error instanceof Error ? error.message : 'Errore login',
    });
    return;
  }
};
