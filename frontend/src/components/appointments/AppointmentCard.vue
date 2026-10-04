<script setup lang="ts">
import { computed, ref } from 'vue';
import { updateAppointmentStatusRequest } from '../../api/appointments';
import { extractErrorMessage } from '../../api/client';
import type { Appointment, AppointmentStatus, Role } from '../../types';
import { formatDate, formatTime, formatPrice } from '../../utils/format';
import { STATUS_LABEL, STATUS_TONE } from '../../utils/status';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseAlert from '../ui/BaseAlert.vue';
import IconBase from '../ui/IconBase.vue';

const props = defineProps<{
  appointment: Appointment;
  viewerRole: Role;
  showDetailLink?: boolean;
}>();
const emit = defineEmits<{ updated: [appointment: Appointment] }>();

const loading = ref(false);
const error = ref('');
const confirmAction = ref<{ status: AppointmentStatus; label: string; danger?: boolean } | null>(
  null
);

const counterpartName = computed(() => {
  if (props.viewerRole === 'PATIENT') {
    return `Dr. ${props.appointment.doctor.firstName} ${props.appointment.doctor.lastName}`;
  }
  return `${props.appointment.patient.firstName} ${props.appointment.patient.lastName}`;
});

const counterpartSub = computed(() => {
  if (props.viewerRole === 'PATIENT') return props.appointment.doctor.specialization;
  // L'admin vede gli appuntamenti di tutto lo studio: serve sapere anche il dentista
  if (props.viewerRole === 'ADMIN' && props.appointment.doctor) {
    return `Dr. ${props.appointment.doctor.firstName} ${props.appointment.doctor.lastName}`;
  }
  return 'Paziente';
});

const isPast = computed(() => new Date(props.appointment.slot.startTime) < new Date());

const canPatientCancel = computed(
  () =>
    props.viewerRole === 'PATIENT' && ['PENDING', 'CONFIRMED'].includes(props.appointment.status)
);

const doctorActions = computed(() => {
  if (props.viewerRole !== 'DOCTOR') return [];
  if (props.appointment.status === 'PENDING') {
    return [
      { status: 'CONFIRMED' as AppointmentStatus, label: 'Conferma', variant: 'primary' as const },
      { status: 'CANCELLED' as AppointmentStatus, label: 'Rifiuta', variant: 'danger' as const },
    ];
  }
  if (props.appointment.status === 'CONFIRMED') {
    return [
      {
        status: 'COMPLETED' as AppointmentStatus,
        label: 'Completa visita',
        variant: 'primary' as const,
      },
      { status: 'CANCELLED' as AppointmentStatus, label: 'Annulla', variant: 'ghost' as const },
    ];
  }
  return [];
});

const runStatusChange = async (status: AppointmentStatus) => {
  loading.value = true;
  error.value = '';
  try {
    const updated = await updateAppointmentStatusRequest(props.appointment.id, status);
    emit('updated', updated);
  } catch (e) {
    error.value = extractErrorMessage(e, 'Impossibile aggiornare lo stato');
  } finally {
    loading.value = false;
    confirmAction.value = null;
  }
};

const requestAction = (status: AppointmentStatus, label: string, danger = false) => {
  if (danger) {
    confirmAction.value = { status, label, danger };
  } else {
    runStatusChange(status);
  }
};
</script>

