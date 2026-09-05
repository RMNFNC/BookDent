<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  fetchServices,
  createServiceRequest,
  updateServiceRequest,
} from '../api/services';
import { extractErrorMessage } from '../api/client';
import type { DentalService } from '../types';
import { formatDuration, formatPrice } from '../utils/format';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseTextarea from '../components/ui/BaseTextarea.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import IconBase from '../components/ui/IconBase.vue';

const services = ref<DentalService[]>([]);
const loading = ref(true);
const loadError = ref('');

const showCreate = ref(false);
const createForm = reactive({ name: '', description: '', durationMin: '', price: '' });
const createError = ref('');
const creating = ref(false);

const editing = ref<DentalService | null>(null);
const editForm = reactive({ name: '', description: '', durationMin: '', price: '' });
const editError = ref('');
const saving = ref(false);
const togglingId = ref<number | null>(null);

const load = async () => {
  loading.value = true;
  try {
    services.value = await fetchServices();
  } catch (e) {
    loadError.value = extractErrorMessage(e, 'Impossibile caricare le prestazioni');
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const openCreate = () => {
  Object.assign(createForm, { name: '', description: '', durationMin: '', price: '' });
  createError.value = '';
  showCreate.value = true;
};

const handleCreate = async () => {
  creating.value = true;
  createError.value = '';
  try {
    await createServiceRequest({
      name: createForm.name,
      description: createForm.description || undefined,
      durationMin: createForm.durationMin ? Number(createForm.durationMin) : undefined,
      price: createForm.price ? Number(createForm.price) : undefined,
    });
    showCreate.value = false;
    await load();
  } catch (e) {
    createError.value = extractErrorMessage(e, 'Impossibile creare la prestazione');
  } finally {
    creating.value = false;
  }
};

const openEdit = (service: DentalService) => {
  editing.value = service;
  editForm.name = service.name;
  editForm.description = service.description ?? '';
  editForm.durationMin = service.durationMin ? String(service.durationMin) : '';
  editForm.price = service.price ?? '';
  editError.value = '';
};

const handleEditSave = async () => {
  if (!editing.value) return;
  saving.value = true;
  editError.value = '';
  try {
    const updated = await updateServiceRequest(editing.value.id, {
      name: editForm.name,
      description: editForm.description || undefined,
      durationMin: editForm.durationMin ? Number(editForm.durationMin) : undefined,
      price: editForm.price ? Number(editForm.price) : undefined,
    });
    services.value = services.value.map((s) => (s.id === updated.id ? updated : s));
    editing.value = null;
  } catch (e) {
    editError.value = extractErrorMessage(e, 'Impossibile salvare le modifiche');
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (service: DentalService) => {
  togglingId.value = service.id;
  try {
    const updated = await updateServiceRequest(service.id, { isActive: !service.isActive });
    services.value = services.value.map((s) => (s.id === updated.id ? updated : s));
  } catch (e) {
    loadError.value = extractErrorMessage(e, 'Impossibile aggiornare lo stato');
  } finally {
    togglingId.value = null;
  }
};
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page__header">
        <div>
          <h1>Prestazioni</h1>
          <p>Gestisci il listino delle visite prenotabili dai pazienti.</p>
        </div>
        <BaseButton @click="openCreate">
          <IconBase name="plus" :size="16" />
          Nuova prestazione
        </BaseButton>
      </header>

      <BaseAlert v-if="loadError" tone="danger">{{ loadError }}</BaseAlert>
      <BaseSpinner v-if="loading" />
      <EmptyState v-else-if="!services.length" icon="file-text" title="Nessuna prestazione registrata" />

      <div v-else class="grid">
        <BaseCard v-for="service in services" :key="service.id">
          <div class="service-card__head">
            <h3>{{ service.name }}</h3>
            <BaseBadge :tone="service.isActive ? 'success' : 'neutral'">
              {{ service.isActive ? 'Attiva' : 'Disattivata' }}
            </BaseBadge>
          </div>
          <p v-if="service.description" class="text-muted">{{ service.description }}</p>
          <div class="service-card__meta">
            <span><IconBase name="clock" :size="15" /> {{ formatDuration(service.durationMin) }}</span>
            <span class="service-card__price">{{ formatPrice(service.price) }}</span>
          </div>
          <div class="service-card__actions">
            <BaseButton size="sm" variant="outline" @click="openEdit(service)">
              <IconBase name="edit" :size="15" />
              Modifica
            </BaseButton>
            <BaseButton
              size="sm"
              :variant="service.isActive ? 'danger' : 'secondary'"
              :loading="togglingId === service.id"
              @click="toggleActive(service)"
            >
              {{ service.isActive ? 'Disattiva' : 'Riattiva' }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseModal :open="showCreate" title="Nuova prestazione" @close="showCreate = false">
      <BaseAlert v-if="createError" tone="danger">{{ createError }}</BaseAlert>
      <form class="stack" style="gap: 14px" @submit.prevent="handleCreate">
        <BaseInput v-model="createForm.name" label="Nome" required />
        <BaseTextarea v-model="createForm.description" label="Descrizione (opzionale)" :rows="3" />
        <div class="row">
          <BaseInput v-model="createForm.durationMin" type="number" label="Durata (min)" />
          <BaseInput v-model="createForm.price" type="number" label="Prezzo (€)" />
        </div>
        <BaseButton type="submit" block :loading="creating">Crea prestazione</BaseButton>
      </form>
    </BaseModal>

    <BaseModal :open="!!editing" title="Modifica prestazione" @close="editing = null">
      <BaseAlert v-if="editError" tone="danger">{{ editError }}</BaseAlert>
      <form class="stack" style="gap: 14px" @submit.prevent="handleEditSave">
        <BaseInput v-model="editForm.name" label="Nome" required />
        <BaseTextarea v-model="editForm.description" label="Descrizione" :rows="3" />
        <div class="row">
          <BaseInput v-model="editForm.durationMin" type="number" label="Durata (min)" />
          <BaseInput v-model="editForm.price" type="number" label="Prezzo (€)" />
        </div>
        <BaseButton type="submit" block :loading="saving">Salva modifiche</BaseButton>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 0 72px;
  flex: 1;
}

.page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.page__header p {
  margin: 4px 0 0;
  max-width: 50ch;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.service-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.service-card__head h3 {
  margin: 0;
  font-size: 1.02rem;
}

.service-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 14px;
}

.service-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.service-card__price {
  font-weight: 700;
  color: var(--color-primary-dark);
}

.service-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
