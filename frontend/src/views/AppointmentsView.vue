<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { fetchMyAppointments } from '../api/appointments';
import type { Appointment, AppointmentStatus } from '../types';
import { STATUS_LABEL } from '../utils/status';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import AppointmentCard from '../components/appointments/AppointmentCard.vue';

const auth = useAuthStore();
const appointments = ref<Appointment[]>([]);
const loading = ref(true);
const filter = ref<'ALL' | AppointmentStatus>('ALL');

const tabs: { value: 'ALL' | AppointmentStatus; label: string }[] = [
  { value: 'ALL', label: 'Tutti' },
  { value: 'PENDING', label: STATUS_LABEL.PENDING },
  { value: 'CONFIRMED', label: STATUS_LABEL.CONFIRMED },
  { value: 'COMPLETED', label: STATUS_LABEL.COMPLETED },
  { value: 'CANCELLED', label: STATUS_LABEL.CANCELLED },
];

const filtered = computed(() =>
  filter.value === 'ALL'
    ? appointments.value
    : appointments.value.filter((a) => a.status === filter.value)
);

const onUpdated = (updated: Appointment) => {
  appointments.value = appointments.value.map((a) => (a.id === updated.id ? updated : a));
};

onMounted(async () => {
  try {
    appointments.value = await fetchMyAppointments();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page__header">
        <h1>I miei appuntamenti</h1>
      </header>

      <div class="tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="tab"
          :class="{ 'tab--active': filter === tab.value }"
          @click="filter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <BaseSpinner v-if="loading" />
      <EmptyState
        v-else-if="!filtered.length"
        icon="calendar"
        title="Nessun appuntamento"
        description="Non ci sono appuntamenti in questa categoria."
      />
      <div v-else class="list">
        <AppointmentCard
          v-for="appt in filtered"
          :key="appt.id"
          :appointment="appt"
          :viewer-role="auth.role!"
          @updated="onUpdated"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 0 72px;
  flex: 1;
}

.page__header {
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 24px;
}

.tab {
  padding: 9px 16px;
  border-radius: var(--radius-pill);
  border: none;
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.87rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tab--active {
  background: var(--color-primary);
  color: #fff;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