<template>
  <article class="card-appt">
    <div class="card-appt__main">
      <div class="card-appt__date">
        <IconBase name="calendar" :size="18" />
        <div>
          <strong>{{ formatDate(appointment.slot.startTime) }}</strong>
          <span
            >{{ formatTime(appointment.slot.startTime) }} –
            {{ formatTime(appointment.slot.endTime) }}</span
          >
        </div>
      </div>

      <div class="card-appt__info">
        <p class="card-appt__service">{{ appointment.service.name }}</p>
        <p class="card-appt__counterpart">{{ counterpartName }} · {{ counterpartSub }}</p>
        <p v-if="appointment.service.price" class="card-appt__price">
          {{ formatPrice(appointment.service.price) }}
        </p>
      </div>

      <BaseBadge :tone="STATUS_TONE[appointment.status]">
        {{ STATUS_LABEL[appointment.status] }}
      </BaseBadge>
    </div>

    <BaseAlert v-if="error" tone="danger">{{ error }}</BaseAlert>

    <div class="card-appt__actions">
      <RouterLink
        v-if="showDetailLink !== false"
        :to="`/appuntamenti/${appointment.id}`"
        class="card-appt__link"
      >
        Dettagli
        <IconBase name="chevron-right" :size="16" />
      </RouterLink>

      <template v-if="viewerRole === 'DOCTOR'">
        <BaseButton
          v-for="action in doctorActions"
          :key="action.status"
          size="sm"
          :variant="action.variant"
          :loading="loading"
          :disabled="action.status === 'COMPLETED' && !isPast"
          :title="
            action.status === 'COMPLETED' && !isPast
              ? 'Potrai completare la visita dopo l’orario di inizio'
              : undefined
          "
          @click="requestAction(action.status, action.label, action.status === 'CANCELLED')"
        >
          {{ action.label }}
        </BaseButton>

        <RouterLink
          v-if="appointment.status === 'COMPLETED' && !appointment.medicalRecord"
          :to="`/appuntamenti/${appointment.id}/referto`"
          class="card-appt__cta"
        >
          <IconBase name="file-text" :size="16" />
          Scrivi referto
        </RouterLink>
      </template>

      <RouterLink
        v-if="
          viewerRole !== 'ADMIN' && appointment.status === 'COMPLETED' && appointment.medicalRecord
        "
        :to="`/referti/${appointment.medicalRecord.id}`"
        class="card-appt__link"
      >
        <IconBase name="file-text" :size="16" />
        Vedi referto
      </RouterLink>

      <BaseButton
        v-if="canPatientCancel"
        size="sm"
        variant="danger"
        :disabled="isPast"
        @click="
          confirmAction = { status: 'CANCELLED', label: 'Annulla appuntamento', danger: true }
        "
      >
        Annulla
      </BaseButton>
    </div>

    <BaseModal :open="!!confirmAction" :title="confirmAction?.label" @close="confirmAction = null">
      <p>
        Confermi di voler
        {{ confirmAction?.status === 'CANCELLED' ? 'annullare' : 'procedere con' }} questo
        appuntamento del {{ formatDate(appointment.slot.startTime) }} alle
        {{ formatTime(appointment.slot.startTime) }}?
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="confirmAction = null">Torna indietro</BaseButton>
        <BaseButton
          variant="danger"
          :loading="loading"
          @click="confirmAction && runStatusChange(confirmAction.status)"
        >
          Conferma
        </BaseButton>
      </template>
    </BaseModal>
  </article>
</template>

<style scoped>
.card-appt {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm);
}

.card-appt__main {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.card-appt__date {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary-dark);
  min-width: 160px;
}

.card-appt__date strong {
  display: block;
  font-size: 0.92rem;
  color: var(--color-text);
  text-transform: capitalize;
}

.card-appt__date span {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.card-appt__info {
  flex: 1;
  min-width: 180px;
}

.card-appt__service {
  margin: 0;
  font-weight: 700;
  color: var(--color-text);
}

.card-appt__counterpart {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.card-appt__price {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.card-appt__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
}

/* Nessuna azione disponibile (es. vista admin): niente riga vuota col bordo */
.card-appt__actions:not(:has(*)) {
  display: none;
}

.card-appt__link,
.card-appt__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  padding: 8px 4px;
}

.card-appt__link {
  color: var(--color-text-secondary);
  margin-right: auto;
}

.card-appt__link:hover {
  color: var(--color-primary-dark);
}

.card-appt__cta {
  color: var(--color-primary-dark);
  background: var(--color-primary-light);
  padding: 8px 14px;
  border-radius: var(--radius-pill);
}

.card-appt__cta:hover {
  background: var(--color-primary);
  color: #fff;
}
</style>
