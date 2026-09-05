import { Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken } from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, codiceFiscale, dateOfBirth, phone } = req.body;

    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
      codiceFiscale,
      dateOfBirth,
      phone,
    });

    res.status(201).json(result);
    return;
  } catch (_error) {
    res.status(400).json({
      message: _error instanceof Error ? _error.message : 'Errore registrazione',
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
  } catch (_error) {
    res.status(401).json({
      message: _error instanceof Error ? _error.message : 'Errore login',
    });
    return;
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json(result);
    return;
  } catch (_error) {
    res.status(401).json({
      message: _error instanceof Error ? _error.message : 'Errore refresh token',
    });
    return;
  }
};
