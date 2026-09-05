import { apiClient } from './client';
import type { AvailabilitySlot, DoctorSummary } from '../types';

export const fetchDoctors = () =>
  apiClient.get<DoctorSummary[]>('/doctors').then((res) => res.data);

export const fetchDoctor = (id: number) =>
  apiClient
    .get<DoctorSummary & { slots: AvailabilitySlot[] }>(`/doctors/${id}`)
    .then((res) => res.data);

export interface CreateDoctorPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string;
  bio?: string;
}

export const createDoctorRequest = (payload: CreateDoctorPayload) =>
  apiClient.post('/doctors', payload).then((res) => res.data);

export interface UpdateDoctorPayload {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  bio?: string;
  isActive?: boolean;
}

export const updateDoctorRequest = (id: number, payload: UpdateDoctorPayload) =>
  apiClient.patch<DoctorSummary>(`/doctors/${id}`, payload).then((res) => res.data);

export interface CreateSlotPayload {
  date: string;
  startTime: string;
  endTime: string;
}

export const fetchDoctorSlots = (doctorId: number) =>
  apiClient
    .get<AvailabilitySlot[]>(`/doctors/${doctorId}/slots`)
    .then((res) => res.data);

export const createSlotRequest = (doctorId: number, payload: CreateSlotPayload) =>
  apiClient
    .post<AvailabilitySlot>(`/doctors/${doctorId}/slots`, payload)
    .then((res) => res.data);

export const deleteSlotRequest = (doctorId: number, slotId: number) =>
  apiClient.delete(`/doctors/${doctorId}/slots/${slotId}`).then((res) => res.data);
