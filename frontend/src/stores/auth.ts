import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  loginRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from '../api/auth';
import { fetchMe } from '../api/users';
import { tokenStorage } from '../api/tokenStorage';
import type { AuthUser, MeProfile } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(tokenStorage.getUser<AuthUser>());
  const profile = ref<MeProfile | null>(null);

  const isAuthenticated = computed(() => user.value !== null);
  const role = computed(() => user.value?.role ?? null);

  const displayName = computed(() => {
    const p = profile.value;
    if (p?.doctor) return `Dr. ${p.doctor.firstName} ${p.doctor.lastName}`;
    if (p?.patient) return `${p.patient.firstName} ${p.patient.lastName}`;
    return user.value?.email ?? '';
  });

  const doctorId = computed(() => profile.value?.doctor?.id ?? null);
  const patientId = computed(() => profile.value?.patient?.id ?? null);

  const loadProfile = async () => {
    if (!user.value) return;
    profile.value = await fetchMe();
  };

  const login = async (payload: LoginPayload) => {
    const data = await loginRequest(payload);
    tokenStorage.setSession(data.accessToken, data.refreshToken, data.user);
    user.value = data.user;
    await loadProfile();
    return data.user;
  };

  const register = async (payload: RegisterPayload) => {
    const data = await registerRequest(payload);
    tokenStorage.setSession(data.accessToken, data.refreshToken, data.user);
    user.value = data.user;
    await loadProfile();
    return data.user;
  };

  const logout = () => {
    tokenStorage.clear();
    user.value = null;
    profile.value = null;
  };

  return {
    user,
    profile,
    isAuthenticated,
    role,
    displayName,
    doctorId,
    patientId,
    loadProfile,
    login,
    register,
    logout,
  };
});
