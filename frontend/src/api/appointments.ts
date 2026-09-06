import { apiClient } from './client';
import type { Appointment, AppointmentStatus, AvailableSlot } from '../types';

export const fetchAvailability = (serviceId: number, date: string) =>
  apiClient
    .get<AvailableSlot[]>('/appointments/availability', { params: { serviceId, date } })
    .then((res) => res.data);

export interface BookAppointmentPayload {
  serviceId: number;
  date: string;
  startTime: string;
}

export const bookAppointmentRequest = (payload: BookAppointmentPayload) =>
  apiClient.post<Appointment>('/appointments', payload).then((res) => res.data);

export const fetchMyAppointments = () =>
  apiClient.get<Appointment[]>('/appointments/me').then((res) => res.data);

export const fetchAllAppointments = () =>
  apiClient.get<Appointment[]>('/appointments').then((res) => res.data);

export const fetchAppointment = (id: number) =>
  apiClient.get<Appointment>(`/appointments/${id}`).then((res) => res.data);

export const updateAppointmentStatusRequest = (id: number, status: AppointmentStatus) =>
  apiClient.put<Appointment>(`/appointments/${id}/status`, { status }).then((res) => res.data);
