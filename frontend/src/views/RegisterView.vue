<script setup lang="ts">
import { reactive, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { extractErrorMessage } from '../api/client';
import type { ApiErrorPayload } from '../types';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import IconBase from '../components/ui/IconBase.vue';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  codiceFiscale: '',
  dateOfBirth: '',
  phone: '',
});

const fieldErrors = reactive<Record<string, string>>({});
const formError = ref('');
const loading = ref(false);

const clearErrors = () => {
  formError.value = '';
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
};

const handleSubmit = async () => {
  clearErrors();
  loading.value = true;
  try {
    await auth.register({ ...form, codiceFiscale: form.codiceFiscale.toUpperCase() });
    router.push('/dashboard');
  } catch (e) {
    if (axios.isAxiosError<ApiErrorPayload>(e) && e.response?.data.errors) {
      for (const issue of e.response.data.errors) {
        fieldErrors[issue.path] = issue.message;
      }
      formError.value = 'Controlla i campi evidenziati.';
    } else {
      formError.value = extractErrorMessage(e, 'Registrazione non riuscita');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="container auth-page__inner">
      <BaseCard class="auth-card">
        <div class="auth-card__icon"><IconBase name="tooth" :size="22" /></div>
        <h1>Crea il tuo account</h1>
        <p class="auth-card__subtitle">
          Registrati come paziente per prenotare visite e consultare i tuoi referti.
        </p>

        <form class="stack" style="gap: 16px" @submit.prevent="handleSubmit">
          <BaseAlert v-if="formError" tone="danger">{{ formError }}</BaseAlert>

          <div class="row">
            <BaseInput v-model="form.firstName" label="Nome" required :error="fieldErrors.firstName" />
            <BaseInput v-model="form.lastName" label="Cognome" required :error="fieldErrors.lastName" />
          </div>

          <BaseInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="nome@esempio.it"
            autocomplete="email"
            required
            :error="fieldErrors.email"
          />
          <BaseInput
            v-model="form.password"
            type="password"
            label="Password"
            hint="Almeno 8 caratteri"
            autocomplete="new-password"
            required
            :error="fieldErrors.password"
          />

          <div class="row">
            <BaseInput
              v-model="form.codiceFiscale"
              label="Codice fiscale"
              required
              :error="fieldErrors.codiceFiscale"
            />
            <BaseInput
              v-model="form.dateOfBirth"
              type="date"
              label="Data di nascita"
              required
              :error="fieldErrors.dateOfBirth"
            />
          </div>

          <BaseInput
            v-model="form.phone"
            type="tel"
            label="Telefono"
            placeholder="333 1234567"
            required
            :error="fieldErrors.phone"
          />

          <BaseButton type="submit" block size="lg" :loading="loading">Crea account</BaseButton>
        </form>

        <p class="auth-card__footer">
          Hai già un account?
          <RouterLink to="/login">Accedi</RouterLink>
        </p>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  flex: 1;
  display: flex;
  background: var(--color-bg-soft);
  padding: 48px 0;
}

.auth-page__inner {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 520px;
}

.auth-card__icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.auth-card h1 {
  margin-bottom: 4px;
}

.auth-card__subtitle {
  margin-bottom: 24px;
}

.auth-card__footer {
  margin: 22px 0 0;
  text-align: center;
  font-size: 0.9rem;
}

.auth-card__footer a {
  font-weight: 700;
  text-decoration: none;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 520px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
