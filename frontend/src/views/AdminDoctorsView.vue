<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchDoctors, createDoctorRequest, updateDoctorRequest } from '../api/doctors';
import { extractErrorMessage } from '../api/client';
import type { DoctorSummary } from '../types';
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

const doctors = ref<DoctorSummary[]>([]);
const loading = ref(true);
const loadError = ref('');

const showCreate = ref(false);
const createForm = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  specialization: '',
  bio: '',
});
const createError = ref('');
const creating = ref(false);

const editing = ref<DoctorSummary | null>(null);
const editForm = reactive({ firstName: '', lastName: '', specialization: '', bio: '' });
const editError = ref('');
const saving = ref(false);
const togglingId = ref<number | null>(null);

const load = async () => {
  loading.value = true;
  try {
    doctors.value = await fetchDoctors();
  } catch (e) {
    loadError.value = extractErrorMessage(e, 'Impossibile caricare i dentisti');
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const openCreate = () => {
  Object.assign(createForm, {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    specialization: '',
    bio: '',
  });
  createError.value = '';
  showCreate.value = true;
};

const handleCreate = async () => {
  creating.value = true;
  createError.value = '';
  try {
    await createDoctorRequest(createForm);
    showCreate.value = false;
    await load();
  } catch (e) {
    createError.value = extractErrorMessage(e, 'Impossibile creare il dentista');
  } finally {
    creating.value = false;
  }
};

const openEdit = (doctor: DoctorSummary) => {
  editing.value = doctor;
  editForm.firstName = doctor.firstName;
  editForm.lastName = doctor.lastName;
  editForm.specialization = doctor.specialization;
  editForm.bio = doctor.bio ?? '';
  editError.value = '';
};

const handleEditSave = async () => {
  if (!editing.value) return;
  saving.value = true;
  editError.value = '';
  try {
    const updated = await updateDoctorRequest(editing.value.id, editForm);
    doctors.value = doctors.value.map((d) => (d.id === updated.id ? updated : d));
    editing.value = null;
  } catch (e) {
    editError.value = extractErrorMessage(e, 'Impossibile salvare le modifiche');
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (doctor: DoctorSummary) => {
  togglingId.value = doctor.id;
  try {
    const updated = await updateDoctorRequest(doctor.id, { isActive: !doctor.isActive });
    doctors.value = doctors.value.map((d) => (d.id === updated.id ? updated : d));
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
          <h1>Dentisti</h1>
          <p>Crea account per il personale medico e gestisci lo stato dei loro profili.</p>
        </div>
        <BaseButton @click="openCreate">
          <IconBase name="plus" :size="16" />
          Nuovo dentista
        </BaseButton>
      </header>

      <BaseAlert v-if="loadError" tone="danger" class="page__alert">{{ loadError }}</BaseAlert>
      <BaseSpinner v-if="loading" />
      <EmptyState v-else-if="!doctors.length" icon="users" title="Nessun dentista registrato" />

      <div v-else class="grid">
        <BaseCard v-for="doctor in doctors" :key="doctor.id" class="doctor-card">
          <div class="doctor-card__head">
            <div>
              <h3>Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h3>
              <p class="text-muted">{{ doctor.specialization }}</p>
            </div>
            <BaseBadge :tone="doctor.isActive ? 'success' : 'neutral'">
              {{ doctor.isActive ? 'Attivo' : 'Disattivato' }}
            </BaseBadge>
          </div>
          <p v-if="doctor.bio" class="doctor-card__bio">{{ doctor.bio }}</p>
          <p class="doctor-card__email">{{ doctor.user?.email }}</p>
          <div class="doctor-card__actions">
            <BaseButton size="sm" variant="outline" @click="openEdit(doctor)">
              <IconBase name="edit" :size="15" />
              Modifica
            </BaseButton>
            <BaseButton
              size="sm"
              :variant="doctor.isActive ? 'danger' : 'secondary'"
              :loading="togglingId === doctor.id"
              @click="toggleActive(doctor)"
            >
              {{ doctor.isActive ? 'Disattiva' : 'Riattiva' }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseModal :open="showCreate" title="Nuovo dentista" @close="showCreate = false">
      <BaseAlert v-if="createError" tone="danger">{{ createError }}</BaseAlert>
      <form class="stack" style="gap: 14px" @submit.prevent="handleCreate">
        <BaseInput v-model="createForm.firstName" label="Nome" required />
        <BaseInput v-model="createForm.lastName" label="Cognome" required />
        <BaseInput v-model="createForm.email" type="email" label="Email" required />
        <BaseInput
          v-model="createForm.password"
          type="password"
          label="Password"
          hint="Almeno 8 caratteri"
          required
        />
        <BaseInput v-model="createForm.specialization" label="Specializzazione" required />
        <BaseTextarea v-model="createForm.bio" label="Bio (opzionale)" :rows="3" />
        <BaseButton type="submit" block :loading="creating">Crea dentista</BaseButton>
      </form>
    </BaseModal>

    <BaseModal :open="!!editing" title="Modifica dentista" @close="editing = null">
      <BaseAlert v-if="editError" tone="danger">{{ editError }}</BaseAlert>
      <form class="stack" style="gap: 14px" @submit.prevent="handleEditSave">
        <BaseInput v-model="editForm.firstName" label="Nome" required />
        <BaseInput v-model="editForm.lastName" label="Cognome" required />
        <BaseInput v-model="editForm.specialization" label="Specializzazione" required />
        <BaseTextarea v-model="editForm.bio" label="Bio" :rows="3" />
        <BaseButton type="submit" block :loading="saving">Salva modifiche</BaseButton>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.page__alert {
  margin-bottom: 20px;
}

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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.doctor-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.doctor-card__head h3 {
  margin-bottom: 2px;
  font-size: 1.02rem;
}

.doctor-card__bio {
  font-size: 0.88rem;
  margin: 12px 0 0;
}

.doctor-card__email {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 8px 0 0;
}

.doctor-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
</style>
