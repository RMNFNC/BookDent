import { apiClient } from './client';
import type { MedicalRecord } from '../types';

export const fetchMyRecords = () =>
  apiClient.get<MedicalRecord[]>('/records/me').then((res) => res.data);

export const fetchRecord = (id: number) =>
  apiClient.get<MedicalRecord>(`/records/${id}`).then((res) => res.data);

export interface CreateRecordPayload {
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  notes?: string;
}

export const createRecordRequest = (payload: CreateRecordPayload) =>
  apiClient.post<MedicalRecord>('/records', payload).then((res) => res.data);

export interface UpdateRecordPayload {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export const updateRecordRequest = (id: number, payload: UpdateRecordPayload) =>
  apiClient.put<MedicalRecord>(`/records/${id}`, payload).then((res) => res.data);
