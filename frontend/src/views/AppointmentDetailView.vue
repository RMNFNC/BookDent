<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { fetchAppointment } from '../api/appointments';
import { extractErrorMessage } from '../api/client';
import type { Appointment } from '../types';
import { formatDate, formatPrice, formatTime } from '../utils/format';
import { STATUS_LABEL, STATUS_TONE } from '../utils/status';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import IconBase from '../components/ui/IconBase.vue';
import AppointmentCard from '../components/appointments/AppointmentCard.vue';

const props = defineProps<{ id: string }>();
const auth = useAuthStore();
const router = useRouter();

const appointment = ref<Appointment | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    appointment.value = await fetchAppointment(Number(props.id));
  } catch (e) {
    error.value = extractErrorMessage(e, 'Impossibile caricare l’appuntamento');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="container container--narrow">
      <button class="back" type="button" @click="router.back()">
        <IconBase name="chevron-right" :size="16" style="transform: rotate(180deg)" />
        Indietro
      </button>

      <BaseSpinner v-if="loading" />
      <BaseAlert v-else-if="error" tone="danger">{{ error }}</BaseAlert>

      <template v-else-if="appointment">
        <header class="page__header">
          <div>
            <h1>{{ appointment.service.name }}</h1>
            <p>
              {{ formatDate(appointment.slot.startTime) }} ·
              {{ formatTime(appointment.slot.startTime) }} –
              {{ formatTime(appointment.slot.endTime) }}
            </p>
          </div>
          <BaseBadge :tone="STATUS_TONE[appointment.status]">
            {{ STATUS_LABEL[appointment.status] }}
          </BaseBadge>
        </header>

        <div class="grid">
          <BaseCard>
            <h3>Dettagli visita</h3>
            <dl class="details">
              <div>
                <dt>Prestazione</dt>
                <dd>{{ appointment.service.name }}</dd>
              </div>
              <div v-if="appointment.service.price">
                <dt>Costo</dt>
                <dd>{{ formatPrice(appointment.service.price) }}</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>{{ formatDate(appointment.slot.startTime) }}</dd>
              </div>
              <div>
                <dt>Orario</dt>
                <dd>
                  {{ formatTime(appointment.slot.startTime) }} –
                  {{ formatTime(appointment.slot.endTime) }}
                </dd>
              </div>
            </dl>
          </BaseCard>

          <BaseCard v-if="auth.role === 'PATIENT'">
            <h3>Il tuo dentista</h3>
            <p class="person-name">
              Dr. {{ appointment.doctor.firstName }} {{ appointment.doctor.lastName }}
            </p>
            <p class="text-muted">{{ appointment.doctor.specialization }}</p>
            <p v-if="appointment.doctor.bio">{{ appointment.doctor.bio }}</p>
          </BaseCard>

          <BaseCard v-else>
            <h3>Paziente</h3>
            <p class="person-name">
              {{ appointment.patient.firstName }} {{ appointment.patient.lastName }}
            </p>
            <dl class="details">
              <div>
                <dt>Telefono</dt>
                <dd>{{ appointment.patient.phone }}</dd>
              </div>
              <div>
                <dt>Codice fiscale</dt>
                <dd>{{ appointment.patient.codiceFiscale }}</dd>
              </div>
            </dl>
          </BaseCard>
        </div>

        <BaseCard v-if="appointment.medicalRecord" class="record-card">
          <h3><IconBase name="file-text" :size="18" /> Referto</h3>
          <dl class="details">
            <div>
              <dt>Diagnosi</dt>
              <dd>{{ appointment.medicalRecord.diagnosis }}</dd>
            </div>
            <div>
              <dt>Trattamento</dt>
              <dd>{{ appointment.medicalRecord.treatment }}</dd>
            </div>
            <div v-if="appointment.medicalRecord.notes">
              <dt>Note</dt>
              <dd>{{ appointment.medicalRecord.notes }}</dd>
            </div>
          </dl>
        </BaseCard>

        <AppointmentCard
          :appointment="appointment"
          :viewer-role="auth.role!"
          :show-detail-link="false"
          @updated="(u) => (appointment = u)"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 32px 0 72px;
  flex: 1;
}

.container--narrow {
  max-width: 760px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 4px;
}

.back:hover {
  color: var(--color-text);
}

.page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page__header h1 {
  margin-bottom: 4px;
}

.page__header p {
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.grid h3,
.record-card h3 {
  margin-bottom: 14px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.person-name {
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2px;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
}

.details div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.details dt {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.details dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.record-card {
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .page__header {
    flex-direction: column;
  }
}
</style>
