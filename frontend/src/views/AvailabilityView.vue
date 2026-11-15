<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { fetchDoctorSlots, createSlotRequest, deleteSlotRequest } from '../api/doctors';
import { extractErrorMessage } from '../api/client';
import type { AvailabilitySlot } from '../types';
import { formatDate, formatTime, todayLocalDate } from '../utils/format';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import IconBase from '../components/ui/IconBase.vue';

const auth = useAuthStore();
const doctorId = computed(() => auth.doctorId);

const slots = ref<AvailabilitySlot[]>([]);
const loading = ref(true);
const loadError = ref('');

const form = reactive({ date: '', startTime: '', endTime: '' });
const createError = ref('');
const creating = ref(false);

const slotToDelete = ref<AvailabilitySlot | null>(null);
const deleting = ref(false);
const deleteError = ref('');

const minDate = todayLocalDate();

const sortedSlots = computed(() =>
  [...slots.value].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
);

const load = async () => {
  if (!doctorId.value) return;
  loading.value = true;
  try {
    slots.value = await fetchDoctorSlots(doctorId.value);
  } catch (e) {
    loadError.value = extractErrorMessage(e, 'Impossibile caricare gli slot');
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const handleCreate = async () => {
  if (!doctorId.value || !form.date || !form.startTime || !form.endTime) return;
  creating.value = true;
  createError.value = '';
  try {
    const startTime = new Date(`${form.date}T${form.startTime}:00`).toISOString();
    const endTime = new Date(`${form.date}T${form.endTime}:00`).toISOString();
    const slot = await createSlotRequest(doctorId.value, { date: form.date, startTime, endTime });
    slots.value = [...slots.value, slot];
    form.startTime = '';
    form.endTime = '';
  } catch (e) {
    createError.value = extractErrorMessage(e, 'Impossibile creare lo slot');
  } finally {
    creating.value = false;
  }
};

const confirmDelete = async () => {
  if (!doctorId.value || !slotToDelete.value) return;
  deleting.value = true;
  deleteError.value = '';
  try {
    await deleteSlotRequest(doctorId.value, slotToDelete.value.id);
    slots.value = slots.value.filter((s) => s.id !== slotToDelete.value?.id);
    slotToDelete.value = null;
  } catch (e) {
    deleteError.value = extractErrorMessage(e, 'Impossibile eliminare lo slot');
  } finally {
    deleting.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="container container--narrow">
      <header class="page__header">
        <h1>Gestisci disponibilità</h1>
        <p>Aggiungi le fasce orarie in cui sei disponibile: i pazienti potranno prenotarle.</p>
      </header>

      <BaseCard class="form-card">
        <h3>Nuova fascia oraria</h3>
        <BaseAlert v-if="createError" tone="danger">{{ createError }}</BaseAlert>
        <form class="form" @submit.prevent="handleCreate">
          <BaseInput v-model="form.date" type="date" label="Data" :min="minDate" required />
          <BaseInput v-model="form.startTime" type="time" label="Dalle" required />
          <BaseInput v-model="form.endTime" type="time" label="Alle" required />
          <BaseButton type="submit" :loading="creating">
            <IconBase name="plus" :size="16" />
            Aggiungi
          </BaseButton>
        </form>
      </BaseCard>

      <section class="section">
        <h2>I tuoi prossimi slot liberi</h2>
        <BaseSpinner v-if="loading" />
        <BaseAlert v-else-if="loadError" tone="danger">{{ loadError }}</BaseAlert>
        <EmptyState
          v-else-if="!sortedSlots.length"
          icon="calendar"
          title="Nessuno slot disponibile"
          description="Aggiungi una fascia oraria per iniziare a ricevere prenotazioni."
        />
        <div v-else class="list">
          <div v-for="slot in sortedSlots" :key="slot.id" class="slot-row">
            <div class="slot-row__info">
              <IconBase name="calendar" :size="18" />
              <div>
                <strong>{{ formatDate(slot.startTime) }}</strong>
                <span>{{ formatTime(slot.startTime) }} – {{ formatTime(slot.endTime) }}</span>
              </div>
            </div>
            <button class="slot-row__delete" type="button" @click="slotToDelete = slot">
              <IconBase name="trash" :size="17" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <BaseModal :open="!!slotToDelete" title="Eliminare questo slot?" @close="slotToDelete = null">
      <BaseAlert v-if="deleteError" tone="danger">{{ deleteError }}</BaseAlert>
      <p v-if="slotToDelete">
        {{ formatDate(slotToDelete.startTime) }} · {{ formatTime(slotToDelete.startTime) }} –
        {{ formatTime(slotToDelete.endTime) }} non sarà più prenotabile.
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="slotToDelete = null">Annulla</BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="confirmDelete">Elimina</BaseButton>
      </template>
    </BaseModal>
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

.form-card h3 {
  margin-bottom: 16px;
}

.form {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
}

.section {
  margin-top: 32px;
}

.section h2 {
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.slot-row__info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-primary-dark);
}

.slot-row__info strong {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text);
  text-transform: capitalize;
}

.slot-row__info span {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.slot-row__delete {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
}

.slot-row__delete:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

@media (max-width: 640px) {
  .form {
    grid-template-columns: 1fr 1fr;
  }

  .form :deep(button) {
    grid-column: span 2;
  }
}
</style>
