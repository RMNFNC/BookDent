<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { fetchRecord } from '../api/records';
import { extractErrorMessage } from '../api/client';
import type { MedicalRecord } from '../types';
import { formatDate, formatTime } from '../utils/format';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import IconBase from '../components/ui/IconBase.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
const auth = useAuthStore();

const record = ref<MedicalRecord | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    record.value = await fetchRecord(Number(props.id));
  } catch (e) {
    error.value = extractErrorMessage(e, 'Impossibile caricare il referto');
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

      <template v-else-if="record">
        <header class="page__header">
          <div class="page__icon"><IconBase name="file-text" :size="22" /></div>
          <div>
            <h1>{{ record.appointment?.service.name }}</h1>
            <p v-if="record.appointment" class="text-muted">
              {{ formatDate(record.appointment.slot.startTime) }} ·
              {{ formatTime(record.appointment.slot.startTime) }} · Dr.
              {{ record.appointment.doctor.firstName }} {{ record.appointment.doctor.lastName }}
            </p>
          </div>
        </header>

        <BaseCard>
          <dl class="details">
            <div>
              <dt>Diagnosi</dt>
              <dd>{{ record.diagnosis }}</dd>
            </div>
            <div>
              <dt>Trattamento</dt>
              <dd>{{ record.treatment }}</dd>
            </div>
            <div v-if="record.notes">
              <dt>Note</dt>
              <dd>{{ record.notes }}</dd>
            </div>
          </dl>
        </BaseCard>

        <div v-if="auth.role === 'DOCTOR' && record.appointment" class="actions">
          <RouterLink :to="`/appuntamenti/${record.appointment.id}/referto`">
            <BaseButton variant="outline">
              <IconBase name="edit" :size="16" />
              Modifica referto
            </BaseButton>
          </RouterLink>
        </div>
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
  max-width: 640px;
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
  gap: 14px;
  margin-bottom: 20px;
}

.page__header h1 {
  margin-bottom: 4px;
}

.page__header p {
  margin: 0;
  text-transform: capitalize;
}

.page__icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0;
}

.details dt {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 4px;
}

.details dd {
  margin: 0;
  color: var(--color-text);
}

.actions {
  margin-top: 20px;
}
</style>
