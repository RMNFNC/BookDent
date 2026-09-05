import { apiClient } from './client';
import type { MeProfile } from '../types';

export const fetchMe = () => apiClient.get<MeProfile>('/users/me').then((res) => res.data);
