import type { AppointmentStatus } from '../types';

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'In attesa',
  CONFIRMED: 'Confermato',
  COMPLETED: 'Completato',
  CANCELLED: 'Annullato',
};

export const STATUS_TONE: Record<AppointmentStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};
