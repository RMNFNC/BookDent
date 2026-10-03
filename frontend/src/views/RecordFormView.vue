<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAppointment } from '../api/appointments';
import { createRecordRequest, updateRecordRequest } from '../api/records';
import { extractErrorMessage } from '../api/client';
import type { Appointment } from '../types';
import { formatDate, formatTime } from '../utils/format';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseTextarea from '../components/ui/BaseTextarea.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';

const props = defineProps<{ appointmentId: string }>();
const router = useRouter();

const appointment = ref<Appointment | null>(null);
const loading = ref(true);
const loadError = ref('');
const submitError = ref('');
const saving = ref(false);

const form = reactive({ diagnosis: '', treatment: '', notes: '' });

onMounted(async () => {
  try {
    const appt = await fetchAppointment(Number(props.appointmentId));
    appointment.value = appt;
    if (appt.medicalRecord) {
      form.diagnosis = appt.medicalRecord.diagnosis;
      form.treatment = appt.medicalRecord.treatment;
      form.notes = appt.medicalRecord.notes ?? '';
    }
  } catch (e) {
    loadError.value = extractErrorMessage(e, 'Impossibile caricare l’appuntamento');
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (!appointment.value) return;
  saving.value = true;
  submitError.value = '';
  try {
    const existing = appointment.value.medicalRecord;
    const record = existing
      ? await updateRecordRequest(existing.id, { ...form })
      : await createRecordRequest({ appointmentId: appointment.value.id, ...form });
    router.push(`/referti/${record.id}`);
  } catch (e) {
    submitError.value = extractErrorMessage(e, 'Impossibile salvare il referto');
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="container container--narrow">
      <BaseSpinner v-if="loading" />
      <BaseAlert v-else-if="loadError" tone="danger">{{ loadError }}</BaseAlert>

      <template v-else-if="appointment">
        <header class="page__header">
          <h1>{{ appointment.medicalRecord ? 'Modifica referto' : 'Nuovo referto' }}</h1>
          <p>
            {{ appointment.patient.firstName }} {{ appointment.patient.lastName }} ·
            {{ appointment.service.name }} · {{ formatDate(appointment.slot.startTime) }}
            {{ formatTime(appointment.slot.startTime) }}
          </p>
        </header>

        <BaseCard>
          <form class="stack" style="gap: 16px" @submit.prevent="handleSubmit">
            <BaseAlert v-if="submitError" tone="danger">{{ submitError }}</BaseAlert>

            <BaseTextarea v-model="form.diagnosis" label="Diagnosi" required :rows="3" />
            <BaseTextarea
              v-model="form.treatment"
              label="Trattamento eseguito"
              required
              :rows="3"
            />
            <BaseTextarea v-model="form.notes" label="Note (opzionale)" :rows="3" />

            <div class="actions">
              <BaseButton type="submit" :loading="saving">Salva referto</BaseButton>
              <RouterLink :to="`/appuntamenti/${appointment.id}`">
                <BaseButton type="button" variant="ghost">Annulla</BaseButton>
              </RouterLink>
            </div>
          </form>
        </BaseCard>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 0 72px;
  flex: 1;
}

.container--narrow {
  max-width: 640px;
}

.page__header {
  margin-bottom: 24px;
}

.page__header p {
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
}
</style>
