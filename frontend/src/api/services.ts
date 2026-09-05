import { apiClient } from './client';
import type { DentalService } from '../types';

export const fetchServices = () =>
  apiClient.get<DentalService[]>('/services').then((res) => res.data);

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMin?: number;
  price?: number;
}

export const createServiceRequest = (payload: CreateServicePayload) =>
  apiClient.post<DentalService>('/services', payload).then((res) => res.data);

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  durationMin?: number;
  price?: number;
  isActive?: boolean;
}

export const updateServiceRequest = (id: number, payload: UpdateServicePayload) =>
  apiClient.patch<DentalService>(`/services/${id}`, payload).then((res) => res.data);
