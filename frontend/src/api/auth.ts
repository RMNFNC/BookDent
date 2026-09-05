import { apiClient } from './client';
import type { AuthResponse } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  codiceFiscale: string;
  dateOfBirth: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerRequest = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>('/auth/register', payload).then((res) => res.data);

export const loginRequest = (payload: LoginPayload) =>
  apiClient.post<AuthResponse>('/auth/login', payload).then((res) => res.data);
