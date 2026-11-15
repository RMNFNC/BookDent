<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchAllAppointments } from '../api/appointments';
import type { Appointment, AppointmentStatus } from '../types';
import { STATUS_LABEL } from '../utils/status';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import AppointmentCard from '../components/appointments/AppointmentCard.vue';
import { extractErrorMessage } from '../api/client';

const appointments = ref<Appointment[]>([]);
const loading = ref(true);
const error = ref('');
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
  appointments.value = appointments.value.map((a) =>
    a.id === updated.id ? { ...a, ...updated, medicalRecord: a.medicalRecord } : a
  );
};

onMounted(async () => {
  try {
    appointments.value = await fetchAllAppointments();
  } catch (e) {
    error.value = extractErrorMessage(e, 'Impossibile caricare gli appuntamenti');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page__header">
        <h1>Tutti gli appuntamenti</h1>
        <p>
          Panoramica di tutte le prenotazioni dello studio. Puoi annullare le visite in attesa o
          confermate.
        </p>
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
      <BaseAlert v-else-if="error" tone="danger">{{ error }}</BaseAlert>
      <EmptyState v-else-if="!filtered.length" icon="calendar" title="Nessun appuntamento" />
      <div v-else class="list">
        <AppointmentCard
          v-for="appt in filtered"
          :key="appt.id"
          :appointment="appt"
          viewer-role="ADMIN"
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
