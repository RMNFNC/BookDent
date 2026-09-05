<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { fetchMyAppointments, fetchAllAppointments } from '../api/appointments';
import { fetchDoctors } from '../api/doctors';
import { fetchServices } from '../api/services';
import type { Appointment } from '../types';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import StatTile from '../components/ui/StatTile.vue';
import IconBase from '../components/ui/IconBase.vue';
import AppointmentCard from '../components/appointments/AppointmentCard.vue';

const auth = useAuthStore();
const loading = ref(true);
const appointments = ref<Appointment[]>([]);
const doctorCount = ref(0);
const serviceCount = ref(0);

const now = new Date();

const upcoming = computed(() =>
  appointments.value
    .filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.slot.startTime) >= now)
    .sort((a, b) => new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime())
);

const pendingCount = computed(() => appointments.value.filter((a) => a.status === 'PENDING').length);
const completedCount = computed(
  () => appointments.value.filter((a) => a.status === 'COMPLETED').length
);

const todayCount = computed(
  () =>
    appointments.value.filter((a) => {
      const d = new Date(a.slot.startTime);
      return d.toDateString() === now.toDateString();
    }).length
);

const onCardUpdated = (updated: Appointment) => {
  appointments.value = appointments.value.map((a) => (a.id === updated.id ? updated : a));
};

onMounted(async () => {
  try {
    if (auth.role === 'ADMIN') {
      const [all, doctors, services] = await Promise.all([
        fetchAllAppointments(),
        fetchDoctors(),
        fetchServices(),
      ]);
      appointments.value = all;
      doctorCount.value = doctors.filter((d) => d.isActive).length;
      serviceCount.value = services.filter((s) => s.isActive).length;
    } else {
      appointments.value = await fetchMyAppointments();
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page__header">
        <h1>Ciao, {{ auth.displayName }}</h1>
        <p v-if="auth.role === 'PATIENT'">Ecco un riepilogo dei tuoi prossimi appuntamenti.</p>
        <p v-else-if="auth.role === 'DOCTOR'">Ecco la situazione dei tuoi appuntamenti.</p>
        <p v-else>Panoramica generale dello studio.</p>
      </header>

      <BaseSpinner v-if="loading" />

      <template v-else>
        <!-- PATIENT -->
        <template v-if="auth.role === 'PATIENT'">
          <div class="stats">
            <StatTile icon="calendar" label="Prossimi appuntamenti" :value="upcoming.length" />
            <StatTile icon="check-circle" label="Visite completate" :value="completedCount" tone="secondary" />
          </div>

          <div class="cta-row">
            <RouterLink to="/prenota">
              <BaseButton size="lg">
                <IconBase name="plus" :size="18" />
                Prenota una visita
              </BaseButton>
            </RouterLink>
            <RouterLink to="/referti">
              <BaseButton size="lg" variant="outline">
                <IconBase name="file-text" :size="18" />
                I miei referti
              </BaseButton>
            </RouterLink>
          </div>

          <section class="section">
            <div class="section__head">
              <h2>Prossimi appuntamenti</h2>
              <RouterLink to="/appuntamenti" class="section__link">Vedi tutti</RouterLink>
            </div>
            <EmptyState
              v-if="!upcoming.length"
              icon="calendar"
              title="Nessun appuntamento in programma"
              description="Prenota la tua prossima visita in pochi passaggi."
            >
              <RouterLink to="/prenota">
                <BaseButton style="margin-top: 12px">Prenota ora</BaseButton>
              </RouterLink>
            </EmptyState>
            <div v-else class="list">
              <AppointmentCard
                v-for="appt in upcoming.slice(0, 3)"
                :key="appt.id"
                :appointment="appt"
                viewer-role="PATIENT"
                @updated="onCardUpdated"
              />
            </div>
          </section>
        </template>

        <!-- DOCTOR -->
        <template v-else-if="auth.role === 'DOCTOR'">
          <div class="stats">
            <StatTile icon="calendar" label="Appuntamenti oggi" :value="todayCount" />
            <StatTile icon="clock" label="Da confermare" :value="pendingCount" tone="secondary" />
            <StatTile icon="check-circle" label="Completati" :value="completedCount" />
          </div>

          <div class="cta-row">
            <RouterLink to="/disponibilita">
              <BaseButton size="lg">
                <IconBase name="calendar" :size="18" />
                Gestisci disponibilità
              </BaseButton>
            </RouterLink>
            <RouterLink to="/appuntamenti">
              <BaseButton size="lg" variant="outline">Vedi tutti gli appuntamenti</BaseButton>
            </RouterLink>
          </div>

          <section class="section">
            <div class="section__head">
              <h2>Prossimi appuntamenti</h2>
              <RouterLink to="/appuntamenti" class="section__link">Vedi tutti</RouterLink>
            </div>
            <EmptyState
              v-if="!upcoming.length"
              icon="calendar"
              title="Nessun appuntamento in programma"
            />
            <div v-else class="list">
              <AppointmentCard
                v-for="appt in upcoming.slice(0, 5)"
                :key="appt.id"
                :appointment="appt"
                viewer-role="DOCTOR"
                @updated="onCardUpdated"
              />
            </div>
          </section>
        </template>

        <!-- ADMIN -->
        <template v-else>
          <div class="stats">
            <StatTile icon="users" label="Dentisti attivi" :value="doctorCount" />
            <StatTile icon="file-text" label="Prestazioni attive" :value="serviceCount" tone="secondary" />
            <StatTile icon="calendar" label="Appuntamenti totali" :value="appointments.length" />
            <StatTile icon="clock" label="In attesa di conferma" :value="pendingCount" tone="secondary" />
          </div>

          <div class="cta-row">
            <RouterLink to="/admin/dottori"><BaseButton>Gestisci dentisti</BaseButton></RouterLink>
            <RouterLink to="/admin/servizi"><BaseButton variant="outline">Gestisci prestazioni</BaseButton></RouterLink>
            <RouterLink to="/admin/appuntamenti"><BaseButton variant="outline">Tutti gli appuntamenti</BaseButton></RouterLink>
          </div>

          <section class="section">
            <div class="section__head">
              <h2>Appuntamenti recenti</h2>
              <RouterLink to="/admin/appuntamenti" class="section__link">Vedi tutti</RouterLink>
            </div>
            <EmptyState v-if="!appointments.length" icon="calendar" title="Nessun appuntamento registrato" />
            <div v-else class="list">
              <AppointmentCard
                v-for="appt in appointments.slice(0, 5)"
                :key="appt.id"
                :appointment="appt"
                viewer-role="ADMIN"
              />
            </div>
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 0 72px;
  flex: 1;
}

.page__header {
  margin-bottom: 28px;
}

.page__header h1 {
  margin-bottom: 2px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.cta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.section {
  margin-top: 8px;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section__head h2 {
  margin: 0;
  font-size: 1.15rem;
}

.section__link {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  text-decoration: none;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
