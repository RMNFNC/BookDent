<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { fetchServices } from '../api/services';
import { fetchAvailability, bookAppointmentRequest } from '../api/appointments';
import { extractErrorMessage } from '../api/client';
import type { Appointment, AvailableSlot, DentalService } from '../types';
import { formatDate, formatDuration, formatPrice, formatTime } from '../utils/format';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import IconBase from '../components/ui/IconBase.vue';

const services = ref<DentalService[]>([]);
const serviceId = ref('');
const date = ref('');
const minDate = new Date().toISOString().slice(0, 10);

const availableSlots = ref<AvailableSlot[]>([]);
const searching = ref(false);
const searchError = ref('');
const hasSearched = ref(false);

const booking = ref(false);
const bookingError = ref('');
const confirmedAppointment = ref<Appointment | null>(null);

const selectedService = computed(() =>
  services.value.find((s) => s.id === Number(serviceId.value))
);

const groupedTimes = computed(() => {
  const map = new Map<string, AvailableSlot[]>();
  for (const slot of availableSlots.value) {
    if (!map.has(slot.startTime)) map.set(slot.startTime, []);
    map.get(slot.startTime)!.push(slot);
  }
  return [...map.keys()]
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((startTime) => ({ startTime, count: map.get(startTime)!.length }));
});

onMounted(async () => {
  services.value = await fetchServices();
});

const search = async () => {
  if (!serviceId.value || !date.value) return;
  searching.value = true;
  searchError.value = '';
  hasSearched.value = true;
  availableSlots.value = [];
  try {
    availableSlots.value = await fetchAvailability(Number(serviceId.value), date.value);
  } catch (e) {
    searchError.value = extractErrorMessage(e, 'Impossibile cercare la disponibilità');
  } finally {
    searching.value = false;
  }
};

watch([serviceId, date], () => {
  confirmedAppointment.value = null;
  if (serviceId.value && date.value) search();
});

const book = async (startTime: string) => {
  booking.value = true;
  bookingError.value = '';
  try {
    confirmedAppointment.value = await bookAppointmentRequest({
      serviceId: Number(serviceId.value),
      date: date.value,
      startTime,
    });
  } catch (e) {
    bookingError.value = extractErrorMessage(e, 'Impossibile completare la prenotazione');
  } finally {
    booking.value = false;
  }
};

const startOver = () => {
  confirmedAppointment.value = null;
  serviceId.value = '';
  date.value = '';
  availableSlots.value = [];
  hasSearched.value = false;
};
</script>

<template>
  <div class="page">
    <div class="container container--narrow">
      <header class="page__header">
        <h1>Prenota una visita</h1>
        <p>
          Scegli la prestazione e l’orario che preferisci: il dentista disponibile viene assegnato
          automaticamente, senza bisogno di sceglierlo tu.
        </p>
      </header>

      <BaseCard v-if="confirmedAppointment" class="confirmation">
        <div class="confirmation__icon"><IconBase name="check-circle" :size="26" /></div>
        <h2>Appuntamento richiesto!</h2>
        <p>Riceverai la conferma dal dentista assegnato. Ecco il riepilogo:</p>
        <dl class="confirmation__details">
          <div>
            <dt>Prestazione</dt>
            <dd>{{ confirmedAppointment.service.name }}</dd>
          </div>
          <div>
            <dt>Quando</dt>
            <dd>
              {{ formatDate(confirmedAppointment.slot.startTime) }} ·
              {{ formatTime(confirmedAppointment.slot.startTime) }}
            </dd>
          </div>
          <div>
            <dt>Dentista assegnato</dt>
            <dd>
              Dr. {{ confirmedAppointment.doctor.firstName }}
              {{ confirmedAppointment.doctor.lastName }} ·
              {{ confirmedAppointment.doctor.specialization }}
            </dd>
          </div>
          <div>
            <dt>Stato</dt>
            <dd><BaseBadge tone="warning">In attesa di conferma</BaseBadge></dd>
          </div>
        </dl>
        <div class="confirmation__actions">
          <RouterLink to="/appuntamenti"
            ><BaseButton>Vai ai miei appuntamenti</BaseButton></RouterLink
          >
          <BaseButton variant="ghost" @click="startOver">Prenota un’altra visita</BaseButton>
        </div>
      </BaseCard>

      <BaseCard v-else>
        <div class="form-row">
          <BaseSelect
            v-model="serviceId"
            label="Prestazione"
            placeholder="Seleziona una prestazione"
            required
          >
            <option v-for="service in services" :key="service.id" :value="String(service.id)">
              {{ service.name }} · {{ formatDuration(service.durationMin) }} ·
              {{ formatPrice(service.price) }}
            </option>
          </BaseSelect>
          <BaseInput v-model="date" type="date" label="Data" :min="minDate" required />
        </div>

        <p v-if="selectedService?.description" class="service-description">
          {{ selectedService.description }}
        </p>

        <div class="results">
          <BaseSpinner v-if="searching" label="Cerco gli orari disponibili…" />
          <BaseAlert v-else-if="searchError" tone="danger">{{ searchError }}</BaseAlert>
          <EmptyState
            v-else-if="hasSearched && !groupedTimes.length"
            icon="calendar"
            title="Nessun orario disponibile"
            description="Prova a scegliere un’altra data: nessun dentista è libero per questa prestazione nel giorno selezionato."
          />
          <template v-else-if="groupedTimes.length">
            <h3 class="results__title">Orari disponibili</h3>
            <p class="results__hint">
              Seleziona un orario: il sistema assegna automaticamente un dentista disponibile.
            </p>
            <BaseAlert v-if="bookingError" tone="danger">{{ bookingError }}</BaseAlert>
            <div class="slots">
              <button
                v-for="slot in groupedTimes"
                :key="slot.startTime"
                type="button"
                class="slot"
                :disabled="booking"
                @click="book(slot.startTime)"
              >
                {{ formatTime(slot.startTime) }}
              </button>
            </div>
          </template>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 0 72px;
  flex: 1;
}

.container--narrow {
  max-width: 720px;
}

.page__header {
  margin-bottom: 28px;
}

.page__header p {
  max-width: 60ch;
}

.form-row {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

.service-description {
  margin-top: 14px;
  font-size: 0.88rem;
  padding: 12px 14px;
  background: var(--color-bg-soft);
  border-radius: var(--radius-sm);
}

.results {
  margin-top: 28px;
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
}

.results__title {
  margin-bottom: 4px;
}

.results__hint {
  font-size: 0.88rem;
  margin-bottom: 16px;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.slot {
  padding: 12px 18px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-border-strong);
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.slot:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.slot:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirmation {
  text-align: center;
}

.confirmation__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-success-bg);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirmation h2 {
  margin-bottom: 4px;
}

.confirmation__details {
  text-align: left;
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
  padding: 18px 20px;
}

.confirmation__details div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.confirmation__details dt {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.confirmation__details dd {
  margin: 0;
  font-weight: 700;
  text-align: right;
}

.confirmation__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
