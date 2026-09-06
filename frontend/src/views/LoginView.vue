<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { extractErrorMessage } from '../api/client';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import IconBase from '../components/ui/IconBase.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  try {
    await auth.login({ email: email.value, password: password.value });
    const redirect = (route.query.redirect as string) || '/dashboard';
    router.push(redirect);
  } catch (e) {
    error.value = extractErrorMessage(e, 'Credenziali non valide');
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
        <h1>Bentornato</h1>
        <p class="auth-card__subtitle">Accedi per gestire i tuoi appuntamenti e referti.</p>

        <form class="stack" style="gap: 16px" @submit.prevent="handleSubmit">
          <BaseAlert v-if="error" tone="danger">{{ error }}</BaseAlert>

          <BaseInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="nome@esempio.it"
            autocomplete="email"
            required
          />
          <BaseInput
            v-model="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />

          <BaseButton type="submit" block size="lg" :loading="loading">Accedi</BaseButton>
        </form>

        <p class="auth-card__footer">
          Non hai un account?
          <RouterLink to="/registrati">Registrati</RouterLink>
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
  align-items: flex-start;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 420px;
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
</style>
